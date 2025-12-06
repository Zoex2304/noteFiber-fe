import axios, { type AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { API_CONSTANTS } from '../../constants/api.constants';

export const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: API_CONFIG.HEADERS,
    timeout: API_CONSTANTS.TIMEOUT,
    withCredentials: true, // Important for CORS
});
