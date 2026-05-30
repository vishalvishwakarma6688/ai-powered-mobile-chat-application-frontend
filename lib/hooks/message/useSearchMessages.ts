import { useQuery } from '@tanstack/react-query';
import { searchMessagesApi } from '../../api/message/searchApi';

/**
 * Hook for searching messages across all chats
 */
export const useSearchMessages = (query: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['searchMessages', query],
        queryFn: () => searchMessagesApi(query, 50),
        enabled: enabled && query.trim().length > 0, // Only search if query is not empty
        staleTime: 30000, // Cache for 30 seconds
    });
};
