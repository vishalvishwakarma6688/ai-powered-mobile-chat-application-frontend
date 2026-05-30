import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getAllUsersApi, GetAllUsersResponse } from '../../api/user/userApi';

/**
 * Hook for getting all users (for contact sharing)
 */
export const useGetAllUsers = (
    options?: Omit<UseQueryOptions<GetAllUsersResponse, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['users', 'all'],
        queryFn: getAllUsersApi,
        ...options,
    });
};
