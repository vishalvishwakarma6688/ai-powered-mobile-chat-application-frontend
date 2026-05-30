import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pinMessageApi, unpinMessageApi, getPinnedMessagesApi } from '../../api/message/pinApi';
import { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for pinning a message
 */
export const usePinMessage = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: string) => pinMessageApi(messageId),
        onSuccess: (data, messageId) => {
            // Update message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === messageId) {
                            return {
                                ...msg,
                                isPinned: true,
                                pinnedBy: data.data.pinnedBy,
                                pinnedAt: data.data.pinnedAt,
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

            // Invalidate pinned messages query
            const chatId = data.data.chatId;
            queryClient.invalidateQueries({ queryKey: ['pinnedMessages', chatId] });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};

/**
 * Hook for unpinning a message
 */
export const useUnpinMessage = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: string) => unpinMessageApi(messageId),
        onSuccess: (data, messageId) => {
            // Update message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === messageId) {
                            return {
                                ...msg,
                                isPinned: false,
                                pinnedBy: undefined,
                                pinnedAt: undefined,
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

            // Invalidate pinned messages query
            const chatId = data.data.chatId;
            queryClient.invalidateQueries({ queryKey: ['pinnedMessages', chatId] });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};

/**
 * Hook for getting pinned messages
 */
export const usePinnedMessages = (chatId: string) => {
    return useQuery({
        queryKey: ['pinnedMessages', chatId],
        queryFn: () => getPinnedMessagesApi(chatId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!chatId,
    });
};
