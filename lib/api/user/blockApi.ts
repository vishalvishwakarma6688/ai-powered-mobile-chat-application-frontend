import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

export interface BlockedUser {
    _id: string;
    username: string;
    profilePic: string | null;
    bio?: string;
    blockedAt: string;
}

export interface BlockResponse {
    success: boolean;
    message: string;
}

export interface GetBlockedUsersResponse {
    success: boolean;
    data: BlockedUser[];
}

/**
 * Block a user
 * @param userId - User ID to block
 * @returns Promise with success response
 */
export const blockUserApi = async (userId: string): Promise<BlockResponse> => {
    const response = await apiClient.post(ENDPOINTS.BLOCK.BLOCK(userId));
    return response.data;
};

/**
 * Unblock a user
 * @param userId - User ID to unblock
 * @returns Promise with success response
 */
export const unblockUserApi = async (userId: string): Promise<BlockResponse> => {
    const response = await apiClient.delete(ENDPOINTS.BLOCK.UNBLOCK(userId));
    return response.data;
};

/**
 * Get list of blocked users
 * @returns Promise with blocked users list
 */
export const getBlockedUsersApi = async (): Promise<GetBlockedUsersResponse> => {
    const response = await apiClient.get(ENDPOINTS.BLOCK.GET_BLOCKED);
    return response.data;
};
