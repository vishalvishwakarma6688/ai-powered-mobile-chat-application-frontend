import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { Message } from './messageApi';

export interface ContactData {
    name: string;
    phoneNumber?: string;
    userId?: string; // If sharing an app user
}

export interface SendContactRequest {
    chatId: string;
    contacts: ContactData[];
}

export interface SendContactResponse {
    success: boolean;
    message: string;
    data: Message;
}

/**
 * Send contact message (supports both app users and device contacts)
 */
export const sendContactApi = async (
    data: SendContactRequest
): Promise<SendContactResponse> => {
    console.log('📇 Sending contact(s):', data.contacts.length);

    try {
        const response = await apiClient.post(ENDPOINTS.MESSAGES.SEND_CONTACT, data);

        console.log('✅ Contact(s) sent successfully');
        return response.data;
    } catch (error: any) {
        console.error('❌ Contact send error:', error);
        console.error('❌ Error response:', error.response?.data);
        throw error;
    }
};
