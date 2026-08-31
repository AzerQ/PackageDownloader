# Нагрузочные тесты PackageDownloader

Этот каталог содержит воспроизводимый benchmark-harness для сравнения baseline и optimized сборок backend. Во время одного измеряемого прогона одновременно собираются:

- end-to-end метрики k6: latency, throughput, HTTP errors, checks и dropped iterations;
- CLR/.NET метрики через `dotnet-counters`: managed heap, allocation, GC collections/pause, LOH/POH, thread pool, exceptions и runtime CPU time;
- метрики процесса через операционную систему: CPU %, working set, private/virtual memory и количество потоков;
- HTML-отчёт k6, компактные JSON summaries и исходные CSV для повторного анализа.

Все изменяемые параметры находятся в `.env`-файлах. PowerShell и Bash launchers не принимают параметры теста через аргументы командной строки.

## Важные ограничения

API обращается к публичным NPM, NuGet, VS Code Marketplace и, опционально, Docker Hub. Поэтому тест является end-to-end проверкой всей системы, а не изолированным benchmark только `System.Text.Json`. На результат влияют сеть, DNS, TLS, кэши поставщиков и rate limits.

Чтобы отличить изменение backend от внешнего шума:

1. Используйте одинаковую машину и ОС для обоих вариантов.
2. Не запускайте baseline и optimized одновременно: они будут конкурировать за CPU и сеть.
3. Используйте один и тот же `.env`, меняя только target/build paths, port и label.
4. Чередуйте порядок: baseline → optimized → optimized → baseline.
5. Сделайте минимум пять измеряемых пар и сравнивайте медиану пар.
6. Не включайте Docker для основного сравнения: один Docker search создаёт до 11 внешних запросов.

CPU PowerShell и Bash нормализован на количество логических процессоров, то есть приблизительный предел процесса — 100%. Несмотря на это, результаты разных ОС сравнивать между собой не следует: платформенные memory accounting и реализация `ps` отличаются.

## Структура

| Файл | Назначение |
|---|---|
| `provider-load.js` | Основной k6-сценарий и thresholds. |
| `lib/config.js` | Чтение параметров k6 из `__ENV`, provider cases и load profiles. |
| `lib/provider-api.js` | HTTP-запросы и проверка общей модели `PackageInfo`/`PackageVersion`. |
| `lib/summary.js` | Компактный `k6-summary.json`. |
| `run-load-test.ps1` | Полный launcher для Windows PowerShell 5.1+ и PowerShell 7. |
| `run-load-test.sh` | Полный launcher для Linux/macOS Bash. |
| `summarize-resources.mjs` | Агрегация process и CLR CSV в `resource-summary.json`. |
| `compare-results.mjs` | Таблица baseline/optimized для k6, CPU и памяти. |
| `.env.example` | Полный локальный шаблон со всеми параметрами. |
| `.env.baseline.example` | Шаблон baseline worktree. |
| `.env.optimized.example` | Шаблон optimized worktree. |
| `results/` | Локальные результаты; JSON и отчёты не попадают в Git. |

## Что происходит при запуске

Launcher выполняет последовательность:

1. Загружает и валидирует `.env`.
2. Создаёт уникальный каталог `results/<BUILD_LABEL>-<RUN_ID>`.
3. При `START_BACKEND=true` собирает backend в Release и запускает скомпилированный DLL через `dotnet exec`. PID принадлежит приложению, а не промежуточному `dotnet run`.
4. Ждёт успешный `/api/Heartbeat/HeartbeatExists`.
5. Выполняет smoke warmup, который не входит в измеряемые counters.
6. Одновременно запускает OS process sampler и `dotnet-counters collect`.
7. После небольшой задержки запускает измеряемый k6 profile.
8. По завершении k6 корректно останавливает collectors и запущенный backend.
9. Строит `resource-summary.json` и сохраняет исходные артефакты.

При ошибке или `Ctrl+C` launcher старается остановить только те процессы, которые запустил сам. Если используется `START_BACKEND=false`, внешний backend не завершается.

## Требования

- .NET SDK 10.0 или новее.
- [Grafana k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
- Node.js 20+ для summaries и comparison.
- Git, если используются worktrees.
- Windows: Windows PowerShell 5.1+ или PowerShell 7.
- Linux/macOS: Bash, `curl`, `ps`, `awk`, `grep`, `xargs`.

Начиная с .NET SDK 10, `dotnet-counters` можно запускать одноразово через `dnx`; это значение уже стоит в шаблонах:

```text
COUNTERS_LAUNCHER=dotnet
COUNTERS_TOOL=dnx
COUNTERS_PACKAGE=dotnet-counters
COUNTERS_AUTO_CONFIRM=true
```

Если установлен global tool, используйте:

```text
COUNTERS_LAUNCHER=dotnet-counters
COUNTERS_TOOL=
COUNTERS_PACKAGE=
COUNTERS_AUTO_CONFIRM=false
```

Global tool при необходимости устанавливается командой:

```shell
dotnet tool install --global dotnet-counters
```

`dotnet-counters` должен запускаться от того же пользователя, что и backend. На Linux/macOS процессы также должны использовать совместимый `TMPDIR`.

## Подготовка baseline и optimized

Самый чистый вариант — два Git worktree. Команды выполняются из корня репозитория `PackageDownloader`, а пути можно изменить:

```powershell
git worktree add ../PackageDownloader-baseline master
git worktree add ../PackageDownloader-optimized optimize-provider-deserialization
```

Тестовые launchers достаточно запускать из optimized worktree. В baseline `.env` укажите абсолютные пути к проекту и DLL baseline worktree. Пример для Windows:

```text
BACKEND_PROJECT=C:/Develop/PackageDownloader-baseline/Backend/PackageDownloader.API/PackageDownloader.API.csproj
BACKEND_DLL=C:/Develop/PackageDownloader-baseline/Backend/PackageDownloader.API/bin/Release/net10.0/PackageDownloader.API.dll
```

Пример для Linux:

```text
BACKEND_PROJECT=/work/PackageDownloader-baseline/Backend/PackageDownloader.API/PackageDownloader.API.csproj
BACKEND_DLL=/work/PackageDownloader-baseline/Backend/PackageDownloader.API/bin/Release/net10.0/PackageDownloader.API.dll
```

## Создание `.env`

Перейдите в каталог тестов:

```powershell
Set-Location Backend/tests/load/k6
```

Создайте локальные файлы; они игнорируются Git:

```powershell
Copy-Item .env.baseline.example .env.baseline
Copy-Item .env.optimized.example .env.optimized
```

Для Bash:

```bash
cd Backend/tests/load/k6
cp .env.baseline.example .env.baseline
cp .env.optimized.example .env.optimized
```

Заполните абсолютные baseline paths. У optimized-шаблона относительные пути уже указывают на текущий worktree.

Формат parser намеренно простой и одинаковый на обеих платформах:

- одна строка — `KEY=value`;
- пустые строки и строки с `#` игнорируются;
- значения можно заключить в одинарные или двойные кавычки;
- interpolation вида `${HOME}` не выполняется;
- inline comments после значения не поддерживаются;
- `.env` должен быть доверенным конфигурационным файлом.

## Все параметры `.env`

### Идентификация

| Переменная | Описание |
|---|---|
| `TARGET_URL` | URL backend. Должен совпадать с портом запускаемого процесса. |
| `BUILD_LABEL` | `baseline`, `optimized` или другое имя отчёта. |
| `RUN_ID` | Суффикс каталога результата. Пустое значение означает UTC timestamp. |

### Нагрузочный профиль

| Переменная | Описание |
|---|---|
| `PROFILE` | `smoke`, `load` или `stress`. Для сравнения рекомендуется `load`. |
| `RATE` | Итераций в секунду. Одна итерация — один backend request. |
| `DURATION` | Длительность основного этапа в формате k6, например `2m`. |
| `PRE_ALLOCATED_VUS` | VUs, выделяемые заранее для arrival-rate. |
| `MAX_VUS` | Верхний предел VUs. Автоматически не может быть меньше preallocated. |
| `MAX_VERSIONS` | Максимум версий, запрашиваемых у provider API. |
| `INCLUDE_DOCKER` | `true` добавляет Docker search/versions; по умолчанию `false`. |
| `K6_BIN` | Имя или полный путь к executable k6. |
| `K6_SCRIPT` | Путь к JS относительно каталога тестов или absolute path. |
| `K6_WEB_DASHBOARD` | Создавать ли HTML-отчёт встроенного web dashboard. |
| `K6_HTML_REPORT_FILE` | Имя HTML-отчёта внутри каталога прогона. |

Профили:

- `smoke`: один последовательный запрос каждой provider operation;
- `load`: фиксированный open-model `constant-arrival-rate`;
- `stress`: ramp-up до `RATE`, удержание в течение `DURATION`, ramp-down.

Для публичных поставщиков начните с `RATE=2`. Увеличивайте только после стабильного прогона без HTTP 429/5xx и dropped iterations.

### Warmup

| Переменная | Описание |
|---|---|
| `WARMUP_ENABLED` | Выполнять предварительный прогрев перед collectors. |
| `WARMUP_PROFILE` | Обычно `smoke`. Warmup summary сохраняется отдельно. |

Warmup прогревает JIT, JSON metadata, DNS/TLS и connection pools. Его результаты нельзя смешивать с измеряемым прогоном.

### Backend process

| Переменная | Описание |
|---|---|
| `START_BACKEND` | `true`: launcher сам запускает backend; `false`: подключается к `BACKEND_PID`. |
| `BUILD_BACKEND` | Выполнять Release build перед запуском. |
| `BACKEND_PROJECT` | `.csproj` нужного worktree. |
| `BACKEND_DLL` | DLL того же worktree и configuration. |
| `BACKEND_CONFIGURATION` | Обычно `Release`. |
| `BACKEND_PID` | PID внешнего процесса при `START_BACKEND=false`; иначе `0`. |
| `STARTUP_TIMEOUT_SECONDS` | Сколько ждать heartbeat. |
| `DOTNET_BIN` | Имя или путь к `dotnet`. |

### Resource collection

| Переменная | Описание |
|---|---|
| `COUNTERS_LAUNCHER` | `dotnet` для portable dnx или `dotnet-counters` для global tool. |
| `COUNTERS_TOOL` | `dnx` для portable-вызова; пусто для global tool. |
| `COUNTERS_PACKAGE` | `dotnet-counters` для portable-вызова; пусто для global tool. |
| `COUNTERS_AUTO_CONFIRM` | Передавать `--yes` в dnx для non-interactive загрузки tool. |
| `COUNTERS` | Providers/instruments dotnet-counters. По умолчанию весь `System.Runtime`. |
| `SAMPLE_INTERVAL_SECONDS` | Частота CLR и process samples. Рекомендуется `1`. |
| `COUNTER_START_TIMEOUT_SECONDS` | Максимальное ожидание attach/start `dotnet-counters`. |
| `COLLECTOR_START_DELAY_SECONDS` | Пауза после attach collectors и до k6. |
| `NODE_BIN` | Имя или путь к Node.js. |
| `RESOURCE_SUMMARIZER` | Путь к resource summarizer. |

### Файлы результатов

| Переменная | Назначение |
|---|---|
| `RESULT_ROOT` | Корневой каталог прогонов. |
| `K6_SUMMARY_FILE` | Компактные агрегаты k6. |
| `K6_LOG_FILE` | Полный stdout/stderr k6. |
| `WARMUP_SUMMARY_FILE` | Summary прогрева. |
| `WARMUP_LOG_FILE` | Лог прогрева. |
| `COUNTERS_FILE` | Сырые CLR counters в CSV. |
| `PROCESS_SAMPLES_FILE` | CPU/memory samples процесса в CSV. |
| `RESOURCE_SUMMARY_FILE` | Агрегированные CPU/memory/CLR series. |
| `BACKEND_LOG_FILE` | stdout backend; stderr пишется рядом на PowerShell. |

## Запуск PowerShell

Launcher выбирает `.env` через переменную `ENV_FILE`:

```powershell
$env:ENV_FILE = '.env.baseline'
.\run-load-test.ps1

$env:ENV_FILE = '.env.optimized'
.\run-load-test.ps1
```

Если `ENV_FILE` не задан, используется `.env`.

## Запуск Bash

```bash
ENV_FILE=.env.baseline ./run-load-test.sh
ENV_FILE=.env.optimized ./run-load-test.sh
```

При первом checkout может понадобиться executable bit:

```bash
chmod +x run-load-test.sh
```

Либо запускайте явно:

```bash
ENV_FILE=.env.optimized bash run-load-test.sh
```

## Подключение к уже запущенному backend

Измените `.env`:

```text
START_BACKEND=false
BUILD_BACKEND=false
BACKEND_PID=12345
TARGET_URL=http://127.0.0.1:5094
```

PID должен принадлежать непосредственно `PackageDownloader.API`, а не оболочке, IDE или `dotnet run`. Launcher соберёт counters, но не завершит внешний процесс.

## Артефакты одного прогона

```text
results/optimized-20260819-210500/
├── run.env
├── backend.log
├── k6.log
├── k6-summary.json
├── k6-report.html
├── warmup.log
├── warmup-summary.json
├── process-samples.csv
├── runtime-counters.csv
├── counters.log                 # Bash
└── resource-summary.json
```

`run.env` фиксирует конфигурацию. Не добавляйте секреты в load-test `.env`: файл копируется в results.

## Сравнение baseline и optimized

Передайте k6 summaries и, опционально, resource summaries:

```powershell
node compare-results.mjs `
  results/baseline-20260819-210000/k6-summary.json `
  results/optimized-20260819-210500/k6-summary.json `
  results/baseline-20260819-210000/resource-summary.json `
  results/optimized-20260819-210500/resource-summary.json
```

Bash:

```bash
node compare-results.mjs \
  results/baseline-20260819-210000/k6-summary.json \
  results/optimized-20260819-210500/k6-summary.json \
  results/baseline-20260819-210000/resource-summary.json \
  results/optimized-20260819-210500/resource-summary.json
```

Положительное `Improvement, %` означает, что optimized лучше. Для latency, CPU и memory используется правило «меньше — лучше»; для throughput и valid rate — «больше — лучше».

## Интерпретация метрик

### k6

- `HTTP duration p95`: 95% запросов завершились не медленнее этого времени.
- `HTTP waiting p95`: приближение времени ожидания первого байта; полезнее total duration для server-side сравнения.
- `Iteration rate`: фактически завершённые итерации/сек.
- `Dropped iterations`: k6 не смог выдержать arrival rate. Такой прогон нельзя считать стабильным.
- `Failed request rate`: сетевые и HTTP-ошибки.
- `Valid response rate`: доля ответов, соответствующих общей модели.

### Process CPU/memory

- `cpuPercent.avg/p95`: загрузка CPU backend, нормализованная на logical CPUs.
- `workingSetBytes.p95/max`: физическая память процесса, включая managed и native memory.
- `privateMemoryBytes`: память, приватно выделенная процессу. На macOS может отсутствовать.
- `virtualMemoryBytes`: адресное пространство, не равно фактическому RAM consumption.
- `threadCount`: рост может указывать на blocking I/O или thread-pool pressure.

### CLR/GC

В `resource-summary.json` поле `runtimeCounters` содержит все series из `System.Runtime`. Суффикс `:: Metric` обозначает gauge/cumulative metric, а `:: Rate` — значение за интервал. Для gauges используйте `avg`, `p95` и `max`; для действительно cumulative metrics — `delta`. У Rate-серий сравнивайте `avg`/`p95`, а `sum` при `SAMPLE_INTERVAL_SECONDS=1` приблизительно показывает общий объём событий за прогон.

Ключевые instruments современных .NET runtime:

- `dotnet.gc.heap.total_allocated`: allocation bytes за интервал; сравнивайте `avg`/`p95` и `sum` при одинаковой длительности и количестве запросов;
- `dotnet.gc.collections`: Gen0/Gen1/Gen2 collections;
- `dotnet.gc.pause.time`: суммарное время GC pauses;
- `dotnet.gc.last_collection.heap.size`: размер поколений после collection;
- `dotnet.gc.last_collection.heap.fragmentation.size`: fragmentation;
- `dotnet.process.memory.working_set`: CLR view физической памяти;
- `dotnet.process.cpu.time`: cumulative user/system CPU seconds;
- `dotnet.thread_pool.queue.length`: очередь thread pool;
- `dotnet.thread_pool.thread.count`: thread-pool threads.

Имена зависят от runtime. Старые EventCounters могут называться `Allocation Rate`, `% Time in GC`, `GC Heap Size`, `Gen 0 GC Count`, `LOH Size` и `Working Set`.

Признаки улучшения десериализации при одинаковой workload:

- меньше `dotnet.gc.heap.total_allocated` avg/p95/sum;
- ниже или стабильнее working set p95/max;
- меньше Gen0/Gen1 collections, без роста Gen2;
- ниже суммарный GC pause (`sum` для Rate или `delta` для cumulative metric) и time-in-GC;
- ниже CPU avg/p95;
- latency p95 не ухудшилась, valid response rate остался 100%.

Не делайте вывод только по maximum working set: GC может удерживать сегменты heap для повторного использования. Allocation rate/sum, GC frequency и p95 обычно информативнее одного max.

## Threshold failures и диагностика

- `HTTP 429`: уменьшите `RATE`; поставщик применил rate limiting.
- `dropped_iterations > 0`: увеличьте `MAX_VUS` или уменьшите `RATE`.
- heartbeat timeout: проверьте `TARGET_URL`, backend log и занятость порта.
- attach timeout dotnet-counters: проверьте PID, пользователя, architecture и `TMPDIR` на Unix.
- counters CSV пустой: увеличьте `COLLECTOR_START_DELAY_SECONDS`, длительность или проверьте `COUNTERS`.
- summary отсутствует после `Ctrl+C`: collectors могли не успеть flush; повторите прогон с корректным завершением.
- разные profile/configuration: сравнение недействительно; сверяйте `run.env`.

## Рекомендуемый эксперимент

1. `PROFILE=smoke`: добиться 100% valid responses.
2. `PROFILE=load`, `RATE=2`, `DURATION=2m`: выполнить baseline и optimized.
3. Если нет 429/5xx/drops, увеличить до `RATE=5`.
4. Для каждого rate выполнить минимум пять чередующихся пар.
5. Сравнить k6 table, process table, allocation Rate series и сумму GC collections.
6. Отдельно выполнить `INCLUDE_DOCKER=true` с `RATE=1` только при необходимости.

Такой порядок даёт сначала проверку корректности, затем устойчивую нагрузку и только после этого поиск предела системы.
