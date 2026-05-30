import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { starMessageApi, unstarMessageApi, getStarredMessagesApi } from '../../api/message/starApi';
import { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for starring a message
 */
export const useStarMessage = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: string) => starMessageApi(messageId),
        onSuccess: (data, messageId) => {
            // Update message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === messageId) {
                            return {
                                ...msg,
                                starredBy: data.data.starredBy,
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

            // Invalidate starred messages query
            queryClient.invalidateQueries({ queryKey: ['starredMessages'] });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};

/**
 * Hook for unstarring a message
 */
export const useUnstarMessage = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: string) => unstarMessageApi(messageId),
        onSuccess: (data, messageId) => {
            // Update message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === messageId) {
                            return {
                                ...msg,
                                starredBy: data.data.starredBy,
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

            // Invalidate starred messages query
            queryClient.invalidateQueries({ queryKey: ['starredMessages'] });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};

/**
 * Hook for getting starred messages
 */
export const useStarredMessages = (limit: number = 50) => {
    return useQuery({
        queryKey: ['starredMessages', limit],
        queryFn: () => getStarredMessagesApi(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
