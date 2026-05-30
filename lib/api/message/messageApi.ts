import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageSender {
    _id: string;
    username: string;
    profilePic: string | null;
}

export interface MessageReaction {
    userId: string;
    emoji: string;
}

export interface Message {
    _id: string;
    chatId: string;
    sender: MessageSender;
    text: string; // Backend uses 'text' not 'content'
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
    createdAt: string;
    updatedAt: string;
    isEdited: boolean;
    isDeleted: boolean;
    isPinned?: boolean;
    pinnedBy?: string;
    pinnedAt?: string;
    starredBy?: Array<{
        userId: string;
        starredAt: string;
    }>;
    reactions?: MessageReaction[];
    readBy?: Array<{
        userId: string;
        readAt: string;
    }>;
    deliveredTo?: Array<{
        userId: string;
        deliveredAt: string;
    }>;
    forwardedFrom?: {
        messageId: string;
        originalSender: MessageSender;
    };
    media?: {
        url: string;
        thumbnail?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
    };
    location?: {
        lat: number;
        lng: number;
    };
    contact?: Array<{
        name: string;
        phoneNumber?: string;
        userId?: string;
    }>;
    voiceNote?: {
        duration: number;
        waveform: number[];
        transcription?: string;
    };
    autoDeleteAt?: string;
}

export interface GetMessagesResponse {
    success: boolean;
    data: Message[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalMessages: number;
    };
}

export interface SendMessageResponse {
    success: boolean;
    message: string;
    data: Message;
}

export interface SendMessagePayload {
    chatId: string;
    text: string; // Backend expects 'text' not 'content'
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Get messages for a chat
 */
export const getMessagesApi = async (
    chatId: string,
    page: number = 1,
    limit: number = 50
): Promise<GetMessagesResponse> => {
    const { data } = await apiClient.get<GetMessagesResponse>(
        ENDPOINTS.MESSAGES.GET_BY_CHAT(chatId),
        { params: { page, limit } }
    );
    return data;
};

/**
 * Send text message
 */
export const sendTextMessageApi = async (
    payload: SendMessagePayload
): Promise<SendMessageResponse> => {
    const { data } = await apiClient.post<SendMessageResponse>(
        ENDPOINTS.MESSAGES.SEND_TEXT,
        payload
    );
    return data;
};

/**
 * Mark message as delivered
 */
export const markMessageDeliveredApi = async (messageId: string): Promise<any> => {
    const { data } = await apiClient.put(ENDPOINTS.MESSAGES.MARK_DELIVERED(messageId));
    return data;
};

/**
 * Mark message as read
 */
export const markMessageReadApi = async (messageId: string): Promise<any> => {
    const { data } = await apiClient.put(ENDPOINTS.MESSAGES.MARK_READ(messageId));
    return data;
};

/**
 * Edit message
 */
export const editMessageApi = async (messageId: string, text: string): Promise<any> => {
    const { data } = await apiClient.put(ENDPOINTS.MESSAGES.EDIT(messageId), { text });
    return data;
};

/**
 * Delete message
 */
export const deleteMessageApi = async (messageId: string): Promise<any> => {
    const { data } = await apiClient.delete(ENDPOINTS.MESSAGES.DELETE(messageId));
    return data;
};
