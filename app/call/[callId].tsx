import { ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, NativeModules, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSocket } from '../../lib/socket/socketContext';
import { useCallStore, CallRole, CallType } from '../../lib/store/callStore';
import { useEndCall } from '../../lib/hooks/call';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

type WebRTCModule = {
    RTCPeerConnection: new (config: { iceServers: Array<{ urls: string }> }) => any;
    RTCIceCandidate: new (candidate: any) => any;
    RTCSessionDescription: new (description: any) => any;
    RTCView: ComponentType<any>;
    mediaDevices: {
        getUserMedia: (constraints: { audio: boolean; video: boolean }) => Promise<any>;
    };
};

export default function ActiveCallScreen() {
    const params = useLocalSearchParams<{
        callId?: string;
        role?: string;
        type?: string;
        peerId?: string;
        peerName?: string;
        peerProfilePic?: string;
        chatId?: string;
    }>();

    const { socket } = useSocket();
    const { mutateAsync: endCall } = useEndCall();
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [statusText, setStatusText] = useState('Connecting...');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
    const [remoteStreamUrl, setRemoteStreamUrl] = useState<string | null>(null);
    const [isRemoteDescriptionSet, setIsRemoteDescriptionSet] = useState(false);
    const [webrtc, setWebrtc] = useState<WebRTCModule | null>(null);
    const [webrtcError, setWebrtcError] = useState<string | null>(null);
    const [isLoadingWebrtc, setIsLoadingWebrtc] = useState(true);
    const hasNativeWebrtc = Boolean((NativeModules as any).WebRTCModule);

    const peerConnectionRef = useRef<any>(null);
    const localStreamRef = useRef<any>(null);
    const startedRef = useRef(false);
    const processedCandidatesRef = useRef(0);

    const callId = typeof params.callId === 'string' ? params.callId : useCallStore.getState().activeCall?.callId || '';
    const role = (typeof params.role === 'string' ? params.role : useCallStore.getState().activeCall?.role || 'caller') as CallRole;
    const type = (typeof params.type === 'string' ? params.type : useCallStore.getState().activeCall?.type || 'audio') as CallType;
    const peerId = typeof params.peerId === 'string' ? params.peerId : useCallStore.getState().activeCall?.peerId || '';
    const peerName = typeof params.peerName === 'string' ? params.peerName : useCallStore.getState().activeCall?.peerName || 'Unknown';
    const peerProfilePic = typeof params.peerProfilePic === 'string' ? params.peerProfilePic : useCallStore.getState().activeCall?.peerProfilePic || '';
    const chatId = typeof params.chatId === 'string' ? params.chatId : useCallStore.getState().activeCall?.chatId || '';

    const activeCall = useCallStore((state) => state.activeCall);
    const pendingOffer = useCallStore((state) => state.pendingOffer);
    const pendingIceCandidates = useCallStore((state) => state.pendingIceCandidates);
    const setActiveCall = useCallStore((state) => state.setActiveCall);
    const updateActiveCall = useCallStore((state) => state.updateActiveCall);
    const clearCallState = useCallStore((state) => state.clearCallState);

    const canShowVideo = type === 'video';
    const displayName = useMemo(() => peerName || 'Call', [peerName]);
    const RTCView = webrtc?.RTCView;
    const RTCIceCandidate = webrtc?.RTCIceCandidate;
    const RTCSessionDescription = webrtc?.RTCSessionDescription;
    const mediaDevices = webrtc?.mediaDevices;

    useEffect(() => {
        let mounted = true;

        const loadWebrtc = async () => {
            setIsLoadingWebrtc(true);

            if (!hasNativeWebrtc) {
                if (!mounted) return;

                setWebrtc(null);
                setWebrtcError('WebRTC is not available in this runtime. Build a dev client to place calls.');
                setStatusText('Call unavailable');
                setIsLoadingWebrtc(false);
                return;
            }

            try {
                const mod = await import('react-native-webrtc');
                const runtime = ((mod as any).default ?? mod) as Partial<WebRTCModule>;

                if (!runtime.RTCPeerConnection || !runtime.RTCIceCandidate || !runtime.RTCSessionDescription || !runtime.mediaDevices) {
                    throw new Error('WebRTC native module is incomplete in this runtime.');
                }

                if (!mounted) return;

                setWebrtc(runtime as WebRTCModule);
                setWebrtcError(null);
            } catch (error) {
                if (!mounted) return;

                console.warn('WebRTC support could not be initialized:', error);
                setWebrtc(null);
                setWebrtcError('WebRTC support could not be initialized. Rebuild the app with a dev client.');
                setStatusText('Call unavailable');
            } finally {
                if (mounted) {
                    setIsLoadingWebrtc(false);
                }
            }
        };

        loadWebrtc();

        return () => {
            mounted = false;
        };
    }, [hasNativeWebrtc]);

    useEffect(() => {
        if (!callId) {
            router.back();
            return;
        }

        if (!activeCall || activeCall.callId !== callId) {
            setActiveCall({
                callId,
                role,
                type,
                peerId,
                peerName,
                peerProfilePic: peerProfilePic || null,
                chatId,
                status: role === 'caller' ? 'ringing' : 'connecting',
            });
        }
    }, [activeCall, callId, chatId, peerId, peerName, peerProfilePic, role, setActiveCall, type]);

    const teardownPeerConnection = () => {
        if (peerConnectionRef.current) {
            try {
                peerConnectionRef.current.close();
            } catch (error) {
                console.error('Failed to close peer connection:', error);
            }
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track: any) => track.stop());
            localStreamRef.current = null;
        }
    };

    const ensurePeerConnection = () => {
        if (!webrtc || !RTCSessionDescription) return null;
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const pc = new webrtc.RTCPeerConnection({ iceServers: ICE_SERVERS });

        pc.onicecandidate = (event: any) => {
            if (event.candidate && socket && peerId) {
                socket.emit('call:ice-candidate', {
                    targetUserId: peerId,
                    candidate: event.candidate,
                    callId,
                });
            }
        };

        pc.ontrack = (event: any) => {
            const [remoteStream] = event.streams || [];
            if (remoteStream) {
                setRemoteStreamUrl(remoteStream.toURL());
            }
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            if (state === 'connected') {
                setStatusText('Connected');
                updateActiveCall({ status: 'connected' });
                return;
            }

            if (state === 'connecting') {
                setStatusText('Connecting...');
                return;
            }

            if (state === 'failed' || state === 'disconnected' || state === 'closed') {
                setStatusText('Call ended');
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    const attachLocalStream = async () => {
        if (!webrtc || !mediaDevices) return null;
        if (localStreamRef.current) return localStreamRef.current;

        const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: canShowVideo,
        });

        localStreamRef.current = stream;
        setLocalStreamUrl(stream.toURL());
        setIsCameraOff(!canShowVideo);

        const pc = ensurePeerConnection();
        if (pc) {
            stream.getTracks().forEach((track: any) => {
                pc.addTrack(track, stream);
            });
        }

        return stream;
    };

    const flushPendingCandidates = async () => {
        if (!webrtc || !RTCIceCandidate || !isRemoteDescriptionSet || !peerConnectionRef.current) return;

        const candidates = pendingIceCandidates.filter((candidate) => candidate.callId === callId);
        if (candidates.length <= processedCandidatesRef.current) return;

        const newCandidates = candidates.slice(processedCandidatesRef.current);
        processedCandidatesRef.current = candidates.length;

        for (const item of newCandidates) {
            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(item.candidate));
            } catch (error) {
                console.error('Failed to add ICE candidate:', error);
            }
        }
    };

    const createAndSendOffer = async () => {
        if (!socket || !peerId || !webrtc) return;

        await attachLocalStream();
        const pc = ensurePeerConnection();
        if (!pc) return;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('call:offer', {
            targetUserId: peerId,
            callId,
            offer,
        });

        setStatusText('Ringing...');
    };

    const answerOffer = async (offerPayload: any) => {
        if (!socket || !peerId || !webrtc || !RTCSessionDescription) return;

        await attachLocalStream();
        const pc = ensurePeerConnection();
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(offerPayload.offer));
        setIsRemoteDescriptionSet(true);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('call:answer', {
            targetUserId: offerPayload.from,
            callId,
            answer,
        });

        setStatusText('Connecting...');
        updateActiveCall({ status: 'connecting' });
    };

    useEffect(() => {
        if (!socket || startedRef.current || !callId || !webrtc) return;

        if (role === 'caller') {
            startedRef.current = true;
            createAndSendOffer().catch((error) => {
                console.error('Failed to start outgoing call:', error);
                setStatusText('Call failed');
            });
        }
    }, [callId, peerId, role, socket, webrtc]);

    useEffect(() => {
        if (!socket || role !== 'caller') return;

        const handleAnswer = async (data: { callId: string; answer: any; from: string }) => {
            if (data.callId !== callId || data.from !== peerId || !peerConnectionRef.current || !RTCSessionDescription) return;

            try {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                setIsRemoteDescriptionSet(true);
                setStatusText('Connected');
                updateActiveCall({ status: 'connected' });
            } catch (error) {
                console.error('Failed to apply call answer:', error);
            }
        };

        socket.on('call:answer', handleAnswer);

        return () => {
            socket.off('call:answer', handleAnswer);
        };
    }, [RTCSessionDescription, callId, peerId, role, socket, updateActiveCall]);

    useEffect(() => {
        if (!webrtc || role !== 'callee' || !pendingOffer || pendingOffer.callId !== callId || startedRef.current) return;

        startedRef.current = true;
        answerOffer(pendingOffer).catch((error) => {
            console.error('Failed to answer call:', error);
            setStatusText('Call failed');
        });
    }, [callId, pendingOffer, role, webrtc]);

    useEffect(() => {
        flushPendingCandidates().catch((error) => {
            console.error('Failed to flush ICE candidates:', error);
        });
    }, [callId, isRemoteDescriptionSet, pendingIceCandidates, webrtc]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isRemoteDescriptionSet) {
                setElapsedSeconds((value) => value + 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isRemoteDescriptionSet]);

    useEffect(() => {
        return () => {
            teardownPeerConnection();
            clearCallState();
        };
    }, [clearCallState]);

    const handleEndCall = async () => {
        if (!callId) return;

        try {
            await endCall(callId);
        } catch (error) {
            console.error('Failed to end call:', error);
        } finally {
            teardownPeerConnection();
            clearCallState();
        }
    };

    const handleToggleMute = () => {
        if (!localStreamRef.current) return;

        const nextMuted = !isMuted;
        localStreamRef.current.getAudioTracks().forEach((track: any) => {
            track.enabled = !nextMuted;
        });
        setIsMuted(nextMuted);
    };

    const handleToggleCamera = () => {
        if (!localStreamRef.current || !canShowVideo) return;

        const nextCameraOff = !isCameraOff;
        localStreamRef.current.getVideoTracks().forEach((track: any) => {
            track.enabled = !nextCameraOff;
        });
        setIsCameraOff(nextCameraOff);
    };

    const formatElapsed = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const renderUnavailableState = () => (
        <View className="flex-1 items-center justify-center bg-[#111827] px-6">
            <View className="w-36 h-36 rounded-full bg-slate-800 overflow-hidden items-center justify-center mb-6">
                {peerProfilePic ? (
                    <Image source={{ uri: peerProfilePic }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <Ionicons name={canShowVideo ? 'videocam' : 'call'} size={56} color="#6C5CE7" />
                )}
            </View>
            <Text className="text-white text-2xl font-bold text-center">{displayName}</Text>
            <Text className="text-slate-400 mt-2 text-center">{statusText}</Text>
            <Text className="text-slate-500 text-sm mt-3 text-center">
                {webrtcError || 'WebRTC is not available in this runtime. Rebuild the app with a dev client.'}
            </Text>

        </View>
    );

    const renderControls = () => (
        <View className="px-6 py-8 border-t border-slate-800 bg-[#0F172A]">
            <View className="flex-row items-center justify-center gap-5">
                <TouchableOpacity
                    className={`w-14 h-14 rounded-full items-center justify-center ${webrtc && !isLoadingWebrtc ? 'bg-slate-800' : 'bg-slate-900'}`}
                    onPress={handleToggleMute}
                    disabled={!webrtc || isLoadingWebrtc}
                >
                    <Ionicons
                        name={isMuted ? 'mic-off' : 'mic'}
                        size={24}
                        color={webrtc && !isLoadingWebrtc ? '#fff' : '#64748b'}
                    />
                </TouchableOpacity>

                {canShowVideo && (
                    <TouchableOpacity
                        className={`w-14 h-14 rounded-full items-center justify-center ${webrtc && !isLoadingWebrtc ? 'bg-slate-800' : 'bg-slate-900'}`}
                        onPress={handleToggleCamera}
                        disabled={!webrtc || isLoadingWebrtc}
                    >
                        <Ionicons
                            name={isCameraOff ? 'videocam-off' : 'videocam'}
                            size={24}
                            color={webrtc && !isLoadingWebrtc ? '#fff' : '#64748b'}
                        />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            <StatusBar style="light" backgroundColor="#0F172A" translucent={false} />
            <View className="flex-1">
                <View className="px-4 py-3 flex-row items-center justify-between border-b border-slate-800">
                    <View>
                        <Text className="text-white text-lg font-semibold">{displayName}</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-slate-400 text-xs">
                                {isLoadingWebrtc ? 'Loading call engine...' : statusText}
                            </Text>
                            {isLoadingWebrtc && <ActivityIndicator size="small" color="#94a3b8" />}
                        </View>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full items-center justify-center bg-slate-800"
                        onPress={handleEndCall}
                    >
                        <Ionicons name="chevron-down" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 bg-black">
                    {webrtc && RTCView ? (
                        <>
                            {canShowVideo && remoteStreamUrl ? (
                                <RTCView
                                    streamURL={remoteStreamUrl}
                                    style={{ flex: 1 }}
                                    objectFit="cover"
                                />
                            ) : (
                                <View className="flex-1 items-center justify-center bg-[#111827] px-6">
                                    <View className="w-36 h-36 rounded-full bg-slate-800 overflow-hidden items-center justify-center mb-6">
                                        {peerProfilePic ? (
                                            <Image source={{ uri: peerProfilePic }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <Ionicons name={canShowVideo ? 'videocam' : 'call'} size={56} color="#6C5CE7" />
                                        )}
                                    </View>
                                    <Text className="text-white text-2xl font-bold text-center">{displayName}</Text>
                                    <Text className="text-slate-400 mt-2 text-center">{statusText}</Text>
                                    {isRemoteDescriptionSet && (
                                        <Text className="text-slate-500 text-sm mt-2">{formatElapsed(elapsedSeconds)}</Text>
                                    )}
                                </View>
                            )}

                            {canShowVideo && localStreamUrl && (
                                <View className="absolute right-4 top-6 w-28 h-40 rounded-2xl overflow-hidden border border-slate-700">
                                    <RTCView
                                        streamURL={localStreamUrl}
                                        style={{ flex: 1 }}
                                        objectFit="cover"
                                        mirror
                                    />
                                </View>
                            )}
                        </>
                    ) : (
                        renderUnavailableState()
                    )}
                </View>
                {renderControls()}
            </View>
        </SafeAreaView>
    );
}
