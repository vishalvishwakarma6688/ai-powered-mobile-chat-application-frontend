import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStarredMessages } from '../../lib/hooks/message/useStar';
import { useAuthStore } from '../../lib/store/authStore';
import MessageBubble from '../../components/chat/MessageBubble';

export default function StarredMessagesScreen() {
    const { user } = useAuthStore();
    const { data, isLoading, error, refetch, isRefetching } = useStarredMessages(100);

    const handleRefresh = () => {
        refetch();
    };

    // Empty handlers for MessageBubble (starred messages are read-only in this view)
    const handleReact = () => { };
    const handleRemoveReaction = () => { };
    const handlePin = () => { };
    const handleUnpin = () => { };
    const handleStar = () => { };
    const handleUnstar = () => { };
    const handleDelete = () => { };
    const handleEdit = () => { };
    const handleForward = () => { };
    const handleSetAutoDelete = () => { };
    const handleCancelAutoDelete = () => { };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-slate-800 flex-row items-center bg-[#0F172A]">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <View className="flex-1 ml-2">
                    <Text className="text-white font-semibold text-lg">
                        Starred Messages
                    </Text>
                    {data?.data && (
                        <Text className="text-slate-400 text-xs">
                            {data.data.length} {data.data.length === 1 ? 'message' : 'messages'}
                        </Text>
                    )}
                </View>
            </View>

            {/* Content */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6C5CE7" />
                    <Text className="text-slate-400 mt-4">Loading starred messages...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="text-white text-lg font-semibold mt-4">
                        Failed to Load
                    </Text>
                    <Text className="text-slate-400 text-center mt-2">
                        Could not load starred messages. Please try again.
                    </Text>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        className="mt-6 bg-[#6C5CE7] px-6 py-3 rounded-full"
                    >
                        <Text className="text-white font-semibold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : !data?.data || data.data.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="star-outline" size={64} color="#6C5CE7" />
                    <Text className="text-white text-lg font-semibold mt-4">
                        No Starred Messages
                    </Text>
                    <Text className="text-slate-400 text-center mt-2">
                        Star important messages to find them easily later.
                    </Text>
                    <Text className="text-slate-400 text-center mt-4 text-sm">
                        Long press on any message and tap the star icon to add it here.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefresh}
                            tintColor="#6C5CE7"
                            colors={['#6C5CE7']}
                        />
                    }
                >
                    {/* Top Padding */}
                    <View className="h-4" />

                    {data.data.map((message: any) => (
                        <View key={message._id} className="mb-6">
                            {/* Chat Info Header */}
                            <TouchableOpacity
                                onPress={() => {
                                    // Navigate to the chat where this message is from
                                    router.push(`/chat/${message.chatId._id}`);
                                }}
                                className="px-4 py-3 bg-[#1E293B] border-b border-slate-700 mb-3"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="chatbubble-outline" size={16} color="#6C5CE7" />
                                    <Text className="text-[#6C5CE7] text-sm font-medium ml-2 flex-1">
                                        {message.chatId.isGroup
                                            ? message.chatId.name || 'Group Chat'
                                            : message.chatId.participants?.find(
                                                (p: any) => p.userId._id !== user?._id
                                            )?.userId.username || 'Chat'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color="#6C5CE7" />
                                </View>
                            </TouchableOpacity>

                            {/* Message */}
                            <MessageBubble
                                message={message}
                                isOwnMessage={message.sender._id === user?._id}
                                currentUserId={user?._id || ''}
                                onReact={handleReact}
                                onRemoveReaction={handleRemoveReaction}
                                onPin={handlePin}
                                onUnpin={handleUnpin}
                                onStar={handleStar}
                                onUnstar={handleUnstar}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                onForward={handleForward}
                                onSetAutoDelete={handleSetAutoDelete}
                                onCancelAutoDelete={handleCancelAutoDelete}
                            />
                        </View>
                    ))}

                    {/* Bottom Padding */}
                    <View className="h-8" />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
