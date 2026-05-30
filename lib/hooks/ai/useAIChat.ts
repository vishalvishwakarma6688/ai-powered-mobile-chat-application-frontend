import { useMutation, useQuery } from '@tanstack/react-query';
import { getAIBot, getOrCreateAIChat, sendMessageToAI } from '../../api/ai/aiApi';

/**
 * Hook to get AI bot information
 */
export const useAIBot = () => {
    return useQuery({
        queryKey: ['aiBot'],
        queryFn: getAIBot,
        staleTime: Infinity, // AI bot info doesn't change
    });
};

/**
 * Hook to get or create AI chat
 */
export const useAIChat = () => {
    return useQuery({
        queryKey: ['aiChat'],
        queryFn: getOrCreateAIChat,
        retry: 3, // Retry 3 times on failure
        retryDelay: 1000, // Wait 1 second between retries
    });
};

/**
 * Hook to send message to AI
 */
export const useSendAIMessage = () => {
    return useMutation({
        mutationFn: async ({
            message,
            chatId,
            onChunk,
            onComplete,
            onError,
        }: {
            message: string;
            chatId: string;
            onChunk: (content: string) => void;
            onComplete: () => void;
            onError: (error: string) => void;
        }) => {
            await sendMessageToAI(message, chatId, onChunk, onComplete, onError);
        },
    });
};
