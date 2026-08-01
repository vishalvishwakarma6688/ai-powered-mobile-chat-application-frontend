import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CallRecord, CallUserRef } from '../../lib/api/call/callApi';

interface CallDetailsModalProps {
    visible: boolean;
    call: CallRecord | null;
    currentUserId: string;
    onClose: () => void;
    onCallAgain: (targetUserId: string, targetUserName: string, targetUserProfilePic: string | null, type: 'audio' | 'video', chatId?: string) => void;
    onOpenChat: (chatId?: string, otherUserId?: string) => void;
}

function asUserRef(value: CallRecord['caller'] | CallRecord['participants'][number]['userId'] | null | undefined): CallUserRef | null {
    if (!value || typeof value === 'string') {
        return null;
    }
    return value;
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

function formatTime(dateValue?: string) {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatDuration(startTime?: string, endTime?: string) {
    if (!startTime) return '0:00';

    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return '0:00';

    const totalSeconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function CallDetailsModal({
    visible,
    call,
    currentUserId,
    onClose,
    onCallAgain,
    onOpenChat,
}: CallDetailsModalProps) {
    if (!call) return null;

    const caller = asUserRef(call.caller);
    const isCaller = caller?._id === currentUserId;
    const otherParticipantObj = call.participants.find((p) => {
        const u = asUserRef(p.userId);
        return u?._id && u._id !== currentUserId;
    });
    const otherUser = isCaller ? asUserRef(otherParticipantObj?.userId) : caller;

    const targetUserId = otherUser?._id || caller?._id || '';
    const displayName = (typeof call.chatId === 'object' && call.chatId?.name) || otherUser?.username || caller?.username || 'Unknown';
    const profilePic = otherUser?.profilePic || caller?.profilePic || null;

    let status = 'Ended';
    if (isCaller) {
        const accepted = call.participants.some((p) => p.status === 'accepted');
        const rejected = call.participants.some((p) => p.status === 'rejected');
        if (!call.endTime) status = 'Ongoing';
        else if (accepted) status = 'Completed';
        else if (rejected) status = 'Declined';
        else status = 'Missed';
    } else {
        const currentP = call.participants.find((p) => asUserRef(p.userId)?._id === currentUserId);
        if (currentP?.status === 'accepted') status = call.endTime ? 'Completed' : 'Connected';
        else if (currentP?.status === 'rejected') status = 'Declined';
        else status = call.endTime ? 'Missed' : 'Ringing';
    }

    const isVideo = call.type === 'video';
    const direction = isCaller ? 'Outgoing' : 'Incoming';
    const dateLabel = formatDateLabel(call.createdAt);
    const timeLabel = formatTime(call.createdAt);
    const duration = formatDuration(call.startTime, call.endTime);
    const rawChatId = typeof call.chatId === 'object' ? call.chatId?._id : (call.chatId || undefined);

    const statusColor =
        status === 'Completed' || status === 'Connected'
            ? '#10B981'
            : status === 'Declined'
                ? '#F97316'
                : status === 'Missed'
                    ? '#EF4444'
                    : '#94A3B8';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity
                activeOpacity={1}
                className="flex-1 bg-black/70 justify-end"
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    className="bg-[#1E293B] rounded-t-3xl p-6 border-t border-slate-800"
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Handle Bar */}
                    <View className="w-12 h-1.5 bg-slate-700 rounded-full align-self-center self-center mb-5" />

                    {/* User Header */}
                    <View className="items-center mb-6">
                        <View className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden items-center justify-center mb-3 border-2 border-[#6C5CE7]">
                            {profilePic ? (
                                <Image source={{ uri: profilePic }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <Ionicons name={isVideo ? 'videocam' : 'call'} size={36} color="#6C5CE7" />
                            )}
                        </View>
                        <Text className="text-white text-xl font-bold text-center mb-1">
                            {displayName}
                        </Text>
                        <View className="flex-row items-center bg-slate-800 px-3 py-1 rounded-full mt-1">
                            <Ionicons
                                name={direction === 'Outgoing' ? 'arrow-up' : 'arrow-down'}
                                size={14}
                                color={statusColor}
                            />
                            <Text className="text-slate-300 text-xs font-medium ml-1.5">
                                {direction} {isVideo ? 'Video' : 'Voice'} Call
                            </Text>
                        </View>
                    </View>

                    {/* Quick Actions (Call Again / Message) */}
                    <View className="flex-row items-center justify-around mb-6 py-2 border-y border-slate-800">
                        {/* Voice Call Again */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => {
                                onClose();
                                onCallAgain(targetUserId, displayName, profilePic, 'audio', rawChatId);
                            }}
                        >
                            <View className="w-12 h-12 rounded-full bg-[#10B981]/20 items-center justify-center mb-1 border border-[#10B981]/30">
                                <Ionicons name="call" size={22} color="#10B981" />
                            </View>
                            <Text className="text-slate-300 text-xs font-medium">Voice Call</Text>
                        </TouchableOpacity>

                        {/* Video Call Again */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => {
                                onClose();
                                onCallAgain(targetUserId, displayName, profilePic, 'video', rawChatId);
                            }}
                        >
                            <View className="w-12 h-12 rounded-full bg-[#6C5CE7]/20 items-center justify-center mb-1 border border-[#6C5CE7]/30">
                                <Ionicons name="videocam" size={22} color="#6C5CE7" />
                            </View>
                            <Text className="text-slate-300 text-xs font-medium">Video Call</Text>
                        </TouchableOpacity>

                        {/* Open Chat */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => {
                                onClose();
                                onOpenChat(rawChatId, targetUserId);
                            }}
                        >
                            <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mb-1 border border-blue-500/30">
                                <Ionicons name="chatbubble" size={20} color="#3B82F6" />
                            </View>
                            <Text className="text-slate-300 text-xs font-medium">Message</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Call Details Info List */}
                    <View className="bg-slate-800/60 rounded-2xl p-4 mb-6">
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                            Call Details
                        </Text>

                        {/* Time & Date */}
                        <View className="flex-row items-center justify-between py-2 border-b border-slate-700/50">
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={18} color="#94A3B8" />
                                <Text className="text-slate-300 text-sm ml-2.5">Date & Time</Text>
                            </View>
                            <Text className="text-white text-sm font-semibold">
                                {dateLabel} at {timeLabel}
                            </Text>
                        </View>

                        {/* Duration */}
                        <View className="flex-row items-center justify-between py-2 border-b border-slate-700/50">
                            <View className="flex-row items-center">
                                <Ionicons name="hourglass-outline" size={18} color="#94A3B8" />
                                <Text className="text-slate-300 text-sm ml-2.5">Duration</Text>
                            </View>
                            <Text className="text-white text-sm font-semibold">
                                {status === 'Missed' || status === 'Declined' ? '0:00' : duration}
                            </Text>
                        </View>

                        {/* Status */}
                        <View className="flex-row items-center justify-between py-2">
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-done-circle-outline" size={18} color="#94A3B8" />
                                <Text className="text-slate-300 text-sm ml-2.5">Status</Text>
                            </View>
                            <Text className="text-sm font-semibold" style={{ color: statusColor }}>
                                {status}
                            </Text>
                        </View>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        className="w-full py-3.5 rounded-2xl bg-slate-800 items-center justify-center"
                        onPress={onClose}
                    >
                        <Text className="text-white font-semibold text-base">Close</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
