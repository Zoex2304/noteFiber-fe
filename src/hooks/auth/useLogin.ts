import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/services/auth/auth.service';
import { type LoginRequest, type LoginData } from '../../api/services/auth/auth.types';
import { type ApiResponse } from '../../api/types/response.types';
import { useAuth } from './useAuth';
import { type ApiError } from '../../api/types/error.types';

export const useLogin = () => {
    const { login } = useAuth();

    return useMutation<ApiResponse<LoginData>, ApiError, LoginRequest>({
        mutationFn: (data) => authService.login(data),
        onSuccess: (response) => {
            // response.data contains { access_token, user }
            if (response.data) {
                login(response.data.access_token, response.data.user);
            }
        },
    });
};
