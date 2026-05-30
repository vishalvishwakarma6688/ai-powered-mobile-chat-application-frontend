import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import ChatListItem from './ChatListItem';
import { Chat } from '../../lib/api/chat/chatApi';
import { useAIChat } from '../../lib/hooks/ai/useAIChat';

interface ChatListProps {
    chats: Chat[];
    currentUserId: string;
    isLoading: boolean;
    error: Error | null;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export default function ChatList({
    chats,
    currentUserId,
    isLoading,
    error,
    onRefresh,
    isRefreshing,
}: ChatListProps) {
    // Get or create AI chat
    const { data: aiChatData, isLoading: isAIChatLoading } = useAIChat();

    // Filter out AI chat from regular chats to avoid duplicates
    const AI_BOT_ID = '000000000000000000000001';
    const regularChats = chats.filter(chat => {
        // Check if this chat includes the AI bot as a participant
        const hasAIBot = chat.participants?.some(p => p.userId?._id === AI_BOT_ID);
        return !hasAIBot;
    });

    // Loading state
    if (isLoading && !isRefreshing) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text className="text-slate-400 mt-4">Loading chats...</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
                    <Ionicons name="alert-circle" size={32} color="#EF4444" />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                    Unable to Load Chats
                </Text>
                <Text className="text-slate-400 text-center text-sm mb-6">
                    {error.message?.includes('404')
                        ? 'Chat service is not available. Please try again later.'
                        : error.message || 'Something went wrong. Please try again.'}
                </Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    className="bg-[#6C5CE7] px-6 py-3 rounded-full flex-row items-center"
                >
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text className="text-white font-semibold ml-2">Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Combine AI chat with regular chats (AI chat always at top)
    const allChats = aiChatData?.data ? [aiChatData.data, ...regularChats] : regularChats;

    // Empty state (only show if no AI chat and no regular chats)
    if (allChats.length === 0) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <View className="w-24 h-24 rounded-full bg-slate-800 items-center justify-center mb-6">
                    <Ionicons name="chatbubbles" size={48} color="#6C5CE7" />
                </View>
                <Text className="text-white text-xl font-semibold mb-2">
                    No Chats Yet
                </Text>
                <Text className="text-slate-400 text-center text-sm">
                    Start a conversation with your contacts.{'\n'}
                    Your chats will appear here.
                </Text>
            </View>
        );
    }

    // Chat list
    return (
        <FlatList
            data={allChats}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <ChatListItem chat={item} currentUserId={currentUserId} isAIChat={item._id === aiChatData?.data?._id} />
            )}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor="#6C5CE7"
                    colors={['#6C5CE7']}
                />
            }
            contentContainerStyle={{ flexGrow: 1 }}
        />
    );
}
