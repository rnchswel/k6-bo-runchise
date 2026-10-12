import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL } from './config.js';

const AUTH_MAX_RETRIES = Number(__ENV.AUTH_RETRIES || 3);
const AUTH_RETRY_DELAY_SECONDS = Number(__ENV.AUTH_RETRY_DELAY_SECONDS || 2);

function isRetryableAuthStatus(status) {
    return status === 0 || status === 429 || status === 502 || status === 503 || status === 504;
}

export function login(baseUrl = BASE_URL, headerOptions = {}) {
    const origin = headerOptions.origin || 'https://pentest.runchise.com';
    const referer = headerOptions.referer || `${origin}/`;

    const url = `${baseUrl}/auth`;
    const payload = JSON.stringify({
        email: __ENV.AUTH_EMAIL || "mweleyam@runchise.com",
        password: __ENV.AUTH_PASSWORD || "testing123"
    });

    const params = {
        headers: {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'origin': origin,
            'referer': referer,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        },
    };

    let res;
    for (let attempt = 1; attempt <= AUTH_MAX_RETRIES; attempt++) {
        res = http.post(url, payload, params);

        const hasToken =
            res.status === 200 && res.json('auth.access_token') !== undefined;

        if (hasToken) {
            check(res, {
                'auth status is 200': (r) => r.status === 200,
                'has access token': (r) => r.json('auth.access_token') !== undefined,
            });
            return res.json('auth.access_token');
        }

        if (!isRetryableAuthStatus(res.status) || attempt === AUTH_MAX_RETRIES) {
            break;
        }

        console.warn(
            `Auth attempt ${attempt}/${AUTH_MAX_RETRIES} failed (HTTP ${res.status}), retrying in ${AUTH_RETRY_DELAY_SECONDS}s...`
        );
        sleep(AUTH_RETRY_DELAY_SECONDS);
    }

    check(res, {
        'auth status is 200': (r) => r.status === 200,
        'has access token': (r) => r.json('auth.access_token') !== undefined,
    });

    throw new Error(`Authentication failed: ${res.status} ${res.body}`);
}
