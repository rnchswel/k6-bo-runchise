import http from 'k6/http';
import { check } from 'k6';
import { logRequestResponse } from '../../../common/utils.js';
import { DEFAULT_BRAND_UUID } from './env.js';

export function buildInventoryMovementsUrl(baseUrl, queryParams) {
    return `${baseUrl}/report/inventory_movements?${queryParams.join('&')}`;
}

export function buildRequestParams(accessToken, profile, brandUuid) {
    return {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Brand-Uuid': brandUuid,
            accept: 'application/json, text/plain, */*',
            referer: profile.referer,
            origin: profile.origin,
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="152", "Google Chrome";v="152", "Not_A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
        },
        tags: {
            environment: profile.key,
            endpoint: 'inventory_movements',
        },
    };
}

/**
 * GET /report/inventory_movements with checks and optional request/response logging.
 */
export function getInventoryMovements(accessToken, profile, options = {}) {
    const brandUuid = options.brandUuid || __ENV.BRAND_UUID || DEFAULT_BRAND_UUID;
    const logResponses = options.logResponses !== false;

    const url = buildInventoryMovementsUrl(profile.baseUrl, profile.queryParams);
    const params = buildRequestParams(accessToken, profile, brandUuid);

    const timeout = __ENV.HTTP_TIMEOUT || '120s';
    const res = http.get(url, { ...params, timeout });

    if (logResponses) {
        logRequestResponse('GET', url, { headers: params.headers, body: null }, res);
    }

    const checkName = `inventory_movements ${profile.key} status is 200`;
    check(
        res,
        {
            [checkName]: (r) => r.status === 200,
        },
        { environment: profile.key, endpoint: 'inventory_movements' }
    );

    return res;
}
