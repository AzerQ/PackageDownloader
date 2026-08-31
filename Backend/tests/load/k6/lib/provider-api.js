import { check } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';
import { config } from './config.js';

/**
 * @typedef {import('./config.js').ProviderCase} ProviderCase
 */

/** @type {Rate} Rate of responses that contain a valid provider payload. */
export const providerResponseValid = new Rate('provider_response_valid');

/** @type {Trend} Length of provider response bodies as JavaScript strings. */
export const providerResponseBodyLength = new Trend('provider_response_body_length', true);

/** @type {Trend} Number of common-model records returned by an API call. */
export const providerResultCount = new Trend('provider_result_count', true);

/**
 * Builds a backend URL for a provider case.
 *
 * @param {ProviderCase} testCase Provider and operation definition.
 * @returns {string} Fully-qualified request URL.
 */
function buildUrl(testCase) {
    const commonQuery = `packageType=${encodeURIComponent(testCase.provider)}`;
    if (testCase.kind === 'search') {
        return `${config.baseUrl}/api/PackageInfo/GetSearchResults?${commonQuery}` +
            `&namePart=${encodeURIComponent(testCase.value)}`;
    }

    return `${config.baseUrl}/api/PackageInfo/GetPackageVersions?${commonQuery}` +
        `&packageName=${encodeURIComponent(testCase.value)}` +
        `&maxVersionsCount=${config.maxVersions}`;
}

/**
 * Validates a record mapped to the unified PackageInfo contract.
 *
 * @param {*} value Candidate JSON value.
 * @returns {boolean} True when required common-model fields are present.
 */
function isPackageInfo(value) {
    return value !== null && typeof value === 'object' &&
        typeof value.id === 'string' && value.id.length > 0 &&
        typeof value.currentVersion === 'string' &&
        typeof value.description === 'string' &&
        Array.isArray(value.tags) &&
        typeof value.authorInfo === 'string';
}

/**
 * Validates a record mapped to the common PackageVersion contract.
 *
 * @param {*} value Candidate JSON value.
 * @returns {boolean} True when the required version tag is present.
 */
function isPackageVersion(value) {
    return value !== null && typeof value === 'object' &&
        typeof value.versionTag === 'string' && value.versionTag.length > 0;
}

/**
 * Parses and validates a provider response without throwing from a VU iteration.
 *
 * @param {import('k6/http').RefinedResponse<'text'>} response k6 HTTP response.
 * @param {ProviderCase} testCase Provider operation used to select the expected model.
 * @returns {{valid: boolean, count: number}} Validation result and result count.
 */
function validateResponse(response, testCase) {
    if (response.status !== 200) return { valid: false, count: 0 };

    try {
        const payload = response.json();
        if (!Array.isArray(payload) || payload.length === 0) return { valid: false, count: 0 };

        const validator = testCase.kind === 'search' ? isPackageInfo : isPackageVersion;
        return { valid: payload.every(validator), count: payload.length };
    } catch (_) {
        return { valid: false, count: 0 };
    }
}

/**
 * Executes one provider call, emits low-cardinality metrics, and checks the common response contract.
 *
 * @param {ProviderCase} testCase Provider request selected for this iteration.
 * @returns {void}
 */
export function executeProviderRequest(testCase) {
    const tags = {
        provider: testCase.provider.toLowerCase(),
        endpoint: testCase.kind,
        build: config.buildLabel,
    };
    const response = http.get(buildUrl(testCase), {
        tags: { ...tags, name: testCase.name },
        timeout: '60s',
        responseType: 'text',
    });
    const validation = validateResponse(response, testCase);

    providerResponseValid.add(validation.valid, tags);
    providerResponseBodyLength.add(response.body ? response.body.length : 0, tags);
    providerResultCount.add(validation.count, tags);

    check(response, {
        'provider returned HTTP 200': (result) => result.status === 200,
        'provider returned the expected common model': () => validation.valid,
    }, tags);
}

/**
 * Checks that the backend is running before k6 starts allocating load-test VUs.
 *
 * @returns {boolean} True when the heartbeat endpoint reports a live backend.
 */
export function checkBackendReady() {
    const response = http.get(`${config.baseUrl}/api/Heartbeat/HeartbeatExists`, {
        tags: { name: 'heartbeat', build: config.buildLabel },
        timeout: '10s',
        responseType: 'text',
    });

    try {
        return response.status === 200 && response.json().isAlive === true;
    } catch (_) {
        return false;
    }
}
