import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface StarMessageResponse {
    success: boolean;
    message: string;
    data: Message;
}

export interface GetStarredMessagesResponse {
    success: boolean;
    data: Message[];
}

/**
 * Star a message
 */
export const starMessageApi = async (messageId: string): Promise<StarMessageResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADVANCED_MESSAGES.STAR(messageId));
    return response.data;
};

/**
 * Unstar a message
 */
export const unstarMessageApi = async (messageId: string): Promise<StarMessageResponse> => {
    const response = await apiClient.delete(ENDPOINTS.ADVANCED_MESSAGES.UNSTAR(messageId));
    return response.data;
};

/**
 * Get all starred messages
 */
export const getStarredMessagesApi = async (limit: number = 50): Promise<GetStarredMessagesResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADVANCED_MESSAGES.GET_STARRED, {
        params: { limit }
    });
    return response.data;
};
