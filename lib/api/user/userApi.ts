import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

export interface User {
    _id: string;
    username: string;
    email: string;
    profilePic?: string;
    bio?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export interface GetAllUsersResponse {
    success: boolean;
    data: User[];
}

/**
 * Get all users (for contact sharing)
 */
export const getAllUsersApi = async (): Promise<GetAllUsersResponse> => {
    const { data } = await apiClient.get<GetAllUsersResponse>(ENDPOINTS.SEARCH.USERS, {
        params: { q: '' } // Empty query to get all users
    });
    return data;
};
