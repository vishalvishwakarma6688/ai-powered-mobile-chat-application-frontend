import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getBlockedUsersApi } from '../../api/user/blockApi';

/**
 * Hook to check if a specific user is blocked
 * @param userId - User ID to check
 */
export const useIsUserBlocked = (
    userId: string | undefined,
    options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['blockStatus', userId],
        queryFn: async () => {
            if (!userId) return false;

            // Get all blocked users and check if this user is in the list
            const response = await getBlockedUsersApi();
            return response.data.some(blockedUser => blockedUser._id === userId);
        },
        enabled: !!userId,
        ...options,
    });
};
