import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

/**
 * Edit a message
 * @param messageId - Message ID to edit
 * @param text - New message text
 * @returns Promise with edited message data
 */
export const editMessageApi = async (messageId: string, text: string): Promise<any> => {
    const response = await apiClient.put(ENDPOINTS.MESSAGES.EDIT(messageId), { text });
    return response.data;
};
