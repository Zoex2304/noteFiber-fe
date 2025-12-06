import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
import { type ApiResponse } from '../../types/response.types';
import * as Types from './auth.types';

export const authService = {
    register: async (data: Types.RegisterRequest): Promise<ApiResponse<Types.RegisterData>> => {
        const response = await apiClient.post<ApiResponse<Types.RegisterData>>(ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    verifyEmail: async (data: Types.VerifyEmailRequest): Promise<ApiResponse<null>> => {
        const response = await apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.VERIFY_EMAIL, data);
        return response.data;
    },

    login: async (data: Types.LoginRequest): Promise<ApiResponse<Types.LoginData>> => {
        const response = await apiClient.post<ApiResponse<Types.LoginData>>(ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    forgotPassword: async (data: Types.ForgotPasswordRequest): Promise<ApiResponse<null>> => {
        const response = await apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
        return response.data;
    },

    resetPassword: async (data: Types.ResetPasswordRequest): Promise<ApiResponse<null>> => {
        const response = await apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.RESET_PASSWORD, data);
        return response.data;
    },

    // Helper for Google Auth - usually this is a redirect, but if we need an API call:
    // getGoogleUrl: ...
};
