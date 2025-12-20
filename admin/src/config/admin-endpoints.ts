export const ADMIN_ENDPOINTS = {
    DASHBOARD: {
        STATS: '/admin/dashboard',
        GROWTH: '/admin/growth',
        TRANSACTIONS: '/admin/transactions',
    },
    PLANS: {
        LIST: '/admin/plans',
        DETAIL: (id: string) => `/admin/plans/${id}`,
        CREATE: '/admin/plans',
        UPDATE: (id: string) => `/admin/plans/${id}`,
        DELETE: (id: string) => `/admin/plans/${id}`,
    },
    USERS: {
        LIST: '/admin/users',
        DETAIL: (id: string) => `/admin/users/${id}`,
        UPDATE_STATUS: (id: string) => `/admin/users/${id}/status`,
        UPDATE_PROFILE: (id: string) => `/admin/users/${id}`,
        DELETE: (id: string) => `/admin/users/${id}`,
    },
    LOGS: {
        LIST: '/admin/logs',
        DETAIL: (id: string) => `/admin/logs/${id}`,
    },
    REFUNDS: {
        LIST: '/admin/refunds',
        DETAIL: (id: string) => `/admin/refunds/${id}`,
        APPROVE: (id: string) => `/admin/refunds/${id}/approve`,
        REJECT: (id: string) => `/admin/refunds/${id}/reject`,
        PROCESS_LEGACY: '/admin/subscriptions/refund',
        UPGRADE_SUBSCRIPTION: '/admin/subscriptions/upgrade',
    },
} as const;
