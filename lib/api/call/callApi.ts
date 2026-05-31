import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';
import { CallType, CallUserRef } from '../../store/callStore';

export interface CallParticipant {
    userId: CallUserRef | string;
    status: 'ringing' | 'accepted' | 'rejected' | 'missed';
}

export interface CallChatRef {
    _id: string;
    name?: string;
    isGroup?: boolean;
}

export interface CallRecord {
    _id: string;
    caller: CallUserRef | string;
    participants: CallParticipant[];
    type: CallType;
    startTime?: string;
    endTime?: string;
    chatId?: CallChatRef | string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CallResponse {
    success: boolean;
    message?: string;
    data: CallRecord;
}

export interface CallHistoryResponse {
    success: boolean;
    data: CallRecord[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages?: number;
        totalPages?: number;
    };
}

export const initiateCall = async (participantIds: string[], type: CallType, chatId?: string): Promise<CallResponse> => {
    const response = await apiClient.post<CallResponse>(ENDPOINTS.CALLS.INITIATE, {
        participantIds,
        type,
        chatId,
    });
    return response.data;
};

export const acceptCall = async (callId: string): Promise<CallResponse> => {
    const response = await apiClient.post<CallResponse>(ENDPOINTS.CALLS.ACCEPT(callId));
    return response.data;
};

export const rejectCall = async (callId: string): Promise<CallResponse> => {
    const response = await apiClient.post<CallResponse>(ENDPOINTS.CALLS.REJECT(callId));
    return response.data;
};

export const endCall = async (callId: string): Promise<CallResponse> => {
    const response = await apiClient.post<CallResponse>(ENDPOINTS.CALLS.END(callId));
    return response.data;
};

export const getCallHistory = async (page: number = 1, limit: number = 20): Promise<CallHistoryResponse> => {
    const response = await apiClient.get<CallHistoryResponse>(ENDPOINTS.CALLS.HISTORY, {
        params: { page, limit },
    });
    return response.data;
};
