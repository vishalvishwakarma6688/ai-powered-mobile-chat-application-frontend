import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleMessageApi, getScheduledMessagesApi, cancelScheduledMessageApi } from '../../api/message/scheduleApi';
import { Alert } from 'react-native';

/**
 * Hook for scheduling a message
 */
export const useScheduleMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, text, scheduledFor }: { chatId: string; text: string; scheduledFor: string }) =>
            scheduleMessageApi(chatId, text, scheduledFor),
        onSuccess: (data, variables) => {
            // Invalidate scheduled messages query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['scheduledMessages', variables.chatId] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to schedule message');
        },
    });
};

/**
 * Hook for getting scheduled messages for a chat
 */
export const useScheduledMessages = (chatId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['scheduledMessages', chatId],
        queryFn: () => getScheduledMessagesApi(chatId),
        enabled: enabled && !!chatId,
        staleTime: 30000, // Cache for 30 seconds
    });
};

/**
 * Hook for canceling a scheduled message
 */
export const useCancelScheduledMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: string) => cancelScheduledMessageApi(messageId),
        onSuccess: (_, messageId) => {
            // Invalidate all scheduled messages queries
            queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel scheduled message');
        },
    });
};
