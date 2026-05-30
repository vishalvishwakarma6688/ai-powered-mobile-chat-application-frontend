import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useSearchMessages } from '../../lib/hooks/message/useSearchMessages';
import { router } from 'expo-router';
import { Message } from '../../lib/api/message/messageApi';

interface SearchMessagesDialogProps {
    visible: boolean;
    onClose: () => void;
}

export default function SearchMessagesDialog({
    visible,
    onClose,
}: SearchMessagesDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading, error } = useSearchMessages(debouncedQuery, visible);

    // Debug logging
    useEffect(() => {
        if (debouncedQuery) {
            console.log('🔍 Search Debug:', {
                query: debouncedQuery,
                isLoading,
                hasError: !!error,
                errorMessage: error?.message,
                resultCount: data?.data?.length || 0,
                results: data?.data?.map(m => ({
                    id: m._id,
                    text: m.text?.substring(0, 50),
                    isEncrypted: m.isEncrypted
                }))
            });
        }
    }, [debouncedQuery, data, isLoading, error]);

    const handleClose = () => {
        setSearchQuery('');
        setDebouncedQuery('');
        onClose();
    };

    const handleResultPress = (message: Message) => {
        handleClose();
        // Navigate to the chat with the message
        router.push(`/chat/${message.chatId}`);
        // TODO: Scroll to specific message (would need additional implementation)
    };

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            return `${formattedHours}:${formattedMinutes} ${ampm}`;
        }

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[date.getDay()];
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const highlightText = (text: string, query: string) => {
        if (!query.trim()) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts;
    };

    const getChatName = (message: Message) => {
        // For now, we'll use the chat ID or sender name
        // In a real app, you'd fetch chat details
        return message.chatId?.name || message.sender?.username || 'Unknown Chat';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-[#0F172A]"
            >
                {/* Header */}
                <View className="px-4 py-3 border-b border-slate-800 flex-row items-center bg-[#0F172A]" style={{ paddingTop: 50 }}>
                    <TouchableOpacity
                        onPress={handleClose}
                        className="w-10 h-10 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Search Input */}
                    <View className="flex-1 ml-2 bg-slate-800 rounded-lg flex-row items-center px-3">
                        <Ionicons name="search" size={20} color="#94A3B8" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search messages..."
                            placeholderTextColor="#64748B"
                            className="flex-1 text-white text-base py-2 px-2"
                            autoFocus
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#64748B" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Results */}
                <ScrollView
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                >
                    {isLoading ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator size="large" color="#6C5CE7" />
                            <Text className="text-slate-400 mt-4">Searching...</Text>
                        </View>
                    ) : error ? (
                        <View className="py-8 items-center px-6">
                            <Ionicons name="alert-circle" size={48} color="#EF4444" />
                            <Text className="text-white text-lg font-semibold mt-4">
                                Search Failed
                            </Text>
                            <Text className="text-slate-400 text-center mt-2">
                                {(error as Error).message || 'Something went wrong'}
                            </Text>
                        </View>
                    ) : !debouncedQuery.trim() ? (
                        <View className="py-8 items-center px-6">
                            <Ionicons name="search" size={64} color="#6C5CE7" />
                            <Text className="text-white text-lg font-semibold mt-4">
                                Search Messages
                            </Text>
                            <Text className="text-slate-400 text-center mt-2">
                                Type to search across all your chats
                            </Text>
                        </View>
                    ) : data?.data.length === 0 ? (
                        <View className="py-8 items-center px-6">
                            <Ionicons name="document-text-outline" size={64} color="#64748B" />
                            <Text className="text-white text-lg font-semibold mt-4">
                                No Results Found
                            </Text>
                            <Text className="text-slate-400 text-center mt-2">
                                No messages found for "{debouncedQuery}"
                            </Text>
                        </View>
                    ) : (
                        <View className="py-2">
                            <Text className="text-slate-400 text-sm px-4 py-2">
                                {data?.data.length} result{data?.data.length !== 1 ? 's' : ''} found
                            </Text>
                            {data?.data.map((message) => {
                                const textParts = highlightText(message.text || '', debouncedQuery);

                                return (
                                    <TouchableOpacity
                                        key={message._id}
                                        onPress={() => handleResultPress(message)}
                                        className="px-4 py-3 border-b border-slate-800 active:bg-slate-800/50"
                                    >
                                        {/* Chat Name */}
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="text-[#6C5CE7] text-sm font-medium">
                                                {getChatName(message)}
                                            </Text>
                                            <Text className="text-slate-500 text-xs">
                                                {formatTimestamp(message.createdAt)}
                                            </Text>
                                        </View>

                                        {/* Sender */}
                                        <Text className="text-slate-400 text-xs mb-1">
                                            {message.sender?.username}
                                        </Text>

                                        {/* Message Text with Highlighting */}
                                        <View className="flex-row flex-wrap">
                                            {textParts.map((part, index) => (
                                                <Text
                                                    key={index}
                                                    className={`text-base ${part.toLowerCase() === debouncedQuery.toLowerCase()
                                                        ? 'text-[#FCD34D] font-semibold'
                                                        : 'text-white'
                                                        }`}
                                                >
                                                    {part}
                                                </Text>
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}
