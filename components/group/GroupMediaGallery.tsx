import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMessages } from '../../lib/hooks/message/useMessages';

interface GroupMediaGalleryProps {
    visible: boolean;
    onClose: () => void;
    chatId: string;
}

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

export default function GroupMediaGallery({ visible, onClose, chatId }: GroupMediaGalleryProps) {
    const [selectedTab, setSelectedTab] = useState<'media' | 'documents' | 'links'>('media');
    const { data: messagesData, isLoading } = useMessages(chatId);

    // Filter messages by type
    const mediaMessages = messagesData?.data?.filter(
        (msg) => msg.type === 'image' || msg.type === 'video'
    ) || [];

    const documentMessages = messagesData?.data?.filter(
        (msg) => msg.type === 'file'
    ) || [];

    const linkMessages = messagesData?.data?.filter(
        (msg) => msg.type === 'text' && msg.text && /https?:\/\/[^\s]+/.test(msg.text)
    ) || [];

    const renderMediaItem = ({ item }: { item: any }) => {
        if (item.type === 'image') {
            return (
                <TouchableOpacity className="m-1" style={{ width: ITEM_SIZE, height: ITEM_SIZE }}>
                    <Image
                        source={{ uri: item.mediaUrl }}
                        className="w-full h-full rounded-lg"
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            );
        } else if (item.type === 'video') {
            return (
                <TouchableOpacity className="m-1" style={{ width: ITEM_SIZE, height: ITEM_SIZE }}>
                    <Image
                        source={{ uri: item.thumbnailUrl || item.mediaUrl }}
                        className="w-full h-full rounded-lg"
                        resizeMode="cover"
                    />
                    <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-lg">
                        <Ionicons name="play-circle" size={40} color="#fff" />
                    </View>
                </TouchableOpacity>
            );
        }
        return null;
    };

    const renderDocumentItem = ({ item }: { item: any }) => (
        <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-gray-800">
            <View className="w-12 h-12 bg-gray-700 rounded-lg items-center justify-center">
                <Ionicons name="document-text" size={24} color="#6C5CE7" />
            </View>
            <View className="flex-1 ml-3">
                <Text className="text-white text-base font-medium" numberOfLines={1}>
                    {item.fileName || 'Document'}
                </Text>
                <Text className="text-gray-400 text-sm">
                    {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                </Text>
            </View>
            <Ionicons name="download-outline" size={20} color="#6C5CE7" />
        </TouchableOpacity>
    );

    const renderLinkItem = ({ item }: { item: any }) => {
        const urlMatch = item.text?.match(/https?:\/\/[^\s]+/);
        const url = urlMatch ? urlMatch[0] : '';

        return (
            <TouchableOpacity className="px-4 py-3 border-b border-gray-800">
                <Text className="text-[#6C5CE7] text-base" numberOfLines={1}>
                    {url}
                </Text>
                <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                    {item.text}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6C5CE7" />
                </View>
            );
        }

        if (selectedTab === 'media') {
            return (
                <FlatList
                    data={mediaMessages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMediaItem}
                    numColumns={3}
                    contentContainerStyle={{ padding: 8 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-12">
                            <Ionicons name="images-outline" size={64} color="#6B7280" />
                            <Text className="text-gray-400 text-base mt-4">No media shared yet</Text>
                        </View>
                    }
                />
            );
        } else if (selectedTab === 'documents') {
            return (
                <FlatList
                    data={documentMessages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderDocumentItem}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-12">
                            <Ionicons name="document-text-outline" size={64} color="#6B7280" />
                            <Text className="text-gray-400 text-base mt-4">No documents shared yet</Text>
                        </View>
                    }
                />
            );
        } else {
            return (
                <FlatList
                    data={linkMessages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderLinkItem}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-12">
                            <Ionicons name="link-outline" size={64} color="#6B7280" />
                            <Text className="text-gray-400 text-base mt-4">No links shared yet</Text>
                        </View>
                    }
                />
            );
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <View className="flex-1 bg-[#0F172A]">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800">
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-semibold">Group Media</Text>
                    <View className="w-7" />
                </View>

                {/* Tabs */}
                <View className="flex-row border-b border-gray-800">
                    <TouchableOpacity
                        className={`flex-1 py-3 items-center ${selectedTab === 'media' ? 'border-b-2 border-[#6C5CE7]' : ''
                            }`}
                        onPress={() => setSelectedTab('media')}
                    >
                        <Text
                            className={`font-medium ${selectedTab === 'media' ? 'text-[#6C5CE7]' : 'text-gray-400'
                                }`}
                        >
                            Media ({mediaMessages.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 items-center ${selectedTab === 'documents' ? 'border-b-2 border-[#6C5CE7]' : ''
                            }`}
                        onPress={() => setSelectedTab('documents')}
                    >
                        <Text
                            className={`font-medium ${selectedTab === 'documents' ? 'text-[#6C5CE7]' : 'text-gray-400'
                                }`}
                        >
                            Docs ({documentMessages.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 items-center ${selectedTab === 'links' ? 'border-b-2 border-[#6C5CE7]' : ''
                            }`}
                        onPress={() => setSelectedTab('links')}
                    >
                        <Text
                            className={`font-medium ${selectedTab === 'links' ? 'text-[#6C5CE7]' : 'text-gray-400'
                                }`}
                        >
                            Links ({linkMessages.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {renderContent()}
            </View>
        </Modal>
    );
}
