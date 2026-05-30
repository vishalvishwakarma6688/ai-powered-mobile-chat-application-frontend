import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { uploadImageApi, uploadAndSendImageApi, uploadAndSendVideoApi, MediaUploadResponse, SendMediaMessageResponse } from '../../api/message/mediaApi';

/**
 * Hook to upload image file
 */
export const useUploadImage = (
    options?: Omit<UseMutationOptions<MediaUploadResponse, Error, string>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: uploadImageApi,
        ...options,
    });
};

/**
 * Hook to upload and send image message
 */
export const useUploadAndSendImage = (
    options?: Omit<
        UseMutationOptions<
            SendMediaMessageResponse,
            Error,
            { chatId: string; uri: string; caption?: string }
        >,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, uri, caption }) => uploadAndSendImageApi(chatId, uri, caption),
        onSuccess: (data, variables) => {
            // Invalidate messages query to refetch and show new message
            queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });

            // Invalidate chats query to update last message
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
        ...options,
    });
};

/**
 * Hook to upload and send video message
 */
export const useUploadAndSendVideo = (
    options?: Omit<
        UseMutationOptions<
            SendMediaMessageResponse,
            Error,
            { chatId: string; uri: string; caption?: string }
        >,
        'mutationFn'
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, uri, caption }) => uploadAndSendVideoApi(chatId, uri, caption),
        onSuccess: (data, variables) => {
            // Invalidate messages query to refetch and show new message
            queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });

            // Invalidate chats query to update last message
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
        ...options,
    });
};
