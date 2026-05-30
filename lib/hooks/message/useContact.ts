import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import {
    sendContactApi,
    SendContactRequest,
    SendContactResponse,
} from '../../api/message/contactApi';
import { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for sending contact messages (supports both app users and device contacts)
 */
export const useSendContact = (
    options?: UseMutationOptions<SendContactResponse, Error, SendContactRequest>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendContactApi,
        onSuccess: (data, variables) => {
            // Optimistically update messages cache without refetching
            queryClient.setQueryData<GetMessagesResponse>(
                ['messages', variables.chatId],
                (old) => {
                    if (!old) return old;

                    // Check if message already exists (from Socket.IO)
                    const messageExists = old.data.some(msg => msg._id === data.data._id);
                    if (messageExists) {
                        return old; // Don't add duplicate
                    }

                    return {
                        ...old,
                        data: [data.data, ...old.data],
                    };
                }
            );

            options?.onSuccess?.(data, variables, undefined);
        },
        onError: options?.onError,
    });
};
