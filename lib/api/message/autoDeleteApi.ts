import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface SetAutoDeleteResponse {
    success: boolean;
    message: string;
    data: Message;
}

/**
 * Set auto-delete timer for a message
 * @param messageId - Message ID
 * @param duration - Duration in seconds (e.g., 86400 for 24 hours)
 * @returns Promise with updated message
 */
export const setAutoDeleteApi = async (
    messageId: string,
    duration: number
): Promise<SetAutoDeleteResponse> => {
    const response = await apiClient.post(
        ENDPOINTS.ADVANCED_MESSAGES.AUTO_DELETE(messageId),
        { seconds: duration } // Backend expects 'seconds' not 'duration'
    );
    return response.data;
};

/**
 * Cancel auto-delete timer for a message
 * @param messageId - Message ID
 * @returns Promise with updated message
 */
export const cancelAutoDeleteApi = async (
    messageId: string
): Promise<SetAutoDeleteResponse> => {
    const response = await apiClient.delete(
        ENDPOINTS.ADVANCED_MESSAGES.AUTO_DELETE(messageId)
    );
    return response.data;
};
