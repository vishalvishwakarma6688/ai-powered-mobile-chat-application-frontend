import { useMutation } from '@tanstack/react-query';
import { registerApi, RegisterPayload, AuthResponse } from '../../api/auth/authApi';

/**
 * Hook for user registration.
 *
 * Usage:
 *   const { mutate: register, isPending, isError, error } = useRegister();
 *   register({ username, email, phone, password });
 */
export const useRegister = (options?: {
    onSuccess?: (data: AuthResponse) => void;
    onError?: (error: Error) => void;
}) => {
    return useMutation<AuthResponse, Error, RegisterPayload>({
        mutationFn: registerApi,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });
};
