import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { setAutoDeleteApi, cancelAutoDeleteApi, SetAutoDeleteResponse } from '../../api/message/autoDeleteApi';

/**
 * Hook for setting auto-delete timer on a message
 */
export const useSetAutoDelete = (options?: UseMutationOptions<SetAutoDeleteResponse, Error, { messageId: string; duration: number }>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, duration }: { messageId: string; duration: number }) =>
            setAutoDeleteApi(messageId, duration),
        onSuccess: (data, variables, context) => {
            // Invalidate messages query to refresh
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: options?.onError,
    });
};

/**
 * Hook for canceling auto-delete timer on a message
 */
export const useCancelAutoDelete = (options?: UseMutationOptions<SetAutoDeleteResponse, Error, string>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: string) => cancelAutoDeleteApi(messageId),
        onSuccess: (data, variables, context) => {
            // Invalidate messages query to refresh
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: options?.onError,
    });
};
