/**
 * API Endpoints
 * Maps to the API documentation paths
 */

export const ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        VERIFY_EMAIL: '/auth/verify-email',
        LOGIN: '/auth/login',
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
    },
} as const;
