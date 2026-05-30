import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchUser {
    _id: string;
    username: string;
    email: string;
    phone: string;
    profilePic: string | null;
    bio: string;
    isOnline: boolean;
    lastSeen: string;
}

export interface SearchUsersResponse {
    success: boolean;
    data: SearchUser[];
}

export interface GlobalSearchResponse {
    success: boolean;
    data: {
        users: SearchUser[];
        chats: any[];
        messages: any[];
        total: number;
    };
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Search users by username
 */
export const searchUsersApi = async (query: string, limit: number = 50): Promise<SearchUsersResponse> => {
    const { data } = await apiClient.get<SearchUsersResponse>(ENDPOINTS.SEARCH.USERS, {
        params: { q: query, limit },
    });
    return data;
};

/**
 * Global search (users, chats, messages)
 */
export const globalSearchApi = async (query: string, limit: number = 20): Promise<GlobalSearchResponse> => {
    const { data } = await apiClient.get<GlobalSearchResponse>(ENDPOINTS.SEARCH.GLOBAL, {
        params: { q: query, limit },
    });
    return data;
};
