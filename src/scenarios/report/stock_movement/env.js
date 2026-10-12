/**
 * Stock movement (inventory_movements) environment profiles.
 * Query strings mirror payload_dev.txt / payload_pentest.txt captures.
 */

export const ENVIRONMENTS = {
    dev: {
        key: 'dev',
        baseUrl: 'https://master-server.runchise.com/api',
        origin: 'https://dev.runchise.com',
        referer: 'https://dev.runchise.com/',
        queryParams: [
            'start_date=04%2F10%2F2026',
            'end_date=10%2F10%2F2026',
            'is_select_all_location=true',
            'show_non_inventory_products=false',
            'page=1',
            'item_per_page=100',
        ],
    },
    pentest: {
        key: 'pentest',
        baseUrl: 'https://pentest-server.runchise.com/api',
        origin: 'https://pentest.runchise.com',
        referer: 'https://pentest.runchise.com/',
        queryParams: [
            'start_date=04%2F10%2F2026',
            'start_time=0',
            'end_date=10%2F10%2F2026',
            'end_time=86340',
            'is_select_all_location=true',
            'show_non_inventory_products=false',
            'page=1',
            'item_per_page=100',
        ],
    },
};

export const DEFAULT_BRAND_UUID = '74dcf826-aaa2-47bd-a341-aac602c544a8';

export function resolveEnvironment(envKey) {
    const key = (envKey || 'pentest').toLowerCase();
    const profile = ENVIRONMENTS[key];
    if (!profile) {
        throw new Error(
            `Unknown STOCK_MOVEMENT_ENV="${envKey}". Use "dev" or "pentest".`
        );
    }
    return profile;
}
