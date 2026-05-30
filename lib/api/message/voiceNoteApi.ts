import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface VoiceNoteData {
    duration: number;
    waveform: number[];
}

export interface SendVoiceNoteResponse {
    success: boolean;
    message: string;
    data: Message;
}

/**
 * Upload and send voice note message
 * @param chatId - Chat ID
 * @param audioUri - Local audio file URI
 * @param duration - Duration in seconds
 * @param waveform - Waveform data array
 * @returns Promise with sent message
 */
export const sendVoiceNoteApi = async (
    chatId: string,
    audioUri: string,
    duration: number,
    waveform: number[]
): Promise<SendVoiceNoteResponse> => {
    // Create form data
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('type', 'audio');
    formData.append('duration', duration.toString());
    formData.append('waveform', JSON.stringify(waveform));

    // Add audio file
    const filename = audioUri.split('/').pop() || 'audio.m4a';
    formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: filename,
    } as any);

    const response = await apiClient.post(
        ENDPOINTS.MESSAGES.SEND_MEDIA_UPLOAD,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};

/**
 * Add/update waveform data for a voice note
 * @param messageId - Message ID
 * @param waveform - Waveform data array
 * @returns Promise with updated message
 */
export const updateWaveformApi = async (
    messageId: string,
    waveform: number[]
): Promise<{ success: boolean; message: string; data: Message }> => {
    const response = await apiClient.post(
        ENDPOINTS.ADVANCED_MESSAGES.WAVEFORM(messageId),
        { waveform }
    );
    return response.data;
};
