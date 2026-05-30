import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance.
 * Import this wherever you need direct cache access outside of hooks.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Don't refetch on window focus (not relevant in RN, but good to be explicit)
            refetchOnWindowFocus: false,
            // Retry failed requests once before surfacing the error
            retry: 1,
            // Data is considered fresh for 30 seconds
            staleTime: 30 * 1000,
        },
        mutations: {
            retry: 0,
        },
    },
});
