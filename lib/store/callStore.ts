import { create } from 'zustand';

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'connecting' | 'connected' | 'ended';
export type CallRole = 'caller' | 'callee';

export interface CallUserRef {
    _id: string;
    username: string;
    profilePic?: string | null;
}

export interface IncomingCallState {
    callId: string;
    caller: CallUserRef;
    type: CallType;
    chatId?: string | null;
}

export interface ActiveCallState {
    callId: string;
    role: CallRole;
    type: CallType;
    peerId: string;
    peerName: string;
    peerProfilePic?: string | null;
    chatId?: string | null;
    status: CallStatus;
}

export interface PendingOfferState {
    callId: string;
    from: string;
    offer: any;
}

export interface PendingIceCandidateState {
    callId: string;
    candidate: any;
}

interface CallStoreState {
    incomingCall: IncomingCallState | null;
    activeCall: ActiveCallState | null;
    pendingOffer: PendingOfferState | null;
    pendingIceCandidates: PendingIceCandidateState[];
    setIncomingCall: (call: IncomingCallState | null) => void;
    setActiveCall: (call: ActiveCallState | null) => void;
    updateActiveCall: (updates: Partial<ActiveCallState>) => void;
    setPendingOffer: (offer: PendingOfferState | null) => void;
    addPendingIceCandidate: (candidate: PendingIceCandidateState) => void;
    clearPendingIceCandidates: (callId?: string) => void;
    clearCallState: () => void;
}

export const useCallStore = create<CallStoreState>((set, get) => ({
    incomingCall: null,
    activeCall: null,
    pendingOffer: null,
    pendingIceCandidates: [],
    setIncomingCall: (call) => set({ incomingCall: call }),
    setActiveCall: (call) => set({ activeCall: call }),
    updateActiveCall: (updates) => set({ activeCall: get().activeCall ? { ...get().activeCall!, ...updates } : null }),
    setPendingOffer: (offer) => set({ pendingOffer: offer }),
    addPendingIceCandidate: (candidate) =>
        set((state) => ({
            pendingIceCandidates: [...state.pendingIceCandidates, candidate],
        })),
    clearPendingIceCandidates: (callId) =>
        set((state) => ({
            pendingIceCandidates: callId
                ? state.pendingIceCandidates.filter((item) => item.callId !== callId)
                : [],
        })),
    clearCallState: () =>
        set({
            incomingCall: null,
            activeCall: null,
            pendingOffer: null,
            pendingIceCandidates: [],
        }),
}));
