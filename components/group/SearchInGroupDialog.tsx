import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMessages } from '../../lib/hooks/message/useMessages';

interface SearchInGroupDialogProps {
    visible: boolean;
    onClose: () => void;
    chatId: string;
}

export default function SearchInGroupDialog({ visible, onClose, chatId }: SearchInGroupDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: messagesData, isLoading } = useMessages(chatId);

    // Filter messages based on search query
    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        return (
            messagesData?.data?.filter((msg) => {
                // Search in text messages
                if (msg.type === 'text' && msg.text?.toLowerCase().includes(query)) {
                    return true;
                }
                // Search in file names
                if (msg.type === 'file' && msg.fileName?.toLowerCase().includes(query)) {
                    return true;
                }
                // Search in sender name
                if (msg.sender?.username?.toLowerCase().includes(query)) {
                    return true;
                }
                return false;
            }) || []
        );
    }, [searchQuery, messagesData]);

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[date.getDay()];
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const highlightText = (text: string, query: string) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <Text key={index} className="bg-[#6C5CE7] text-white">
                    {part}
                </Text>
            ) : (
                <Text key={index}>{part}</Text>
            )
        );
    };

    const renderMessageItem = ({ item }: { item: any }) => {
        const messageText = item.type === 'text' ? item.text : item.fileName || 'Media';

        return (
            <TouchableOpacity className="px-4 py-3 border-b border-gray-800">
                <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-[#6C5CE7] text-sm font-medium">
                        {item.sender?.username || 'Unknown'}
                    </Text>
                    <Text className="text-gray-500 text-xs">{formatTimestamp(item.createdAt)}</Text>
                </View>
                <Text className="text-white text-base" numberOfLines={2}>
                    {highlightText(messageText, searchQuery)}
                </Text>
                {item.type !== 'text' && (
                    <View className="flex-row items-center mt-1">
                        <Ionicons
                            name={
                                item.type === 'image'
                                    ? 'image-outline'
                                    : item.type === 'video'
                                        ? 'videocam-outline'
                                        : 'document-text-outline'
                            }
                            size={14}
                            color="#9CA3AF"
                        />
                        <Text className="text-gray-400 text-xs ml-1">
                            {item.type === 'image'
                                ? 'Photo'
                                : item.type === 'video'
                                    ? 'Video'
                                    : 'Document'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <View className="flex-1 bg-[#0F172A]">
                {/* Header */}
                <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-gray-800">
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-semibold ml-4">Search in Group</Text>
                </View>

                {/* Search Bar */}
                <View className="px-4 py-3 border-b border-gray-800">
                    <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-white"
                            placeholder="Search messages..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Results */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#6C5CE7" />
                    </View>
                ) : searchQuery.trim() === '' ? (
                    <View className="flex-1 items-center justify-center">
                        <Ionicons name="search-outline" size={64} color="#6B7280" />
                        <Text className="text-gray-400 text-base mt-4">
                            Search for messages, media, or links
                        </Text>
                    </View>
                ) : (
                    <View className="flex-1">
                        <View className="px-4 py-2 bg-gray-800/50">
                            <Text className="text-gray-400 text-sm">
                                {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
                            </Text>
                        </View>
                        <FlatList
                            data={filteredMessages}
                            keyExtractor={(item) => item._id}
                            renderItem={renderMessageItem}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-12">
                                    <Ionicons name="search-outline" size={64} color="#6B7280" />
                                    <Text className="text-gray-400 text-base mt-4">No results found</Text>
                                    <Text className="text-gray-500 text-sm mt-2">
                                        Try different keywords
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                )}
            </View>
        </Modal>
    );
}
