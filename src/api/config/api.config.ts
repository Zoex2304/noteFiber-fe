/**
 * API Configuration
 * Centralized configuration for API client
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_CONFIG = {
    BASE_URL,
    HEADERS: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
} as const;
