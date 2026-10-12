import { sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { login } from '../../../common/auth.js';
import { BASE_URL } from '../../../common/config.js';
import { getTimestampString } from '../../../common/utils.js';
import { resolveEnvironment } from './env.js';
import { getInventoryMovements } from './request.js';

const profile = resolveEnvironment(__ENV.STOCK_MOVEMENT_ENV || 'pentest');
const activeBaseUrl = __ENV.BASE_URL || profile.baseUrl;

export const options = {
    vus: Number(__ENV.VUS || 1),
    duration: __ENV.DURATION || '30s',
    thresholds: {
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
        'http_req_duration{endpoint:inventory_movements}': [
            `p(95)<${Number(__ENV.P95_MS || 60000)}`,
        ],
    },
};

export function setup() {
    console.log(`\n🎯 Stock Movement — env: ${profile.key}`);
    console.log(`   API: ${activeBaseUrl}\n`);

    const token = login(activeBaseUrl, {
        origin: profile.origin,
        referer: profile.referer,
    });

    return { token, profile: { ...profile, baseUrl: activeBaseUrl } };
}

export default function (data) {
    getInventoryMovements(data.token, data.profile, {
        logResponses: __ENV.LOG_RESPONSES !== 'false',
    });
    sleep(Number(__ENV.SLEEP_SECONDS || 1));
}

export function handleSummary(data) {
    const timestamp = getTimestampString();
    const reportName = `reports/StockMovement_${profile.key}_${timestamp}.html`;

    return {
        [reportName]: htmlReport(data, {
            title: `Stock Movement (${profile.key}) — ${activeBaseUrl}`,
        }),
    };
}
