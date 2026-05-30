import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface DeleteMessageResponse {
    success: boolean;
    message: string;
    data: Message;
}

/**
 * Delete a message
 * @param messageId - The ID of the message to delete
 * @param deleteForEveryone - If true, deletes for all users. If false, deletes only for current user.
 */
export const deleteMessageApi = async (
    messageId: string,
    deleteForEveryone: boolean = false
): Promise<DeleteMessageResponse> => {
    const response = await apiClient.delete(ENDPOINTS.MESSAGES.DELETE(messageId), {
        data: { deleteForEveryone }
    });
    return response.data;
};
