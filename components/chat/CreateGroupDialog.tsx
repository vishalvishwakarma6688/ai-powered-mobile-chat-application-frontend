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
import { useCreateGroupChat } from '../../lib/hooks/chat/useGroupChat';
import CustomAlert from '../common/CustomAlert';

interface CreateGroupDialogProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (chatId: string) => void;
}

export default function CreateGroupDialog({ visible, onClose, onSuccess }: CreateGroupDialogProps) {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
    }>({
        visible: false,
        title: '',
    });

    const { data: usersData, isLoading: loadingUsers } = useGetAllUsers();
    const { mutate: createGroup, isPending: isCreating } = useCreateGroupChat();

    // Filter users based on search
    const filteredUsers =
        usersData?.data?.filter((user: any) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

    const toggleUserSelection = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleCreate = () => {
        // Validate group name
        if (!groupName.trim()) {
            setAlertConfig({
                visible: true,
                title: 'Group Name Required',
                message: 'Please enter a group name',
            });
            return;
        }

        if (groupName.trim().length < 3) {
            setAlertConfig({
                visible: true,
                title: 'Invalid Group Name',
                message: 'Group name must be at least 3 characters',
            });
            return;
        }

        // Validate participants
        if (selectedUsers.size === 0) {
            setAlertConfig({
                visible: true,
                title: 'No Participants',
                message: 'Please select at least one participant',
            });
            return;
        }

        // Create group
        createGroup(
            {
                name: groupName.trim(),
                description: groupDescription.trim(),
                participantIds: Array.from(selectedUsers),
            },
            {
                onSuccess: (data) => {
                    // Reset state
                    setGroupName('');
                    setGroupDescription('');
                    setSelectedUsers(new Set());
                    setSearchQuery('');

                    // Close dialog
                    onClose();

                    // Call success callback
                    if (onSuccess) {
                        onSuccess(data.data._id);
                    }
                },
                onError: (error: any) => {
                    setAlertConfig({
                        visible: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to create group',
                    });
                },
            }
        );
    };

    const renderUser = ({ item }: { item: any }) => {
        const isSelected = selectedUsers.has(item._id);
        const checkboxClass = isSelected
            ? 'w-6 h-6 rounded-full border-2 items-center justify-center bg-[#6C5CE7] border-[#6C5CE7]'
            : 'w-6 h-6 rounded-full border-2 items-center justify-center border-gray-500';

        return (
            <TouchableOpacity
                className="flex-row items-center px-4 py-3 border-b border-gray-800"
                onPress={() => toggleUserSelection(item._id)}
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
                <View className={checkboxClass}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
            </TouchableOpacity>
        );
    };

    const createButtonClass =
        groupName.trim() && selectedUsers.size > 0 && !isCreating
            ? 'text-base font-semibold text-[#6C5CE7]'
            : 'text-base font-semibold text-gray-600';

    return (
        <>
            <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
                <View className="flex-1 bg-[#0F172A]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800">
                        <TouchableOpacity onPress={onClose} disabled={isCreating}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-semibold">New Group</Text>
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={!groupName.trim() || selectedUsers.size === 0 || isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color="#6C5CE7" />
                            ) : (
                                <Text className={createButtonClass}>Create</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Group Name Input */}
                    <View className="px-4 py-4 border-b border-gray-800">
                        <Text className="text-gray-400 text-sm mb-2">Group Name</Text>
                        <TextInput
                            className="bg-gray-800 rounded-lg px-4 py-3 text-white"
                            placeholder="Enter group name..."
                            placeholderTextColor="#9CA3AF"
                            value={groupName}
                            onChangeText={setGroupName}
                            maxLength={50}
                            editable={!isCreating}
                        />
                        <Text className="text-gray-500 text-xs mt-1">{groupName.length}/50</Text>
                    </View>

                    {/* Group Description Input */}
                    <View className="px-4 py-4 border-b border-gray-800">
                        <Text className="text-gray-400 text-sm mb-2">Description (Optional)</Text>
                        <TextInput
                            className="bg-gray-800 rounded-lg px-4 py-3 text-white"
                            placeholder="Add group description..."
                            placeholderTextColor="#9CA3AF"
                            value={groupDescription}
                            onChangeText={setGroupDescription}
                            maxLength={500}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={!isCreating}
                        />
                        <Text className="text-gray-500 text-xs mt-1">{groupDescription.length}/500</Text>
                    </View>

                    {/* Selected Count */}
                    {selectedUsers.size > 0 && (
                        <View className="px-4 py-2 bg-gray-800/50">
                            <Text className="text-[#6C5CE7] text-sm font-medium">
                                {selectedUsers.size} participant{selectedUsers.size > 1 ? 's' : ''} selected
                            </Text>
                        </View>
                    )}

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
                                editable={!isCreating}
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
                            data={filteredUsers}
                            keyExtractor={(item) => item._id}
                            renderItem={renderUser}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-8">
                                    <Ionicons name="people-outline" size={48} color="#6B7280" />
                                    <Text className="text-gray-400 text-base mt-2">
                                        {searchQuery ? 'No users found' : 'No users available'}
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
