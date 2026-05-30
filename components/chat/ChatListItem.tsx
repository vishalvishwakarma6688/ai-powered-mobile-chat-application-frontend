import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '../../lib/api/chat/chatApi';
import { BASE_URL } from '../../lib/api/client';

interface ChatListItemProps {
    chat: Chat;
    currentUserId: string;
    isAIChat?: boolean;
}

export default function ChatListItem({ chat, currentUserId, isAIChat = false }: ChatListItemProps) {
    // Helper function to get full image URL
    const getFullImageUrl = (iconPath: string | null | undefined): string | null => {
        if (!iconPath) return null;
        // If it's already a full URL (starts with http), return as is
        if (iconPath.startsWith('http')) return iconPath;
        // If it's a local file URI (starts with file://), return as is
        if (iconPath.startsWith('file://')) return iconPath;
        // Otherwise, prepend the base URL
        return `${BASE_URL}${iconPath}`;
    };

    // Get the other participant (for one-on-one chats)
    const otherParticipant = chat.isGroup
        ? null
        : chat.participants.find(p => p.userId._id !== currentUserId)?.userId;

    // Display name
    const displayName = chat.isGroup
        ? chat.name || 'Group Chat'
        : otherParticipant?.username || 'Unknown User';

    // Profile picture with full URL
    const profilePic = chat.isGroup
        ? getFullImageUrl(chat.groupIcon)
        : getFullImageUrl(otherParticipant?.profilePic);

    // Online status (only for one-on-one chats)
    const isOnline = !chat.isGroup && otherParticipant?.isOnline;

    // Last message preview - use 'text' field from backend
    const lastMessageText = chat.lastMessage?.text || chat.lastMessage?.content || 'Tap to start chatting';
    const lastMessageSender = chat.lastMessage?.sender?.username;

    // For groups, show sender name
    const lastMessagePreview = chat.isGroup && lastMessageSender && chat.lastMessage?.text
        ? `${lastMessageSender}: ${lastMessageText}`
        : lastMessageText;

    // Format timestamp - WhatsApp style
    const formatTimestamp = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        // Today - show time
        if (diffDays === 0) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            return `${formattedHours}:${formattedMinutes} ${ampm}`;
        }

        // Yesterday
        if (diffDays === 1) return 'Yesterday';

        // This week - show day name
        if (diffDays < 7) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[date.getDay()];
        }

        // Older - show date
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const timestamp = formatTimestamp(chat.lastMessage?.createdAt || chat.updatedAt);

    // Get unread count from backend
    const unreadCount = chat.unreadCount || 0;

    const handlePress = () => {
        console.log('🔍 ChatListItem pressed:', {
            chatId: chat._id,
            displayName,
            isGroup: chat.isGroup
        });

        try {
            router.push(`/chat/${chat._id}`);
            console.log('✅ Navigation initiated to:', `/chat/${chat._id}`);
        } catch (error) {
            console.error('❌ Navigation failed:', error);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="px-4 py-3 flex-row items-center active:bg-slate-800/50"
        >
            {/* Profile Picture */}
            <View className="relative">
                {isAIChat ? (
                    // AI Bot Avatar - Special gradient with sparkle icon
                    <View className="w-14 h-14 rounded-full items-center justify-center bg-gradient-to-br from-[#8B5CF6] via-[#6C5CE7] to-[#EC4899]">
                        <Ionicons name="sparkles" size={28} color="#fff" />
                    </View>
                ) : profilePic ? (
                    <Image
                        source={{ uri: profilePic }}
                        className="w-14 h-14 rounded-full bg-slate-700"
                    />
                ) : (
                    <View className={`w-14 h-14 rounded-full items-center justify-center ${chat.isGroup ? 'bg-[#10B981]' : 'bg-[#6C5CE7]'}`}>
                        {chat.isGroup ? (
                            <Ionicons name="people" size={28} color="#fff" />
                        ) : (
                            <Text className="text-white text-xl font-semibold">
                                {displayName.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                )}

                {/* AI Badge - Special badge for AI bot */}
                {isAIChat && (
                    <View className="absolute bottom-0 right-0 w-5 h-5 bg-[#8B5CF6] rounded-full items-center justify-center border-2 border-[#0F172A]">
                        <Ionicons name="sparkles" size={12} color="#fff" />
                    </View>
                )}

                {/* Group Badge - Small icon overlay for groups */}
                {chat.isGroup && !isAIChat && (
                    <View className="absolute bottom-0 right-0 w-5 h-5 bg-[#10B981] rounded-full items-center justify-center border-2 border-[#0F172A]">
                        <Ionicons name="people" size={12} color="#fff" />
                    </View>
                )}

                {/* Online Indicator - Only for one-on-one chats (AI is always online) */}
                {((isOnline && !chat.isGroup) || isAIChat) && !chat.isGroup && (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0F172A]" />
                )}
            </View>

            {/* Chat Info */}
            <View className="flex-1 ml-3 border-b border-slate-800 pb-3">
                <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center flex-1">
                        <Text className="text-white font-semibold text-base flex-1" numberOfLines={1}>
                            {displayName}
                        </Text>
                        {/* AI icon next to name */}
                        {isAIChat && (
                            <Ionicons name="sparkles" size={14} color="#8B5CF6" style={{ marginLeft: 4 }} />
                        )}
                        {/* Group icon next to name for extra clarity */}
                        {chat.isGroup && !isAIChat && (
                            <Ionicons name="people" size={14} color="#10B981" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                    {timestamp && (
                        <Text className="text-slate-400 text-xs ml-2">
                            {timestamp}
                        </Text>
                    )}
                </View>

                <View className="flex-row items-center justify-between">
                    <Text
                        className={`text-sm flex-1 ${unreadCount > 0 ? 'text-white font-medium' : 'text-slate-400'
                            }`}
                        numberOfLines={1}
                    >
                        {lastMessagePreview}
                    </Text>

                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <View className="bg-[#6C5CE7] rounded-full px-2 py-0.5 ml-2 min-w-[20px] items-center">
                            <Text className="text-white text-xs font-semibold">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
