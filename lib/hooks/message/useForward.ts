import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forwardMessageApi } from '../../api/message/forwardApi';

/**
 * Hook for forwarding a message to one or more chats
 */
export const useForwardMessage = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, targetChatIds }: { messageId: string; targetChatIds: string[] }) =>
            forwardMessageApi(messageId, targetChatIds),
        onSuccess: (data) => {
            // Invalidate messages for all target chats to show forwarded messages
            data.data.forEach((message) => {
                queryClient.invalidateQueries({ queryKey: ['messages', message.chatId] });
            });

            // Invalidate chats list to update last message
            queryClient.invalidateQueries({ queryKey: ['chats'] });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};
