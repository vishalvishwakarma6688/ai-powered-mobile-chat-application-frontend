import { useQuery } from '@tanstack/react-query';
import { searchUsersApi, SearchUsersResponse } from '../../api/search/searchApi';

/**
 * Hook for searching users
 * 
 * Usage:
 *   const { data, isLoading, error } = useSearchUsers(searchQuery);
 */
export const useSearchUsers = (query: string, enabled: boolean = true) => {
    return useQuery<SearchUsersResponse, Error>({
        queryKey: ['searchUsers', query],
        queryFn: () => searchUsersApi(query),
        enabled: enabled && query.trim().length > 0, // Only search if query is not empty
        staleTime: 30 * 1000, // Cache for 30 seconds
        retry: 1,
    });
};
