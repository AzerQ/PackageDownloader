import { config } from './config.js';

/**
 * @typedef {Object} CompactMetric
 * @property {number|null} avg Arithmetic mean when supplied by k6.
 * @property {number|null} med Median when supplied by k6.
 * @property {number|null} p90 90th percentile when supplied by k6.
 * @property {number|null} p95 95th percentile when supplied by k6.
 * @property {number|null} p99 99th percentile when supplied by k6.
 * @property {number|null} rate Event rate when supplied by k6.
 * @property {number|null} count Event count when supplied by k6.
 * @property {number|null} value Counter or gauge value when supplied by k6.
 */

/**
 * Reads a number from k6 metric values while preserving missing data as null.
 *
 * @param {Object} values k6 metric values object.
 * @param {string} key Metric field name.
 * @returns {number|null} Numeric value or null.
 */
function numberOrNull(values, key) {
    return typeof values[key] === 'number' ? values[key] : null;
}

/**
 * Converts a verbose k6 summary metric to a stable comparison shape.
 *
 * @param {Object|undefined} metric Raw k6 metric summary.
 * @returns {CompactMetric} Compact metric values.
 */
function compactMetric(metric) {
    const values = metric && metric.values ? metric.values : {};
    return {
        avg: numberOrNull(values, 'avg'),
        med: numberOrNull(values, 'med'),
        p90: numberOrNull(values, 'p(90)'),
        p95: numberOrNull(values, 'p(95)'),
        p99: numberOrNull(values, 'p(99)'),
        rate: numberOrNull(values, 'rate'),
        count: numberOrNull(values, 'count'),
        value: numberOrNull(values, 'value'),
    };
}

/**
 * Produces a compact JSON result suitable for comparing baseline and optimized runs.
 *
 * @param {Object} data Complete k6 end-of-test summary.
 * @returns {Object<string, string>} k6 output map containing stdout and the result file.
 */
export function createSummary(data) {
    const result = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        label: config.buildLabel,
        targetUrl: config.baseUrl,
        profile: config.profile,
        configuration: {
            rate: config.rate,
            duration: config.duration,
            maxVUs: config.maxVUs,
            maxVersions: config.maxVersions,
            includeDocker: config.includeDocker,
        },
        metrics: {
            httpReqDuration: compactMetric(data.metrics.http_req_duration),
            httpReqWaiting: compactMetric(data.metrics.http_req_waiting),
            httpReqFailed: compactMetric(data.metrics.http_req_failed),
            checks: compactMetric(data.metrics.checks),
            iterations: compactMetric(data.metrics.iterations),
            droppedIterations: compactMetric(data.metrics.dropped_iterations),
            providerResponseValid: compactMetric(data.metrics.provider_response_valid),
            providerResponseBodyLength: compactMetric(data.metrics.provider_response_body_length),
            providerResultCount: compactMetric(data.metrics.provider_result_count),
        },
    };

    const headline = [
        `k6 result: ${config.buildLabel} (${config.profile})`,
        `target: ${config.baseUrl}`,
        `p95: ${result.metrics.httpReqDuration.p95} ms`,
        `failed rate: ${result.metrics.httpReqFailed.rate}`,
        `summary: ${config.resultFile}`,
        '',
    ].join('\n');

    return {
        stdout: headline,
        [config.resultFile]: JSON.stringify(result, null, 2),
    };
}
