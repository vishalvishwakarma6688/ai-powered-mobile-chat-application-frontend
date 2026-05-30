import { useQuery } from '@tanstack/react-query';
import { getUserChats } from '../../api/chat/chatApi';

/**
 * Hook to fetch user's chats
 * Real-time updates handled by Socket.IO, not polling
 */
export const useChats = (page: number = 1, limit: number = 20, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['chats', page, limit],
        queryFn: () => getUserChats(page, limit),
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer since Socket.IO handles updates
        enabled, // Allow disabling the query
        retry: 2, // Retry failed requests twice
        retryDelay: 1000, // Wait 1 second between retries
        // NO refetchInterval - Socket.IO will handle real-time updates
    });
};
