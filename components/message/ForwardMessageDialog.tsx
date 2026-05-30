import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useChats } from '../../lib/hooks/chat/useChats';
import { useAuthStore } from '../../lib/store/authStore';

interface ForwardMessageDialogProps {
    visible: boolean;
    onClose: () => void;
    onForward: (targetChatIds: string[]) => void;
    currentChatId: string;
}

export default function ForwardMessageDialog({
    visible,
    onClose,
    onForward,
    currentChatId,
}: ForwardMessageDialogProps) {
    const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
    const { data: chatsData, isLoading } = useChats();
    const { user } = useAuthStore();

    // Filter out current chat
    const availableChats = chatsData?.data?.filter(chat => chat._id !== currentChatId) || [];

    useEffect(() => {
        if (visible) {
            console.log('📋 Forward Dialog - Available chat:', {
                chatId: availableChats[0]?._id,
                participants: availableChats[0]?.participants?.map(p => p.userId?.username)
            });
        }
    }, [visible, availableChats]);

    const handleToggleChat = (chatId: string) => {
        console.log('🔘 Toggle chat:', chatId);
        setSelectedChatIds(prev =>
            prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId]
        );
    };

    const handleForward = () => {
        console.log('📤 Forwarding to:', selectedChatIds);
        if (selectedChatIds.length > 0) {
            onForward(selectedChatIds);
            setSelectedChatIds([]);
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedChatIds([]);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleClose}
                className="flex-1 bg-black/50 justify-end"
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    className="bg-[#1E293B] rounded-t-3xl"
                    style={{ maxHeight: '80%' }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-700">
                        <Text className="text-white text-lg font-semibold">
                            Forward to...
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Chat List */}
                    <ScrollView style={{ maxHeight: 400 }}>
                        {isLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="large" color="#6C5CE7" />
                            </View>
                        ) : availableChats.length === 0 ? (
                            <View className="py-8 items-center px-5">
                                <Ionicons name="chatbubbles-outline" size={48} color="#6C5CE7" style={{ marginBottom: 12 }} />
                                <Text className="text-slate-400 text-base text-center">
                                    No other chats available
                                </Text>
                                <Text className="text-slate-500 text-sm text-center mt-2">
                                    Start a new chat to forward messages
                                </Text>
                            </View>
                        ) : (
                            availableChats.map((chat) => {
                                const isSelected = selectedChatIds.includes(chat._id);

                                // Get chat name based on type
                                let chatName = 'Unknown';
                                if (chat.isGroup) {
                                    chatName = chat.name || 'Group Chat';
                                } else {
                                    // For one-on-one chats, find the other participant
                                    const otherParticipant = chat.participants?.find(
                                        (p) => p.userId?._id !== user?._id
                                    );
                                    chatName = otherParticipant?.userId?.username || 'Unknown';
                                }

                                return (
                                    <TouchableOpacity
                                        key={chat._id}
                                        onPress={() => handleToggleChat(chat._id)}
                                        className={`flex-row items-center px-5 py-4 border-b border-slate-800 ${isSelected ? 'bg-slate-800' : ''
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <View className="w-12 h-12 rounded-full bg-slate-700 items-center justify-center mr-3">
                                            <Text className="text-white text-base font-bold">
                                                {chatName.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>

                                        {/* Chat Info */}
                                        <View className="flex-1">
                                            <Text className="text-white text-base font-medium">
                                                {chatName}
                                            </Text>
                                            {chat.isGroup && (
                                                <Text className="text-slate-400 text-sm mt-0.5">
                                                    {chat.participants?.length || 0} participants
                                                </Text>
                                            )}
                                        </View>

                                        {/* Checkbox */}
                                        <View
                                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected
                                                    ? 'bg-[#6C5CE7] border-[#6C5CE7]'
                                                    : 'border-slate-600'
                                                }`}
                                        >
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={16} color="white" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View className="px-5 py-4 border-t border-slate-700 bg-[#1E293B]">
                        <TouchableOpacity
                            onPress={handleForward}
                            disabled={selectedChatIds.length === 0}
                            className={`py-3 rounded-xl items-center ${selectedChatIds.length > 0
                                    ? 'bg-[#6C5CE7]'
                                    : 'bg-slate-700'
                                }`}
                        >
                            <Text
                                className={`text-base font-semibold ${selectedChatIds.length > 0 ? 'text-white' : 'text-slate-500'
                                    }`}
                            >
                                {selectedChatIds.length > 0
                                    ? `Forward to ${selectedChatIds.length} chat${selectedChatIds.length > 1 ? 's' : ''}`
                                    : 'Select a chat to forward'
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
