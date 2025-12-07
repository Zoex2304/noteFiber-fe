import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
import { type ApiResponse } from '../../types/response.types';
import * as Types from './payment.types';

export const paymentService = {
    getPlans: async (): Promise<ApiResponse<Types.Plan[]>> => {
        const response = await apiClient.get<ApiResponse<Types.Plan[]>>(ENDPOINTS.PAYMENT.PLANS);
        return response.data;
    },

    checkout: async (data: Types.CheckoutRequest): Promise<ApiResponse<Types.CheckoutResponse>> => {
        const response = await apiClient.post<ApiResponse<Types.CheckoutResponse>>(ENDPOINTS.PAYMENT.CHECKOUT, data);
        return response.data;
    },

    getOrderSummary: async (planId: string): Promise<ApiResponse<Types.OrderSummaryResponse>> => {
        const response = await apiClient.get<ApiResponse<Types.OrderSummaryResponse>>(ENDPOINTS.PAYMENT.SUMMARY, {
            params: { plan_id: planId }
        });
        return response.data;
    },

    getSubscriptionStatus: async (): Promise<ApiResponse<Types.SubscriptionStatusResponse>> => {
        const response = await apiClient.get<ApiResponse<Types.SubscriptionStatusResponse>>(ENDPOINTS.PAYMENT.STATUS);
        return response.data;
    }
};
