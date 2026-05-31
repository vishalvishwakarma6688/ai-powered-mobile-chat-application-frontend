import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useCallHistory } from '../../lib/hooks/call/useCall';
import { CallRecord, CallUserRef } from '../../lib/api/call/callApi';

const PAGE_SIZE = 20;

function getUserRef(value: CallRecord['caller'] | CallRecord['participants'][number]['userId']): CallUserRef | null {
    if (!value || typeof value === 'string') return null;
    return value;
}

function formatTime(dateValue?: string) {
    if (!dateValue) return '';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatDateLabel(dateValue: string) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfItem = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diffDays = Math.round((startOfToday - startOfItem) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function formatDuration(startTime?: string, endTime?: string) {
    if (!startTime) return '';

    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return '';

    const totalSeconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getCallMeta(call: CallRecord, currentUserId: string) {
    const caller = getUserRef(call.caller);
    const currentParticipant = call.participants.find((participant) => {
        const user = getUserRef(participant.userId);
        return user?._id === currentUserId;
    });

    const isCaller = caller?._id === currentUserId;
    const isParticipant = Boolean(currentParticipant);

    const otherUser = isCaller
        ? getUserRef(call.participants.find((participant) => {
            const user = getUserRef(participant.userId);
            return user?._id && user._id !== currentUserId;
        })?.userId || null)
        : caller;

    const direction = isCaller ? 'Outgoing' : isParticipant ? 'Incoming' : 'Call';

    let status: string = 'Ended';
    if (isCaller) {
        const accepted = call.participants.some((participant) => participant.status === 'accepted');
        const rejected = call.participants.some((participant) => participant.status === 'rejected');

        if (!call.endTime) status = 'Ongoing';
        else if (accepted) status = 'Completed';
        else if (rejected) status = 'Missed';
        else status = 'Missed';
    } else if (isParticipant) {
        if (currentParticipant?.status === 'accepted') {
            status = call.endTime ? 'Completed' : 'Connected';
        } else if (currentParticipant?.status === 'rejected') {
            status = 'Declined';
        } else {
            status = call.endTime ? 'Missed' : 'Ringing';
        }
    }

    const chatName = typeof call.chatId === 'object' && call.chatId?.name ? call.chatId.name : '';

    return {
        caller,
        otherUser,
        direction,
        status,
        chatName,
    };
}

function CallItem({
    call,
    currentUserId,
}: {
    call: CallRecord;
    currentUserId: string;
}) {
    const meta = getCallMeta(call, currentUserId);
    const displayName = meta.chatName || meta.otherUser?.username || meta.caller?.username || 'Unknown';
    const profilePic = meta.otherUser?.profilePic || meta.caller?.profilePic || null;
    const dateLabel = formatDateLabel(call.createdAt);
    const callTime = formatTime(call.createdAt);
    const duration = formatDuration(call.startTime, call.endTime);
    const isVideo = call.type === 'video';

    const statusColor =
        meta.status === 'Completed' || meta.status === 'Connected'
            ? '#10B981'
            : meta.status === 'Declined'
                ? '#F97316'
                : meta.status === 'Missed'
                    ? '#EF4444'
                    : '#94A3B8';

    const directionIcon =
        meta.direction === 'Outgoing'
            ? 'arrow-up-right'
            : meta.direction === 'Incoming'
                ? 'arrow-down-left'
                : 'call-outline';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className="px-6 py-4 border-b border-slate-800 flex-row items-center"
        >
            <View className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden items-center justify-center">
                {profilePic ? (
                    <Image source={{ uri: profilePic }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <Ionicons
                        name={isVideo ? 'videocam' : 'call'}
                        size={22}
                        color="#6C5CE7"
                    />
                )}
            </View>

            <View className="flex-1 ml-4">
                <View className="flex-row items-center justify-between">
                    <Text className="text-white text-base font-semibold" numberOfLines={1}>
                        {displayName}
                    </Text>
                    <Text className="text-slate-500 text-xs">
                        {dateLabel ? `${dateLabel} • ${callTime}` : callTime}
                    </Text>
                </View>

                <View className="flex-row items-center mt-1">
                    <Ionicons name={directionIcon as any} size={14} color={statusColor} />
                    <Text className="text-slate-400 text-sm ml-1" numberOfLines={1}>
                        {meta.direction} {isVideo ? 'video' : 'voice'} call
                        {duration ? ` • ${duration}` : ''}
                    </Text>
                </View>
            </View>

            <View className="items-end ml-3">
                <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                    {meta.status}
                </Text>
                <Ionicons name="time-outline" size={18} color="#64748b" style={{ marginTop: 6 }} />
            </View>
        </TouchableOpacity>
    );
}

export default function CallsScreen() {
    const { user } = useAuthStore();
    const currentUserId = user?._id || '';
    const [page, setPage] = useState(1);
    const [calls, setCalls] = useState<CallRecord[]>([]);
    const { data, isLoading, error, isFetching, refetch } = useCallHistory(page, PAGE_SIZE);

    const totalPages = data?.pagination.pages ?? data?.pagination.totalPages ?? 1;

    useEffect(() => {
        if (!data?.data) return;

        setCalls((prev) => {
            if (page === 1) {
                return data.data;
            }

            const map = new Map(prev.map((item) => [item._id, item]));
            data.data.forEach((item) => map.set(item._id, item));

            return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        });
    }, [data, page]);

    const hasMore = page < totalPages;

    const handleRefresh = async () => {
        if (page !== 1) {
            setCalls([]);
            setPage(1);
            return;
        }

        await refetch();
    };

    const handleLoadMore = () => {
        if (!hasMore || isFetching || isLoading) return;
        setPage((prev) => prev + 1);
    };

    const emptyState = useMemo(() => (
        <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-24 h-24 rounded-full bg-slate-800 items-center justify-center mb-6">
                <Ionicons name="call-outline" size={48} color="#6C5CE7" />
            </View>
            <Text className="text-white text-xl font-semibold mb-2">
                No calls yet
            </Text>
            <Text className="text-slate-400 text-center text-sm">
                Your attempted and answered calls will appear here.
            </Text>
        </View>
    ), []);

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            <View className="px-6 py-4 border-b border-slate-800 flex-row items-center justify-between">
                <Text className="text-white text-2xl font-bold">Calls</Text>
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-[#6C5CE7] items-center justify-center"
                    onPress={() => router.push('/(tabs)/contacts')}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-white text-lg font-semibold">Unable to load calls</Text>
                    <Text className="text-slate-400 text-center text-sm mt-2">
                        Check your connection and try again.
                    </Text>
                    <TouchableOpacity
                        className="mt-5 px-5 py-3 rounded-full bg-[#6C5CE7]"
                        onPress={handleRefresh}
                    >
                        <Text className="text-white font-semibold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={calls}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <CallItem call={item} currentUserId={currentUserId} />
                    )}
                    contentContainerStyle={calls.length === 0 ? { flexGrow: 1 } : { paddingBottom: 24 }}
                    ListEmptyComponent={
                        isLoading ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator color="#6C5CE7" />
                            </View>
                        ) : emptyState
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading || isFetching}
                            onRefresh={handleRefresh}
                            tintColor="#6C5CE7"
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.35}
                    ListFooterComponent={
                        isFetching && calls.length > 0 ? (
                            <View className="py-5">
                                <ActivityIndicator color="#6C5CE7" />
                            </View>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}
