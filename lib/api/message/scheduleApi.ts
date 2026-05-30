import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

export interface ScheduledMessage {
    _id: string;
    chatId: string;
    sender: {
        _id: string;
        username: string;
        profilePic?: string;
    };
    text: string;
    scheduledFor: string;
    isScheduled: boolean;
    createdAt: string;
}

export interface ScheduleMessageResponse {
    success: boolean;
    message: string;
    data: ScheduledMessage;
}

export interface GetScheduledMessagesResponse {
    success: boolean;
    data: ScheduledMessage[];
}

/**
 * Schedule a message to be sent at a specific time
 * @param chatId - Chat ID
 * @param text - Message text
 * @param scheduledFor - ISO date string for when to send
 * @returns Promise with scheduled message
 */
export const scheduleMessageApi = async (
    chatId: string,
    text: string,
    scheduledFor: string
): Promise<ScheduleMessageResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADVANCED_MESSAGES.SCHEDULE, {
        chatId,
        text,
        scheduledFor
    });
    return response.data;
};

/**
 * Get all scheduled messages for a chat
 * @param chatId - Chat ID
 * @returns Promise with scheduled messages
 */
export const getScheduledMessagesApi = async (
    chatId: string
): Promise<GetScheduledMessagesResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADVANCED_MESSAGES.GET_SCHEDULED(chatId));
    return response.data;
};

/**
 * Cancel a scheduled message
 * @param messageId - Scheduled message ID
 * @returns Promise with success response
 */
export const cancelScheduledMessageApi = async (
    messageId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(ENDPOINTS.ADVANCED_MESSAGES.CANCEL_SCHEDULED(messageId));
    return response.data;
};
