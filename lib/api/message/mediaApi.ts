import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

export interface MediaUploadResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        thumbnailUrl?: string;
        type: 'image' | 'video' | 'audio' | 'document';
        size: number;
        duration?: number;
        mimeType: string;
        fileName?: string;
    };
}

export interface SendMediaMessageResponse {
    success: boolean;
    message: string;
    data: any; // Message object
}

/**
 * Upload image file to server
 * @param uri - Local file URI from image picker
 * @returns Upload response with media URL
 */
export const uploadImageApi = async (uri: string): Promise<MediaUploadResponse> => {
    const formData = new FormData();

    // Extract filename from URI
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
        uri,
        type,
        name: filename,
    } as any);

    const response = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD_IMAGE, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

/**
 * Send media message with uploaded file
 * @param chatId - Chat ID to send message to
 * @param mediaUrl - URL of uploaded media
 * @param mediaType - Type of media (image, video, audio, document)
 * @param caption - Optional caption for the media
 * @returns Message response
 */
export const sendMediaMessageApi = async (
    chatId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'audio' | 'document',
    caption?: string
): Promise<SendMediaMessageResponse> => {
    const response = await apiClient.post(ENDPOINTS.MESSAGES.SEND_MEDIA, {
        chatId,
        mediaUrl,
        mediaType,
        caption,
    });

    return response.data;
};

/**
 * Upload and send image in one request
 * @param chatId - Chat ID to send message to
 * @param uri - Local file URI from image picker
 * @param caption - Optional caption for the image
 * @returns Message response
 */
export const uploadAndSendImageApi = async (
    chatId: string,
    uri: string,
    caption?: string
): Promise<SendMediaMessageResponse> => {
    const formData = new FormData();

    // Extract filename from URI
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append file with field name 'file' (backend expects this)
    formData.append('file', {
        uri,
        type,
        name: filename,
    } as any);

    // Append required fields
    formData.append('chatId', chatId);
    formData.append('type', 'image'); // MESSAGE_TYPES.IMAGE

    if (caption) {
        formData.append('text', caption); // Backend uses 'text' field for caption
    }

    const response = await apiClient.post(ENDPOINTS.MESSAGES.SEND_MEDIA_UPLOAD, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

/**
 * Upload and send video in one request
 * @param chatId - Chat ID to send message to
 * @param uri - Local file URI from video picker
 * @param caption - Optional caption for the video
 * @returns Message response
 */
export const uploadAndSendVideoApi = async (
    chatId: string,
    uri: string,
    caption?: string
): Promise<SendMediaMessageResponse> => {
    const formData = new FormData();

    // Extract filename from URI
    const filename = uri.split('/').pop() || 'video.mp4';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `video/${match[1]}` : 'video/mp4';

    // Append file with field name 'file' (backend expects this)
    formData.append('file', {
        uri,
        type,
        name: filename,
    } as any);

    // Append required fields
    formData.append('chatId', chatId);
    formData.append('type', 'video'); // MESSAGE_TYPES.VIDEO

    if (caption) {
        formData.append('text', caption); // Backend uses 'text' field for caption
    }

    const response = await apiClient.post(ENDPOINTS.MESSAGES.SEND_MEDIA_UPLOAD, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
