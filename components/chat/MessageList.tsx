import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Message } from '../../lib/api/message/messageApi';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';
import StickyDateHeader from './StickyDateHeader';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    isLoading: boolean;
    error: Error | null;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isAIChat?: boolean;
    onReact: (messageId: string, emoji: string) => void;
    onRemoveReaction: (messageId: string) => void;
    onPin: (messageId: string) => void;
    onUnpin: (messageId: string) => void;
    onStar: (messageId: string) => void;
    onUnstar: (messageId: string) => void;
    onDelete: (messageId: string) => void;
    onEdit: (messageId: string, currentText: string) => void;
    onForward: (messageId: string) => void;
    onSetAutoDelete: (messageId: string, currentAutoDeleteAt?: string) => void;
    onCancelAutoDelete: (messageId: string) => void;
}

export default function MessageList({
    messages,
    currentUserId,
    isLoading,
    error,
    onRefresh,
    isRefreshing = false,
    isAIChat = false,
    onReact,
    onRemoveReaction,
    onPin,
    onUnpin,
    onStar,
    onUnstar,
    onDelete,
    onEdit,
    onForward,
    onSetAutoDelete,
    onCancelAutoDelete,
}: MessageListProps) {
    const [currentScrollDate, setCurrentScrollDate] = useState<string | null>(null);
    const [showStickyDate, setShowStickyDate] = useState(false);

    // Helper function to check if two dates are on the same day
    const isSameDay = (date1: string, date2: string): boolean => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    // Helper function to get date string for grouping
    const getDateKey = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    };

    // Handle scroll to update sticky date header
    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        // Show sticky header when scrolling
        if (offsetY > 100) {
            setShowStickyDate(true);

            // Find the current visible message date
            // This is a simplified version - you can enhance it based on visible items
            if (reversedMessages.length > 0) {
                const visibleIndex = Math.floor(offsetY / 100); // Approximate
                const visibleMessage = reversedMessages[Math.min(visibleIndex, reversedMessages.length - 1)];
                if (visibleMessage && (!currentScrollDate || !isSameDay(currentScrollDate, visibleMessage.createdAt))) {
                    setCurrentScrollDate(visibleMessage.createdAt);
                }
            }
        } else {
            setShowStickyDate(false);
        }
    };
    // Loading state - only show if no messages exist yet (initial load)
    if (isLoading && messages.length === 0) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text className="text-slate-400 mt-4">Loading messages...</Text>
            </View>
        );
    }

    // Error state - only show if no messages exist
    if (error && messages.length === 0) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
                    <Ionicons name="alert-circle" size={32} color="#EF4444" />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                    Failed to Load Messages
                </Text>
                <Text className="text-slate-400 text-center text-sm">
                    {error.message || 'Something went wrong. Please try again.'}
                </Text>
            </View>
        );
    }

    // Empty state
    if (messages.length === 0) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                    <Ionicons name="chatbubbles-outline" size={40} color="#6C5CE7" />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                    No Messages Yet
                </Text>
                <Text className="text-slate-400 text-center text-sm">
                    Start the conversation by sending a message below
                </Text>
            </View>
        );
    }

    // Messages list - Reverse array to show oldest first (WhatsApp style)
    const reversedMessages = [...messages].reverse();

    // Create items with date separators
    type ListItem =
        | { type: 'date'; date: string; id: string }
        | { type: 'message'; message: Message; id: string };

    const itemsWithDates: ListItem[] = [];
    let lastDate: string | null = null;

    reversedMessages.forEach((message) => {
        const messageDate = getDateKey(message.createdAt);

        // Add date separator if it's a new day
        if (messageDate !== lastDate) {
            itemsWithDates.push({
                type: 'date',
                date: message.createdAt,
                id: `date-${messageDate}`,
            });
            lastDate = messageDate;
        }

        // Add message
        itemsWithDates.push({
            type: 'message',
            message,
            id: message._id,
        });
    });

    return (
        <>
            {/* Sticky Date Header */}
            {currentScrollDate && (
                <StickyDateHeader date={currentScrollDate} visible={showStickyDate} />
            )}

            <FlatList
                data={itemsWithDates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    if (item.type === 'date') {
                        return <DateSeparator date={item.date} />;
                    } else {
                        return (
                            <MessageBubble
                                message={item.message}
                                isOwnMessage={item.message.sender._id === currentUserId}
                                currentUserId={currentUserId}
                                forceReadStatus={isAIChat}
                                onReact={onReact}
                                onRemoveReaction={onRemoveReaction}
                                onPin={onPin}
                                onUnpin={onUnpin}
                                onStar={onStar}
                                onUnstar={onUnstar}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                onForward={onForward}
                                onSetAutoDelete={onSetAutoDelete}
                                onCancelAutoDelete={onCancelAutoDelete}
                            />
                        );
                    }
                }}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
                inverted={false}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#6C5CE7"
                        />
                    ) : undefined
                }
            />
        </>
    );
}
