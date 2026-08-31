#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_PATH="${ENV_FILE:-$SCRIPT_DIR/.env}"
[[ "$ENV_PATH" = /* ]] || ENV_PATH="$SCRIPT_DIR/$ENV_PATH"

load_dotenv() {
    local path="$1" line key value
    [[ -f "$path" ]] || { echo "Environment file was not found: $path" >&2; exit 1; }
    while IFS= read -r line || [[ -n "$line" ]]; do
        line="${line%$'\r'}"
        [[ -z "${line//[[:space:]]/}" || "$line" =~ ^[[:space:]]*# ]] && continue
        [[ "$line" == *"="* ]] || { echo "Invalid .env line: $line" >&2; exit 1; }
        key="${line%%=*}"; value="${line#*=}"
        key="$(printf '%s' "$key" | xargs)"; value="$(printf '%s' "$value" | xargs)"
        [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || { echo "Invalid .env key: $key" >&2; exit 1; }
        if [[ ${#value} -ge 2 && (( "${value:0:1}" == '"' && "${value: -1}" == '"' ) ||
              ( "${value:0:1}" == "'" && "${value: -1}" == "'" )) ]]; then
            value="${value:1:${#value}-2}"
        fi
        export "$key=$value"
    done < "$path"
}

required() { local name="$1"; [[ -n "${!name:-}" ]] || { echo "Required .env value '$name' is missing." >&2; exit 1; }; }
resolve_path() { [[ "$1" = /* ]] && printf '%s\n' "$1" || printf '%s/%s\n' "$SCRIPT_DIR" "$1"; }

load_dotenv "$ENV_PATH"
for name in TARGET_URL BUILD_LABEL PROFILE RATE DURATION PRE_ALLOCATED_VUS MAX_VUS MAX_VERSIONS \
    INCLUDE_DOCKER RESULT_ROOT K6_BIN K6_SCRIPT K6_SUMMARY_FILE K6_LOG_FILE WARMUP_ENABLED \
    WARMUP_PROFILE WARMUP_SUMMARY_FILE WARMUP_LOG_FILE START_BACKEND BACKEND_PROJECT BACKEND_DLL \
    BACKEND_CONFIGURATION BUILD_BACKEND BACKEND_PID STARTUP_TIMEOUT_SECONDS DOTNET_BIN \
    COUNTERS_LAUNCHER COUNTERS_AUTO_CONFIRM COUNTERS SAMPLE_INTERVAL_SECONDS COUNTER_START_TIMEOUT_SECONDS COLLECTOR_START_DELAY_SECONDS \
    COUNTERS_FILE PROCESS_SAMPLES_FILE BACKEND_LOG_FILE NODE_BIN RESOURCE_SUMMARIZER \
    RESOURCE_SUMMARY_FILE K6_WEB_DASHBOARD K6_HTML_REPORT_FILE; do required "$name"; done

RUN_ID="${RUN_ID:-$(date -u +%Y%m%d-%H%M%S)}"
RESULT_DIR="$(resolve_path "$RESULT_ROOT")/$BUILD_LABEL-$RUN_ID"
[[ ! -e "$RESULT_DIR" ]] || { echo "Result directory already exists: $RESULT_DIR" >&2; exit 1; }
mkdir -p "$RESULT_DIR"
cp "$ENV_PATH" "$RESULT_DIR/run.env"

K6_SUMMARY="$RESULT_DIR/$K6_SUMMARY_FILE"; K6_LOG="$RESULT_DIR/$K6_LOG_FILE"
WARMUP_SUMMARY="$RESULT_DIR/$WARMUP_SUMMARY_FILE"; WARMUP_LOG="$RESULT_DIR/$WARMUP_LOG_FILE"
COUNTER_FILE="$RESULT_DIR/$COUNTERS_FILE"; PROCESS_FILE="$RESULT_DIR/$PROCESS_SAMPLES_FILE"
RESOURCE_SUMMARY="$RESULT_DIR/$RESOURCE_SUMMARY_FILE"; BACKEND_LOG="$RESULT_DIR/$BACKEND_LOG_FILE"
BACKEND_OWNED=false; BACKEND_PROCESS_PID=""; COUNTERS_PID=""; SAMPLER_PID=""; K6_EXIT=1

cleanup() {
    set +e
    if [[ -n "$COUNTERS_PID" ]] && kill -0 "$COUNTERS_PID" 2>/dev/null; then
        kill -INT "$COUNTERS_PID"
        for _ in {1..15}; do kill -0 "$COUNTERS_PID" 2>/dev/null || break; sleep 1; done
        kill -TERM "$COUNTERS_PID" 2>/dev/null || true; wait "$COUNTERS_PID" 2>/dev/null
    fi
    if [[ -n "$SAMPLER_PID" ]] && kill -0 "$SAMPLER_PID" 2>/dev/null; then
        kill -TERM "$SAMPLER_PID"; wait "$SAMPLER_PID" 2>/dev/null
    fi
    if [[ "$BACKEND_OWNED" == true && -n "$BACKEND_PROCESS_PID" ]] && kill -0 "$BACKEND_PROCESS_PID" 2>/dev/null; then
        kill -TERM "$BACKEND_PROCESS_PID"; wait "$BACKEND_PROCESS_PID" 2>/dev/null
    fi
}
trap cleanup EXIT
trap 'exit 130' INT TERM

wait_backend() {
    local deadline=$((SECONDS + STARTUP_TIMEOUT_SECONDS))
    until curl --fail --silent --max-time 3 "${TARGET_URL%/}/api/Heartbeat/HeartbeatExists" | grep -q '"isAlive":true'; do
        (( SECONDS < deadline )) || { echo "Backend startup timed out." >&2; return 1; }
        sleep 0.5
    done
}

run_k6() {
    local profile="$1" summary="$2" log="$3"
    "$K6_BIN" run \
        -e "TARGET_URL=$TARGET_URL" -e "BUILD_LABEL=$BUILD_LABEL" -e "PROFILE=$profile" \
        -e "RATE=$RATE" -e "DURATION=$DURATION" -e "PRE_ALLOCATED_VUS=$PRE_ALLOCATED_VUS" \
        -e "MAX_VUS=$MAX_VUS" -e "MAX_VERSIONS=$MAX_VERSIONS" -e "INCLUDE_DOCKER=$INCLUDE_DOCKER" \
        -e "RESULT_FILE=$summary" "$(resolve_path "$K6_SCRIPT")" 2>&1 | tee "$log"
}

sample_process() {
    local pid="$1" output="$2" cpu cpu_raw rss vsz threads private_kb private_bytes
    local cpu_count="$(getconf _NPROCESSORS_ONLN 2>/dev/null || nproc 2>/dev/null || echo 1)"
    printf 'timestamp_utc,cpu_percent,working_set_bytes,private_memory_bytes,virtual_memory_bytes,thread_count\n' > "$output"
    while kill -0 "$pid" 2>/dev/null; do
        cpu_raw="$(ps -p "$pid" -o %cpu= 2>/dev/null | xargs || true)"
        cpu="$(awk -v value="${cpu_raw:-0}" -v cores="$cpu_count" 'BEGIN { printf "%.4f", value / cores }')"
        rss="$(ps -p "$pid" -o rss= 2>/dev/null | xargs || true)"
        vsz="$(ps -p "$pid" -o vsz= 2>/dev/null | xargs || true)"
        threads="$(ps -p "$pid" -o nlwp= 2>/dev/null | xargs || ps -p "$pid" -o thcount= 2>/dev/null | xargs || true)"
        private_kb="$(awk '/^RssAnon:/ { print $2 }' "/proc/$pid/status" 2>/dev/null || true)"
        private_bytes=""; [[ -z "$private_kb" ]] || private_bytes="$((private_kb * 1024))"
        [[ -n "$cpu_raw" && -n "$rss" ]] || break
        printf '%s,%s,%s,%s,%s,%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$cpu" "$((rss * 1024))" "$private_bytes" \
            "$((vsz * 1024))" "${threads:-0}" >> "$output"
        sleep "$SAMPLE_INTERVAL_SECONDS"
    done
}

if [[ "$START_BACKEND" == true ]]; then
    PROJECT_PATH="$(resolve_path "$BACKEND_PROJECT")"; DLL_PATH="$(resolve_path "$BACKEND_DLL")"
    if [[ "$BUILD_BACKEND" == true ]]; then "$DOTNET_BIN" build "$PROJECT_PATH" --configuration "$BACKEND_CONFIGURATION"; fi
    [[ -f "$DLL_PATH" ]] || { echo "Backend DLL was not found: $DLL_PATH" >&2; exit 1; }
    "$DOTNET_BIN" exec "$DLL_PATH" --urls "$TARGET_URL" > "$BACKEND_LOG" 2>&1 &
    BACKEND_PROCESS_PID=$!; BACKEND_OWNED=true
else
    BACKEND_PROCESS_PID="$BACKEND_PID"
    kill -0 "$BACKEND_PROCESS_PID" 2>/dev/null || { echo "Backend PID is not running: $BACKEND_PROCESS_PID" >&2; exit 1; }
fi
wait_backend

if [[ "$WARMUP_ENABLED" == true ]]; then run_k6 "$WARMUP_PROFILE" "$WARMUP_SUMMARY" "$WARMUP_LOG"; fi

COUNTER_COMMAND=("$COUNTERS_LAUNCHER")
[[ -z "${COUNTERS_TOOL:-}" ]] || COUNTER_COMMAND+=("$COUNTERS_TOOL")
[[ -z "${COUNTERS_PACKAGE:-}" ]] || COUNTER_COMMAND+=("$COUNTERS_PACKAGE")
[[ "$COUNTERS_AUTO_CONFIRM" == true ]] && COUNTER_COMMAND+=(--yes)
COUNTER_COMMAND+=(collect --process-id "$BACKEND_PROCESS_PID" --refresh-interval "$SAMPLE_INTERVAL_SECONDS" \
    --format csv --output "$COUNTER_FILE" --counters "$COUNTERS")
"${COUNTER_COMMAND[@]}" > "$RESULT_DIR/counters.log" 2>&1 & COUNTERS_PID=$!
COUNTER_DEADLINE=$((SECONDS + COUNTER_START_TIMEOUT_SECONDS))
while [[ ! -f "$COUNTER_FILE" ]]; do
    kill -0 "$COUNTERS_PID" 2>/dev/null || { echo "dotnet-counters exited before collection started." >&2; exit 1; }
    (( SECONDS < COUNTER_DEADLINE )) || { echo "Timed out waiting for dotnet-counters output." >&2; exit 1; }
    sleep 0.25
done
sample_process "$BACKEND_PROCESS_PID" "$PROCESS_FILE" & SAMPLER_PID=$!
sleep "$COLLECTOR_START_DELAY_SECONDS"
kill -0 "$COUNTERS_PID" 2>/dev/null || { echo "dotnet-counters exited before the load test." >&2; exit 1; }

if [[ "$K6_WEB_DASHBOARD" == true ]]; then
    export K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_OPEN=false K6_WEB_DASHBOARD_PORT=-1
    export K6_WEB_DASHBOARD_EXPORT="$RESULT_DIR/$K6_HTML_REPORT_FILE"
fi

set +e
run_k6 "$PROFILE" "$K6_SUMMARY" "$K6_LOG"
K6_EXIT=${PIPESTATUS[0]}
set -e
cleanup
trap - EXIT INT TERM

"$NODE_BIN" "$(resolve_path "$RESOURCE_SUMMARIZER")" "$PROCESS_FILE" "$COUNTER_FILE" "$RESOURCE_SUMMARY"
echo "Results: $RESULT_DIR"
exit "$K6_EXIT"
