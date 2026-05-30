import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { blockUserApi, unblockUserApi, getBlockedUsersApi, BlockResponse, GetBlockedUsersResponse } from '../../api/user/blockApi';

/**
 * Hook for blocking a user
 */
export const useBlockUser = (options?: UseMutationOptions<BlockResponse, Error, string>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => blockUserApi(userId),
        onSuccess: (data, variables, context) => {
            // Invalidate blocked users list
            queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
            // Invalidate chats to update UI
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: options?.onError,
    });
};

/**
 * Hook for unblocking a user
 */
export const useUnblockUser = (options?: UseMutationOptions<BlockResponse, Error, string>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => unblockUserApi(userId),
        onSuccess: (data, variables, context) => {
            // Invalidate blocked users list
            queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
            // Invalidate chats to update UI
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: options?.onError,
    });
};

/**
 * Hook for getting blocked users list
 */
export const useBlockedUsers = (options?: Omit<UseQueryOptions<GetBlockedUsersResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: ['blockedUsers'],
        queryFn: () => getBlockedUsersApi(),
        ...options,
    });
};
