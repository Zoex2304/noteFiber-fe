/**
 * API Endpoints
 * Maps to the API documentation paths
 */

export const ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        VERIFY_EMAIL: '/auth/verify-email',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        GOOGLE: '/auth/google',
        GOOGLE_CALLBACK: '/auth/google/callback',
    },
    USER: {
        PROFILE: '/user/profile',
        ACCOUNT: '/user/account',
    },
    LOCATION: {
        DETECT_COUNTRY: '/location/detect-country',
        CITIES: '/location/cities',
        STATES: '/location/states',
        ZIPCODES: '/location/zipcodes',
    },
    PAYMENT: {
        PLANS: '/payment/plans',
        CHECKOUT: '/payment/checkout',
        SUMMARY: '/payment/summary',
    },
} as const;
