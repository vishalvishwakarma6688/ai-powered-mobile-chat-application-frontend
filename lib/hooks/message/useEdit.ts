import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editMessageApi } from '../../api/message/editApi';
import { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for editing a message
 */
export const useEditMessage = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, text }: { messageId: string; text: string }) =>
            editMessageApi(messageId, text),
        onSuccess: (data, variables) => {
            // Update message in cache
            const chatsData = queryClient.getQueriesData<GetMessagesResponse>({ queryKey: ['messages'] });

            chatsData.forEach(([queryKey, messagesData]) => {
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === variables.messageId) {
                            return {
                                ...msg,
                                text: variables.text,
                                isEdited: true,
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
