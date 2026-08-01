import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance configured for WhatsApp-style offline capability & instant load times.
 * - networkMode: 'offlineFirst' -> returns cached disk data immediately when offline or online.
 * - gcTime: 7 days -> keeps stored chats/messages in local device disk cache across app restarts.
 * - staleTime: 5 minutes -> reduces redundant network calls while keeping data updated in background.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days (formerly cacheTime)
            networkMode: 'offlineFirst',
        },
        mutations: {
            retry: 0,
            networkMode: 'offlineFirst',
        },
    },
});
