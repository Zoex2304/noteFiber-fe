import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
import { type ApiResponse } from '../../types/response.types';
import type {
    UserCancellationRequest,
    UserCancellationResponse,
    UserCancellationListItem,
} from './cancellation.types';

export const cancellationService = {
    /**
     * Request a subscription cancellation
     */
    requestCancellation: async (data: UserCancellationRequest): Promise<ApiResponse<UserCancellationResponse>> => {
        const response = await apiClient.post<ApiResponse<UserCancellationResponse>>(
            ENDPOINTS.USER.CANCELLATION_REQUEST,
            data
        );
        return response.data;
    },

    /**
     * Get user's cancellation request history
     */
    getCancellationHistory: async (): Promise<ApiResponse<UserCancellationListItem[]>> => {
        const response = await apiClient.get<ApiResponse<UserCancellationListItem[]>>(
            ENDPOINTS.USER.CANCELLATION_HISTORY
        );
        return response.data;
    },
};
