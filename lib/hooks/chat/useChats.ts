import { useQuery } from '@tanstack/react-query';
import { getUserChats } from '../../api/chat/chatApi';
import { dbSaveChats } from '../../db/database';

/**
 * Hook to fetch user's chats with WhatsApp-style instant local storage & SQLite background sync.
 */
export const useChats = (page: number = 1, limit: number = 20, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['chats', page, limit],
        queryFn: async () => {
            const response = await getUserChats(page, limit);
            if (response?.data) {
                dbSaveChats(response.data);
            }
            return response;
        },
        staleTime: 5 * 60 * 1000,
        enabled,
        retry: 2,
        retryDelay: 1000,
        networkMode: 'offlineFirst',
    });
};
