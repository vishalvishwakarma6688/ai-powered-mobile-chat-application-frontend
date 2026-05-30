import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendVoiceNoteApi } from '../../api/message/voiceNoteApi';
import { Alert } from 'react-native';

/**
 * Hook for sending voice note messages
 */
export const useSendVoiceNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            chatId,
            audioUri,
            duration,
            waveform,
        }: {
            chatId: string;
            audioUri: string;
            duration: number;
            waveform: number[];
        }) => sendVoiceNoteApi(chatId, audioUri, duration, waveform),
        onSuccess: (data, variables) => {
            // Invalidate messages query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });

            // Invalidate chats query to update last message
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send voice note');
        },
    });
};
