import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAcceptCall, useRejectCall } from '../../lib/hooks/call';
import { useCallStore, CallType } from '../../lib/store/callStore';

export default function IncomingCallScreen() {
    const params = useLocalSearchParams<{
        callId?: string;
        callerId?: string;
        callerName?: string;
        callerProfilePic?: string;
        type?: string;
        chatId?: string;
    }>();

    const callId = typeof params.callId === 'string' ? params.callId : '';
    const callerId = typeof params.callerId === 'string' ? params.callerId : '';
    const callerName = typeof params.callerName === 'string' ? params.callerName : 'Unknown';
    const callerProfilePic = typeof params.callerProfilePic === 'string' ? params.callerProfilePic : '';
    const chatId = typeof params.chatId === 'string' ? params.chatId : '';
    const type = (typeof params.type === 'string' ? params.type : 'audio') as CallType;
    const [isBusy, setIsBusy] = useState(false);
    const { mutateAsync: acceptCall } = useAcceptCall();
    const { mutateAsync: rejectCall } = useRejectCall();

    const callLabel = useMemo(() => (type === 'video' ? 'Video call' : 'Voice call'), [type]);

    useEffect(() => {
        if (!callId || !callerId) return;

        useCallStore.getState().setIncomingCall({
            callId,
            caller: {
                _id: callerId,
                username: callerName,
                profilePic: callerProfilePic || null,
            },
            type,
            chatId,
        });
    }, [callId, callerId, callerName, callerProfilePic, chatId, type]);

    const handleAccept = async () => {
        if (!callId || !callerId) return;
        setIsBusy(true);

        try {
            await acceptCall(callId);

            useCallStore.getState().setActiveCall({
                callId,
                role: 'callee',
                type,
                peerId: callerId,
                peerName: callerName,
                peerProfilePic: callerProfilePic || null,
                chatId,
                status: 'connecting',
            });
            useCallStore.getState().setIncomingCall(null);

            router.replace(`/call/${callId}`);
        } catch (error) {
            console.error('Failed to accept call:', error);
        } finally {
            setIsBusy(false);
        }
    };

    const handleReject = async () => {
        if (!callId) return;
        setIsBusy(true);

        try {
            await rejectCall(callId);
        } catch (error) {
            console.error('Failed to reject call:', error);
        } finally {
            useCallStore.getState().clearCallState();
            setIsBusy(false);
            router.back();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            <StatusBar style="light" backgroundColor="#0F172A" translucent={false} />
            <View className="flex-1 items-center justify-between px-6 py-10">
                <View className="items-center mt-10">
                    <Text className="text-slate-400 text-sm uppercase tracking-[3px] mb-3">
                        Incoming {callLabel}
                    </Text>
                    <View className="w-36 h-36 rounded-full bg-slate-800 items-center justify-center overflow-hidden border border-slate-700">
                        {callerProfilePic ? (
                            <Image source={{ uri: callerProfilePic }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name={type === 'video' ? 'videocam' : 'call'} size={56} color="#6C5CE7" />
                        )}
                    </View>
                    <Text className="text-white text-3xl font-bold mt-8 text-center" numberOfLines={1}>
                        {callerName}
                    </Text>
                    <Text className="text-slate-400 text-base mt-2">
                        is calling you
                    </Text>
                </View>

                <View className="w-full">
                    <View className="flex-row justify-center items-center gap-6">
                        <TouchableOpacity
                            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
                            onPress={handleReject}
                            disabled={isBusy}
                        >
                            <Ionicons name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-16 h-16 rounded-full bg-emerald-500 items-center justify-center"
                            onPress={handleAccept}
                            disabled={isBusy}
                        >
                            <Ionicons name="call" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-slate-500 text-center text-sm mt-5">
                        Answer or reject before the caller hangs up.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
