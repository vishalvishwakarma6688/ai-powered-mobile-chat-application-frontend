import {
    useMutation,
    useQueryClient,
    type UseMutationOptions,
} from '@tanstack/react-query';

import {
    uploadAndSendDocumentApi,
    type UploadDocumentRequest,
    type UploadDocumentResponse,
} from '../../api/message/documentApi';

import type { GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for uploading and sending documents
 */
export const useUploadAndSendDocument = (
    options?: UseMutationOptions<
        UploadDocumentResponse,
        Error,
        UploadDocumentRequest
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadAndSendDocumentApi,

        onSuccess: (data, variables, context) => {
            // Optimistically update messages cache without refetching
            queryClient.setQueryData<GetMessagesResponse>(
                ['messages', variables.chatId],
                (old) => {
                    if (!old) return old;

                    // Check if message already exists (from Socket.IO)
                    const messageExists = old.data.some(
                        (msg) => msg._id === data.data._id
                    );

                    if (messageExists) {
                        return old;
                    }

                    return {
                        ...old,
                        data: [data.data, ...old.data],
                    };
                }
            );

            // Update chats list
            queryClient.invalidateQueries({
                queryKey: ['chats'],
            });

            // Call external success handler
            options?.onSuccess?.(data, variables, context);
        },

        onError: options?.onError,
    });
};