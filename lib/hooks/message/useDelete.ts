import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMessageApi } from '../../api/message/deleteApi';
import { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for deleting a message
 */
export const useDeleteMessage = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, deleteForEveryone }: { messageId: string; deleteForEveryone: boolean }) =>
            deleteMessageApi(messageId, deleteForEveryone),
        onSuccess: (data, variables) => {
            // Update message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    if (variables.deleteForEveryone) {
                        // For "delete for everyone", mark message as deleted
                        const updatedMessages = messagesData.data.map(msg => {
                            if (msg._id === variables.messageId) {
                                return {
                                    ...msg,
                                    isDeleted: true,
                                    text: 'This message was deleted',
                                };
                            }
                            return msg;
                        });

                        queryClient.setQueryData(queryKey, {
                            ...messagesData,
                            data: updatedMessages,
                        });
                    } else {
                        // For "delete for me", remove message from cache
                        const updatedMessages = messagesData.data.filter(
                            msg => msg._id !== variables.messageId
                        );

                        queryClient.setQueryData(queryKey, {
                            ...messagesData,
                            data: updatedMessages,
                        });
                    }
                }
            });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};
