import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendTextMessageApi, SendMessagePayload, SendMessageResponse, GetMessagesResponse } from '../../api/message/messageApi';
import { useAuthStore } from '../../store/authStore';

/**
 * Hook for sending text messages with optimistic updates
 * 
 * Usage:
 *   const { mutate: sendMessage, isPending } = useSendMessage({
 *     onSuccess: (data) => { ... }
 *   });
 *   sendMessage({ chatId, text });
 */
export const useSendMessage = (options?: {
    onSuccess?: (data: SendMessageResponse) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation<SendMessageResponse, Error, SendMessagePayload>({
        mutationFn: sendTextMessageApi,
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['messages', variables.chatId] });

            // Snapshot the previous value
            const previousMessages = queryClient.getQueryData<GetMessagesResponse>(['messages', variables.chatId, 1]);

            // Optimistically update to the new value
            if (previousMessages && user) {
                const optimisticMessage = {
                    _id: `temp-${Date.now()}`, // Temporary ID
                    chatId: variables.chatId,
                    sender: {
                        _id: user._id,
                        username: user.username,
                        profilePic: user.profilePic || null,
                    },
                    text: variables.text,
                    type: 'text' as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isEdited: false,
                    isDeleted: false,
                    readBy: [],
                    deliveredTo: [],
                };

                // Backend returns messages DESC (newest first), so add at the BEGINNING
                // When reversed in MessageList, it will appear at the bottom
                queryClient.setQueryData<GetMessagesResponse>(
                    ['messages', variables.chatId, 1],
                    {
                        ...previousMessages,
                        data: [optimisticMessage, ...previousMessages.data],
                    }
                );
            }

            // Return context with the snapshot
            return { previousMessages };
        },
        onSuccess: (data, variables) => {
            // Socket.IO will handle adding the real message, so we just need to:
            // 1. Remove temporary message
            // 2. Update chats list
            const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', variables.chatId, 1]);

            if (messagesData) {
                // Remove temporary messages only (Socket.IO will add the real message)
                const filteredMessages = messagesData.data.filter(msg => !msg._id.startsWith('temp-'));

                queryClient.setQueryData<GetMessagesResponse>(
                    ['messages', variables.chatId, 1],
                    {
                        ...messagesData,
                        data: filteredMessages,
                    }
                );
            }

            // Update chats list to show latest message
            queryClient.invalidateQueries({ queryKey: ['chats'] });

            // Call custom onSuccess if provided
            options?.onSuccess?.(data);
        },
        onError: (error, variables, context) => {
            // Rollback to previous state on error
            if (context?.previousMessages) {
                queryClient.setQueryData(
                    ['messages', variables.chatId, 1],
                    context.previousMessages
                );
            }

            // Call custom onError if provided
            options?.onError?.(error);
        },
    });
};
