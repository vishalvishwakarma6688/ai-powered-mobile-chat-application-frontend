import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface UploadDocumentRequest {
    chatId: string;
    uri: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    caption?: string;
}

export interface UploadDocumentResponse {
    success: boolean;
    message: string;
    data: Message;
}

/**
 * Upload and send document
 */
export const uploadAndSendDocumentApi = async (
    data: UploadDocumentRequest
): Promise<UploadDocumentResponse> => {
    console.log('📄 Uploading document:', data.fileName);

    const formData = new FormData();
    formData.append('chatId', data.chatId);
    formData.append('type', 'file');

    // Append the file
    const file: any = {
        uri: data.uri,
        name: data.fileName,
        type: data.mimeType,
    };
    formData.append('file', file);

    // Append caption if provided
    if (data.caption) {
        formData.append('text', data.caption);
    }

    try {
        const response = await apiClient.post(ENDPOINTS.MESSAGES.SEND_MEDIA_UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('✅ Document uploaded successfully');
        return response.data;
    } catch (error: any) {
        console.error('❌ Document upload error:', error);
        console.error('❌ Error response:', error.response?.data);
        throw error;
    }
};
