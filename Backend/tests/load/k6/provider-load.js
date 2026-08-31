import exec from 'k6/execution';
import { config, createScenarios, getProviderCases } from './lib/config.js';
import { checkBackendReady, executeProviderRequest } from './lib/provider-api.js';
import { createSummary } from './lib/summary.js';

/** @type {ReadonlyArray<import('./lib/config.js').ProviderCase>} */
const providerCases = getProviderCases();

/**
 * k6 execution options shared by smoke, controlled-load, and stress profiles.
 * Thresholds are deliberately broad because public upstream providers dominate end-to-end latency.
 */
export const options = {
    scenarios: createScenarios(providerCases.length),
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
        provider_response_valid: ['rate>0.99'],
        dropped_iterations: ['count==0'],
        'http_req_duration{endpoint:search}': ['p(95)<15000'],
        'http_req_duration{endpoint:versions}': ['p(95)<15000'],
    },
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
    tags: { system: 'package-downloader', build: config.buildLabel },
};

/**
 * Verifies backend readiness once before the measured scenarios begin.
 *
 * @returns {{targetUrl: string, buildLabel: string}} Metadata exposed to VU functions.
 * @throws {Error} When the heartbeat endpoint is unavailable.
 */
export function setup() {
    if (!checkBackendReady()) {
        throw new Error(`Backend '${config.baseUrl}' did not pass its heartbeat check.`);
    }
    return { targetUrl: config.baseUrl, buildLabel: config.buildLabel };
}

/**
 * Runs one deterministic provider operation per iteration.
 * The global scenario iteration index keeps the provider mix stable across VUs and test runs.
 *
 * @returns {void}
 */
export function providerRequest() {
    const index = exec.scenario.iterationInTest % providerCases.length;
    executeProviderRequest(providerCases[index]);
}

/**
 * Writes a compact machine-readable summary used by the baseline comparison utility.
 *
 * @param {Object} data Complete k6 end-of-test summary.
 * @returns {Object<string, string>} k6 summary output map.
 */
export function handleSummary(data) {
    return createSummary(data);
}
