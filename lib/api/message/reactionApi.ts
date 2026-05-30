import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

export interface AddReactionPayload {
    emoji: string;
}

export interface ReactionResponse {
    success: boolean;
    message: string;
    data: any;
}

/**
 * Add reaction to a message
 */
export const addReactionApi = async (messageId: string, emoji: string): Promise<ReactionResponse> => {
    const response = await apiClient.post(ENDPOINTS.MESSAGES.REACT(messageId), { emoji });
    return response.data;
};

/**
 * Remove reaction from a message
 */
export const removeReactionApi = async (messageId: string): Promise<ReactionResponse> => {
    const response = await apiClient.delete(ENDPOINTS.MESSAGES.REACT(messageId));
    return response.data;
};
