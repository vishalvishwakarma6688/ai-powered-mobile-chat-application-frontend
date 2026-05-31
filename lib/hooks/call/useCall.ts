import { useMutation, useQuery } from '@tanstack/react-query';
import { acceptCall, endCall, getCallHistory, initiateCall, rejectCall } from '../../api/call';
import { CallType } from '../../store/callStore';

export const useInitiateCall = () =>
    useMutation({
        mutationFn: ({
            participantIds,
            type,
            chatId,
        }: {
            participantIds: string[];
            type: CallType;
            chatId?: string;
        }) => initiateCall(participantIds, type, chatId),
    });

export const useAcceptCall = () =>
    useMutation({
        mutationFn: (callId: string) => acceptCall(callId),
    });

export const useRejectCall = () =>
    useMutation({
        mutationFn: (callId: string) => rejectCall(callId),
    });

export const useEndCall = () =>
    useMutation({
        mutationFn: (callId: string) => endCall(callId),
    });

export const useCallHistory = (page: number = 1, limit: number = 20) =>
    useQuery({
        queryKey: ['calls', 'history', page, limit],
        queryFn: () => getCallHistory(page, limit),
    });
