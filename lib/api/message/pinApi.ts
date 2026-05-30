import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface PinMessageResponse {
    success: boolean;
    message: string;
    data: Message;
}

export interface GetPinnedMessagesResponse {
    success: boolean;
    data: Message[];
}

/**
 * Pin a message
 */
export const pinMessageApi = async (messageId: string): Promise<PinMessageResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADVANCED_MESSAGES.PIN(messageId));
    return response.data;
};

/**
 * Unpin a message
 */
export const unpinMessageApi = async (messageId: string): Promise<PinMessageResponse> => {
    const response = await apiClient.delete(ENDPOINTS.ADVANCED_MESSAGES.UNPIN(messageId));
    return response.data;
};

/**
 * Get all pinned messages for a chat
 */
export const getPinnedMessagesApi = async (chatId: string): Promise<GetPinnedMessagesResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADVANCED_MESSAGES.GET_PINNED(chatId));
    return response.data;
};
