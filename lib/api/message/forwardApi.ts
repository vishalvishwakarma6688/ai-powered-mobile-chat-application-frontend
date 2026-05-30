import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

/**
 * Forward message to one or more chats
 * @param messageId - Message ID to forward
 * @param targetChatIds - Array of target chat IDs
 * @returns Promise with forwarded messages
 */
export const forwardMessageApi = async (
    messageId: string,
    targetChatIds: string[]
): Promise<{ success: boolean; message: string; data: Message[] }> => {
    const response = await apiClient.post(
        ENDPOINTS.MESSAGES.FORWARD(messageId),
        { targetChatIds }
    );
    return response.data;
};
