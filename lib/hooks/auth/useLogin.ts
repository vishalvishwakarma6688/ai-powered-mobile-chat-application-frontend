import { useMutation } from '@tanstack/react-query';
import { loginApi, LoginPayload, AuthResponse } from '../../api/auth/authApi';

/**
 * Hook for user login.
 *
 * Usage:
 *   const { mutate: login, isPending, isError, error } = useLogin();
 *   login({ username, password });
 */
export const useLogin = (options?: {
    onSuccess?: (data: AuthResponse) => void;
    onError?: (error: Error) => void;
}) => {
    return useMutation<AuthResponse, Error, LoginPayload>({
        mutationFn: loginApi,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });
};
