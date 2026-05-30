import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface SendLocationRequest {
    chatId: string;
    lat: number;
    lng: number;
}

export interface SendLocationResponse {
    success: boolean;
    message: string;
    data: Message;
}

/**
 * Send location message
 */
export const sendLocationApi = async (data: SendLocationRequest): Promise<SendLocationResponse> => {
    console.log('📍 Sending location:', data);
    console.log('📍 Endpoint:', ENDPOINTS.MESSAGES.SEND_LOCATION);

    try {
        const response = await apiClient.post(ENDPOINTS.MESSAGES.SEND_LOCATION, data);
        console.log('✅ Location sent successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Location send error:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Request URL:', error.config?.url);
        throw error;
    }
};
