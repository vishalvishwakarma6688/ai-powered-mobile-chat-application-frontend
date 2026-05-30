import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOneOnOneChat, CreateChatResponse } from '../../api/chat/chatApi';

/**
 * Hook for creating one-on-one chat
 * 
 * Usage:
 *   const { mutate: createChat, isPending } = useCreateChat({
 *     onSuccess: (data) => { ... }
 *   });
 *   createChat(userId);
 */
export const useCreateChat = (options?: {
    onSuccess?: (data: CreateChatResponse) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<CreateChatResponse, Error, string>({
        mutationFn: createOneOnOneChat,
        onSuccess: (data) => {
            // Invalidate chats query to refresh the chat list
            queryClient.invalidateQueries({ queryKey: ['chats'] });

            // Call the provided onSuccess callback
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
};
