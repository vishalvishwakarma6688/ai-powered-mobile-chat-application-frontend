import { useQuery } from '@tanstack/react-query';
import { getMessagesApi, GetMessagesResponse } from '../../api/message/messageApi';

/**
 * Hook for fetching messages for a chat
 * Real-time updates handled by Socket.IO, not polling
 * 
 * Usage:
 *   const { data, isLoading, error, refetch } = useMessages(chatId);
 */
export const useMessages = (chatId: string, page: number = 1, limit: number = 50) => {
    return useQuery<GetMessagesResponse, Error>({
        queryKey: ['messages', chatId, page],
        queryFn: () => getMessagesApi(chatId, page, limit),
        enabled: !!chatId, // Only fetch if chatId exists
        staleTime: 5 * 60 * 1000, // 5 minutes - Socket.IO handles real-time updates
        // NO refetchInterval - Socket.IO will handle real-time updates
    });
};

