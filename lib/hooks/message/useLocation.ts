import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { sendLocationApi, SendLocationRequest, SendLocationResponse } from '../../api/message/locationApi';
import { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for sending location messages
 */
export const useSendLocation = (
    options?: UseMutationOptions<SendLocationResponse, Error, SendLocationRequest>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendLocationApi,
        onSuccess: (data, variables) => {
            // Update messages cache
            queryClient.setQueryData<GetMessagesResponse>(
                ['messages', variables.chatId],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: [data.data, ...old.data],
                    };
                }
            );

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });

            options?.onSuccess?.(data, variables, undefined);
        },
        onError: options?.onError,
    });
};
