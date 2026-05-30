import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface SearchMessagesResponse {
    success: boolean;
    data: Message[];
}

/**
 * Search messages across all user's chats
 * @param query - Search query string
 * @param limit - Maximum number of results (default: 50)
 * @returns Promise with search results
 */
export const searchMessagesApi = async (
    query: string,
    limit: number = 50
): Promise<SearchMessagesResponse> => {
    const response = await apiClient.get(ENDPOINTS.MESSAGES.SEARCH, {
        params: { q: query, limit }
    });
    return response.data;
};
