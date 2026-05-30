import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addReactionApi, removeReactionApi } from '../../api/message/reactionApi';
import { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for adding reaction to a message
 */
export const useAddReaction = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
            addReactionApi(messageId, emoji),
        onSuccess: (data, variables) => {
            // Optimistically update the message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === variables.messageId) {
                            // Update reactions array
                            return {
                                ...msg,
                                reactions: data.data.reactions || msg.reactions,
                            };
                        }
                        return msg;
                    });

                    queryClient.setQueryData(queryKey, {
                        ...messagesData,
                        data: updatedMessages,
                    });
                }
            });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};

/**
 * Hook for removing reaction from a message
 */
export const useRemoveReaction = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: string) => removeReactionApi(messageId),
        onSuccess: (data, messageId) => {
            // Optimistically update the message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === messageId) {
                            // Update reactions array
                            return {
                                ...msg,
                                reactions: data.data.reactions || msg.reactions,
                            };
                        }
                        return msg;
                    });

                    queryClient.setQueryData(queryKey, {
                        ...messagesData,
                        data: updatedMessages,
                    });
                }
            });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};
