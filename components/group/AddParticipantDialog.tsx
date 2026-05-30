import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAllUsers } from '../../lib/hooks/user/useGetAllUsers';
import { useAddParticipant } from '../../lib/hooks/chat/useGroupChat';
import CustomAlert from '../common/CustomAlert';

interface AddParticipantDialogProps {
    visible: boolean;
    onClose: () => void;
    chatId: string;
    existingParticipantIds: string[];
}

export default function AddParticipantDialog({
    visible,
    onClose,
    chatId,
    existingParticipantIds,
}: AddParticipantDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
    }>({
        visible: false,
        title: '',
    });

    const { data: usersData, isLoading: loadingUsers } = useGetAllUsers();
    const { mutate: addParticipant, isPending: isAdding } = useAddParticipant();

    // Filter out existing participants and apply search
    const availableUsers =
        usersData?.data?.filter(
            (user: any) =>
                !existingParticipantIds.includes(user._id) &&
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

    const handleAddParticipant = (userId: string, username: string) => {
        addParticipant(
            { chatId, userId },
            {
                onSuccess: () => {
                    setAlertConfig({
                        visible: true,
                        title: 'Success',
                        message: `${username} added to the group`,
                    });
                    setTimeout(() => {
                        setAlertConfig({ visible: false, title: '' });
                        onClose();
                    }, 1500);
                },
                onError: (error: any) => {
                    setAlertConfig({
                        visible: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to add participant',
                    });
                },
            }
        );
    };

    const renderUser = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="flex-row items-center px-4 py-3 border-b border-gray-800"
            onPress={() => handleAddParticipant(item._id, item.username)}
            disabled={isAdding}
        >
            {item.profilePic ? (
                <Image source={{ uri: item.profilePic }} className="w-12 h-12 rounded-full" />
            ) : (
                <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center">
                    <Text className="text-white text-lg font-semibold">
                        {item.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <View className="flex-1 ml-3">
                <Text className="text-white text-base font-medium">{item.username}</Text>
                {item.bio && (
                    <Text className="text-gray-400 text-sm" numberOfLines={1}>
                        {item.bio}
                    </Text>
                )}
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#6C5CE7" />
        </TouchableOpacity>
    );

    return (
        <>
            <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
                <View className="flex-1 bg-[#0F172A]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800">
                        <TouchableOpacity onPress={onClose} disabled={isAdding}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-semibold">Add Participant</Text>
                        <View className="w-7" />
                    </View>

                    {/* Search Bar */}
                    <View className="px-4 py-3 border-b border-gray-800">
                        <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-white"
                                placeholder="Search users..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                editable={!isAdding}
                            />
                        </View>
                    </View>

                    {/* User List */}
                    {loadingUsers ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#6C5CE7" />
                        </View>
                    ) : (
                        <FlatList
                            data={availableUsers}
                            keyExtractor={(item) => item._id}
                            renderItem={renderUser}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-8">
                                    <Ionicons name="people-outline" size={48} color="#6B7280" />
                                    <Text className="text-gray-400 text-base mt-2">
                                        {searchQuery ? 'No users found' : 'All users are already in the group'}
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </Modal>

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={[
                    {
                        text: 'OK',
                        style: 'default',
                        onPress: () => setAlertConfig({ visible: false, title: '' }),
                    },
                ]}
                onClose={() => setAlertConfig({ visible: false, title: '' })}
            />
        </>
    );
}
