import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import {
    useAddParticipant,
    useRemoveParticipant,
    useUpdateGroupDetails,
    usePromoteToAdmin,
    useLeaveGroup,
    useUploadGroupIcon,
} from '../../lib/hooks/chat/useGroupChat';
import { muteChat } from '../../lib/api/chat/chatApi';
import { BASE_URL } from '../../lib/api/client';
import { useMessages } from '../../lib/hooks/message/useMessages';
import { useDeleteMessage } from '../../lib/hooks/message/useDelete';
import CustomAlert from '../../components/common/CustomAlert';
import CustomPopupMenu, { PopupMenuItem } from '../../components/common/CustomPopupMenu';
import AddParticipantDialog from '../../components/group/AddParticipantDialog';
import GroupMediaGallery from '../../components/group/GroupMediaGallery';
import SearchInGroupDialog from '../../components/group/SearchInGroupDialog';

export default function GroupInfoScreen() {
    const { chatId, chatData } = useLocalSearchParams();
    const { user } = useAuthStore();

    // Parse initial chat data and maintain local state for immediate updates
    const initialChat = chatData ? JSON.parse(chatData as string) : null;
    const [localChat, setLocalChat] = useState(initialChat);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [showMediaGallery, setShowMediaGallery] = useState(false);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{
            text: string;
            onPress?: () => void;
            style?: 'default' | 'cancel' | 'destructive';
        }>;
    }>({
        visible: false,
        title: '',
    });

    // Use local chat state
    const chat = localChat;

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

    // Mutations
    const { mutate: updateDetails, isPending: isUpdating } = useUpdateGroupDetails();
    const { mutate: removeParticipant, isPending: isRemoving } = useRemoveParticipant();
    const { mutate: promoteUser, isPending: isPromoting } = usePromoteToAdmin();
    const { mutate: leaveGroup, isPending: isLeaving } = useLeaveGroup();
    const { mutate: uploadIcon, isPending: isUploadingIcon } = useUploadGroupIcon();

    // Get messages for export and clear
    const { data: messagesData } = useMessages(chatId as string);
    const { mutate: deleteMessage } = useDeleteMessage();

    if (!chat || !chat.isGroup) {
        return (
            <SafeAreaView className="flex-1 bg-[#0F172A]">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-white text-lg">Invalid group</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Check if current user is admin
    const currentUserParticipant = chat.participants.find(
        (p: any) => p.userId._id === user?._id
    );
    const isAdmin = currentUserParticipant?.role === 'admin';

    const handleUpdateName = () => {
        if (!newGroupName.trim()) {
            setAlertConfig({
                visible: true,
                title: 'Invalid Name',
                message: 'Group name cannot be empty',
            });
            return;
        }

        // Optimistic update
        setLocalChat((prev: any) => ({
            ...prev,
            name: newGroupName.trim(),
        }));
        setIsEditingName(false);
        setNewGroupName('');

        updateDetails(
            {
                chatId: chatId as string,
                updates: { name: newGroupName.trim() },
            },
            {
                onError: (error: any) => {
                    // Revert on error
                    setLocalChat(initialChat);
                    setAlertConfig({
                        visible: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to update group name',
                    });
                },
            }
        );
    };

    const handleUpdateDescription = () => {
        const updatedDescription = newGroupDescription.trim();

        // Optimistic update
        setLocalChat((prev: any) => ({
            ...prev,
            description: updatedDescription,
        }));
        setIsEditingDescription(false);
        setNewGroupDescription('');

        updateDetails(
            {
                chatId: chatId as string,
                updates: { description: updatedDescription },
            },
            {
                onError: (error: any) => {
                    // Revert on error
                    setLocalChat(initialChat);
                    setAlertConfig({
                        visible: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to update group description',
                    });
                },
            }
        );
    };

    const handleRemoveParticipant = (userId: string, username: string) => {
        console.log('🔧 [UI] handleRemoveParticipant called');
        console.log('   User ID to remove:', userId);
        console.log('   Username:', username);
        console.log('   Chat ID:', chatId);

        setAlertConfig({
            visible: true,
            title: 'Remove Participant',
            message: `Remove ${username} from the group?`,
            buttons: [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        console.log('❌ [UI] User cancelled removal');
                        setAlertConfig({ visible: false, title: '' });
                    },
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        console.log('✅ [UI] User confirmed removal');
                        setAlertConfig({ visible: false, title: '' });

                        const previousParticipants = chat.participants;
                        console.log('   Previous participants count:', previousParticipants.length);

                        // Optimistic update - remove participant from local state
                        setLocalChat((prev: any) => {
                            const updated = {
                                ...prev,
                                participants: prev.participants.filter(
                                    (p: any) => p.userId._id !== userId
                                ),
                            };
                            console.log('🔄 [UI] Optimistic update applied');
                            console.log('   New participants count:', updated.participants.length);
                            return updated;
                        });

                        console.log('📡 [UI] Calling removeParticipant mutation');
                        removeParticipant(
                            { chatId: chatId as string, userId },
                            {
                                onSuccess: (data) => {
                                    console.log('✅ [UI] Remove participant mutation succeeded');
                                    console.log('   Response data:', data);
                                },
                                onError: (error: any) => {
                                    console.error('❌ [UI] Remove participant mutation failed');
                                    console.error('   Error:', error);

                                    // Revert on error
                                    setLocalChat((prev: any) => ({
                                        ...prev,
                                        participants: previousParticipants,
                                    }));
                                    console.log('🔄 [UI] Reverted to previous state');

                                    setAlertConfig({
                                        visible: true,
                                        title: 'Error',
                                        message:
                                            error.response?.data?.message ||
                                            'Failed to remove participant',
                                    });
                                },
                            }
                        );
                    },
                },
            ],
        });
    };

    const handlePromoteToAdmin = (userId: string, username: string) => {
        setAlertConfig({
            visible: true,
            title: 'Promote to Admin',
            message: `Make ${username} a group admin?`,
            buttons: [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setAlertConfig({ visible: false, title: '' }),
                },
                {
                    text: 'Promote',
                    style: 'default',
                    onPress: () => {
                        setAlertConfig({ visible: false, title: '' });

                        // Optimistic update - promote participant to admin
                        setLocalChat((prev: any) => ({
                            ...prev,
                            participants: prev.participants.map((p: any) =>
                                p.userId._id === userId
                                    ? { ...p, role: 'admin' }
                                    : p
                            ),
                        }));

                        promoteUser(
                            { chatId: chatId as string, userId },
                            {
                                onError: (error: any) => {
                                    // Revert on error
                                    setLocalChat(initialChat);
                                    setAlertConfig({
                                        visible: true,
                                        title: 'Error',
                                        message:
                                            error.response?.data?.message || 'Failed to promote user',
                                    });
                                },
                            }
                        );
                    },
                },
            ],
        });
    };

    const handleLeaveGroup = () => {
        setAlertConfig({
            visible: true,
            title: 'Leave Group',
            message: 'Are you sure you want to leave this group?',
            buttons: [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setAlertConfig({ visible: false, title: '' }),
                },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => {
                        setAlertConfig({ visible: false, title: '' });
                        leaveGroup(chatId as string, {
                            onSuccess: () => {
                                router.back();
                            },
                            onError: (error: any) => {
                                setAlertConfig({
                                    visible: true,
                                    title: 'Error',
                                    message: error.response?.data?.message || 'Failed to leave group',
                                });
                            },
                        });
                    },
                },
            ],
        });
    };

    // Handle group icon upload
    const handleGroupIconUpload = async () => {
        try {
            const ImagePicker = require('expo-image-picker');

            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Required',
                    message: 'Please grant permission to access your photos.',
                    buttons: [{ text: 'OK', style: 'default' }],
                });
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;

                // Optimistic update - show selected image immediately
                setLocalChat((prev: any) => ({
                    ...prev,
                    groupIcon: imageUri, // Keep local URI
                }));

                // Upload the icon
                uploadIcon(
                    { chatId: chatId as string, imageUri },
                    {
                        onSuccess: (data) => {
                            // Update with server URL (will be converted to full URL by getFullImageUrl)
                            setLocalChat((prev: any) => ({
                                ...prev,
                                groupIcon: data.data.groupIcon,
                            }));
                        },
                        onError: (error: any) => {
                            // Revert on error
                            setLocalChat((prev: any) => ({
                                ...prev,
                                groupIcon: initialChat?.groupIcon || null,
                            }));
                            setAlertConfig({
                                visible: true,
                                title: 'Error',
                                message: error.response?.data?.message || 'Failed to upload group icon',
                                buttons: [{ text: 'OK', style: 'default' }],
                            });
                        },
                    }
                );
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to select image. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    };

    // Get mute status
    const isMuted = chat?.participants.find((p: any) => p.userId._id === user?._id)?.isMuted || false;

    // Handle mute/unmute
    const handleMuteToggle = async () => {
        if (!chatId) return;
        try {
            await muteChat(chatId as string, !isMuted);
            setAlertConfig({
                visible: true,
                title: 'Success',
                message: `Group ${!isMuted ? 'muted' : 'unmuted'} successfully`,
                buttons: [{ text: 'OK', style: 'default' }],
            });
        } catch (error) {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: `Failed to ${!isMuted ? 'mute' : 'unmute'} group`,
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    };

    // Handle search in group
    const handleSearchInGroup = () => {
        setShowOptionsMenu(false);
        setShowSearchDialog(true);
    };

    // Handle group media
    const handleGroupMedia = () => {
        setShowOptionsMenu(false);
        setShowMediaGallery(true);
    };

    // Handle export chat
    const handleExportChat = async () => {
        setShowOptionsMenu(false);

        if (!messagesData?.data || messagesData.data.length === 0) {
            setAlertConfig({
                visible: true,
                title: 'No Messages',
                message: 'There are no messages to export',
                buttons: [{ text: 'OK', style: 'default' }],
            });
            return;
        }

        try {
            // Format messages for export
            const exportText = messagesData.data
                .map((msg) => {
                    const timestamp = new Date(msg.createdAt).toLocaleString();
                    const sender = msg.sender?.username || 'Unknown';
                    const content = msg.type === 'text' ? msg.text : `[${msg.type}]`;
                    return `[${timestamp}] ${sender}: ${content}`;
                })
                .join('\n\n');

            // Share the exported chat
            await Share.share({
                message: `Chat Export - ${chat.name}\n\n${exportText}`,
                title: `${chat.name} - Chat Export`,
            });
        } catch (error) {
            console.error('Error exporting chat:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to export chat',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    };

    // Handle clear chat
    const handleClearChat = () => {
        setShowOptionsMenu(false);

        if (!messagesData?.data || messagesData.data.length === 0) {
            setAlertConfig({
                visible: true,
                title: 'No Messages',
                message: 'There are no messages to clear',
                buttons: [{ text: 'OK', style: 'default' }],
            });
            return;
        }

        setAlertConfig({
            visible: true,
            title: 'Clear Chat',
            message: `Are you sure you want to delete all ${messagesData.data.length} messages in this group? This action cannot be undone.`,
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        // Delete all messages
                        messagesData.data.forEach((msg) => {
                            if (msg.sender._id === user?._id) {
                                deleteMessage({
                                    messageId: msg._id,
                                    deleteForEveryone: false,
                                });
                            }
                        });

                        setAlertConfig({
                            visible: true,
                            title: 'Success',
                            message: 'Chat cleared successfully',
                            buttons: [{ text: 'OK', style: 'default' }],
                        });
                    },
                },
            ],
        });
    };

    // Handle report group
    const handleReportGroup = () => {
        setShowOptionsMenu(false);
        setAlertConfig({
            visible: true,
            title: 'Report Group',
            message: 'Report this group for spam or abuse?',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Report',
                    style: 'destructive',
                    onPress: () => {
                        // In a real app, this would send a report to the server
                        setAlertConfig({
                            visible: true,
                            title: 'Reported',
                            message: 'Thank you for your report. We will review this group.',
                            buttons: [{ text: 'OK', style: 'default' }],
                        });
                    },
                },
            ],
        });
    };

    // Menu items for three-dot menu
    const menuItems: PopupMenuItem[] = [
        {
            icon: 'search-outline',
            label: 'Search in Group',
            onPress: handleSearchInGroup,
        },
        {
            icon: isMuted ? 'volume-high-outline' : 'volume-mute-outline',
            label: isMuted ? 'Unmute Group' : 'Mute Group',
            onPress: () => {
                setShowOptionsMenu(false);
                handleMuteToggle();
            },
        },
        {
            icon: 'images-outline',
            label: 'Group Media',
            onPress: handleGroupMedia,
        },
        {
            icon: 'download-outline',
            label: 'Export Chat',
            onPress: handleExportChat,
        },
        {
            icon: 'trash-outline',
            label: 'Clear Chat',
            onPress: handleClearChat,
        },
        {
            icon: 'flag-outline',
            label: 'Report Group',
            destructive: true,
            onPress: handleReportGroup,
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]">
            {/* Header with Three-Dot Menu */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-semibold ml-4">Group Info</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowOptionsMenu(true)}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="ellipsis-vertical" size={20} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Modern Group Header */}
                <View className="items-center py-8 bg-gradient-to-b from-gray-800/30 to-transparent">
                    {/* Group Avatar with Edit Button */}
                    <View className="relative">
                        {chat.groupIcon ? (
                            <Image source={{ uri: getFullImageUrl(chat.groupIcon) || undefined }} className="w-32 h-32 rounded-full border-4 border-gray-700" />
                        ) : (
                            <View className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#8B5CF6] items-center justify-center border-4 border-gray-700 shadow-lg">
                                <Ionicons name="people" size={56} color="#fff" />
                            </View>
                        )}
                        {isAdmin && (
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 w-10 h-10 bg-[#6C5CE7] rounded-full items-center justify-center border-4 border-[#0F172A] shadow-lg"
                                onPress={handleGroupIconUpload}
                            >
                                <Ionicons name="camera" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Group Name */}
                    {isEditingName ? (
                        <View className="mt-6 w-full px-6">
                            <TextInput
                                className="bg-gray-800/80 rounded-xl px-4 py-3 text-white text-center text-lg border border-gray-700"
                                placeholder="Enter group name..."
                                placeholderTextColor="#9CA3AF"
                                value={newGroupName}
                                onChangeText={setNewGroupName}
                                maxLength={50}
                                autoFocus
                            />
                            <Text className="text-gray-500 text-xs text-center mt-1">{newGroupName.length}/50</Text>
                            <View className="flex-row justify-center mt-4 gap-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsEditingName(false);
                                        setNewGroupName('');
                                    }}
                                    className="px-6 py-2.5 bg-gray-700/80 rounded-xl"
                                >
                                    <Text className="text-white font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleUpdateName}
                                    className="px-6 py-2.5 bg-[#6C5CE7] rounded-xl"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text className="text-white font-medium">Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View className="items-center mt-6">
                            <View className="flex-row items-center">
                                <Text className="text-white text-2xl font-bold">{chat.name}</Text>
                                {isAdmin && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setNewGroupName(chat.name);
                                            setIsEditingName(true);
                                        }}
                                        className="ml-2 w-8 h-8 items-center justify-center"
                                    >
                                        <Ionicons name="pencil" size={18} color="#6C5CE7" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text className="text-gray-400 text-sm mt-2">
                                Group · {chat.participants.length} participants
                            </Text>
                        </View>
                    )}
                </View>

                {/* Group Description */}
                <View className="px-4 py-4 border-b border-gray-800">
                    <Text className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
                        Description
                    </Text>
                    {isEditingDescription ? (
                        <View>
                            <TextInput
                                className="bg-gray-800/80 rounded-xl px-4 py-3 text-white text-base border border-gray-700"
                                placeholder="Add group description..."
                                placeholderTextColor="#9CA3AF"
                                value={newGroupDescription}
                                onChangeText={setNewGroupDescription}
                                maxLength={500}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                autoFocus
                            />
                            <Text className="text-gray-500 text-xs mt-1">{newGroupDescription.length}/500</Text>
                            <View className="flex-row justify-end mt-3 gap-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsEditingDescription(false);
                                        setNewGroupDescription('');
                                    }}
                                    className="px-6 py-2.5 bg-gray-700/80 rounded-xl"
                                >
                                    <Text className="text-white font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleUpdateDescription}
                                    className="px-6 py-2.5 bg-[#6C5CE7] rounded-xl"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text className="text-white font-medium">Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => {
                                if (isAdmin) {
                                    setNewGroupDescription(chat.description || '');
                                    setIsEditingDescription(true);
                                }
                            }}
                            disabled={!isAdmin}
                            className="flex-row items-start"
                        >
                            <Text className="text-gray-300 text-base flex-1">
                                {chat.description || (isAdmin ? 'Add group description...' : 'No description')}
                            </Text>
                            {isAdmin && (
                                <Ionicons name="pencil" size={16} color="#6C5CE7" className="ml-2" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Quick Actions */}
                <View className="px-4 py-4 flex-row justify-around border-b border-gray-800">
                    <TouchableOpacity
                        className="items-center"
                        onPress={handleSearchInGroup}
                    >
                        <View className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center mb-2">
                            <Ionicons name="search-outline" size={24} color="#6C5CE7" />
                        </View>
                        <Text className="text-gray-400 text-xs">Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="items-center"
                        onPress={handleMuteToggle}
                    >
                        <View className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center mb-2">
                            <Ionicons name={isMuted ? "volume-high-outline" : "volume-mute-outline"} size={24} color="#6C5CE7" />
                        </View>
                        <Text className="text-gray-400 text-xs">{isMuted ? 'Unmute' : 'Mute'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="items-center"
                        onPress={handleGroupMedia}
                    >
                        <View className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center mb-2">
                            <Ionicons name="images-outline" size={24} color="#6C5CE7" />
                        </View>
                        <Text className="text-gray-400 text-xs">Media</Text>
                    </TouchableOpacity>
                </View>

                {/* Participants Section */}
                <View className="mt-4">
                    <View className="flex-row items-center justify-between px-4 py-3">
                        <Text className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                            {chat.participants.length} Participants
                        </Text>
                        {isAdmin && (
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => setShowAddParticipant(true)}
                            >
                                <Ionicons name="person-add-outline" size={18} color="#6C5CE7" />
                                <Text className="text-[#6C5CE7] text-sm font-medium ml-1">Add</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {chat.participants.map((participant: any, index: number) => (
                        <TouchableOpacity
                            key={participant.userId._id}
                            className="flex-row items-center px-4 py-3 active:bg-gray-800/50"
                            onLongPress={() => {
                                if (isAdmin && participant.userId._id !== user?._id) {
                                    // Show options for admin
                                    setAlertConfig({
                                        visible: true,
                                        title: participant.userId.username,
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                style: 'cancel',
                                                onPress: () => setAlertConfig({ visible: false, title: '' }),
                                            },
                                            ...(participant.role !== 'admin'
                                                ? [
                                                    {
                                                        text: 'Make Admin',
                                                        style: 'default' as const,
                                                        onPress: () => {
                                                            setAlertConfig({ visible: false, title: '' });
                                                            // Use setTimeout to ensure the first alert is fully closed before showing the second
                                                            setTimeout(() => {
                                                                handlePromoteToAdmin(
                                                                    participant.userId._id,
                                                                    participant.userId.username
                                                                );
                                                            }, 100);
                                                        },
                                                    },
                                                ]
                                                : []),
                                            {
                                                text: 'Remove',
                                                style: 'destructive' as const,
                                                onPress: () => {
                                                    setAlertConfig({ visible: false, title: '' });
                                                    // Use setTimeout to ensure the first alert is fully closed before showing the second
                                                    setTimeout(() => {
                                                        handleRemoveParticipant(
                                                            participant.userId._id,
                                                            participant.userId.username
                                                        );
                                                    }, 100);
                                                },
                                            },
                                        ],
                                    });
                                }
                            }}
                        >
                            {/* Avatar */}
                            <View className="relative">
                                {participant.userId.profilePic ? (
                                    <Image
                                        source={{ uri: participant.userId.profilePic }}
                                        className="w-12 h-12 rounded-full"
                                    />
                                ) : (
                                    <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center">
                                        <Text className="text-white text-lg font-semibold">
                                            {participant.userId.username.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                {/* Online indicator */}
                                {participant.userId.isOnline && (
                                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0F172A]" />
                                )}
                            </View>

                            {/* User Info */}
                            <View className="flex-1 ml-3">
                                <View className="flex-row items-center">
                                    <Text className="text-white text-base font-medium">
                                        {participant.userId.username}
                                    </Text>
                                    {participant.userId._id === user?._id && (
                                        <View className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full">
                                            <Text className="text-gray-300 text-xs">You</Text>
                                        </View>
                                    )}
                                </View>
                                {participant.role === 'admin' && (
                                    <View className="flex-row items-center mt-0.5">
                                        <Ionicons name="shield-checkmark" size={14} color="#6C5CE7" />
                                        <Text className="text-[#6C5CE7] text-sm ml-1">Group Admin</Text>
                                    </View>
                                )}
                            </View>

                            {/* Admin actions indicator */}
                            {isAdmin && participant.userId._id !== user?._id && (
                                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Danger Zone */}
                <View className="mt-6 px-4 pb-6">
                    <Text className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3 px-0">
                        Danger Zone
                    </Text>
                    <TouchableOpacity
                        onPress={handleLeaveGroup}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl py-4 items-center"
                        disabled={isLeaving}
                    >
                        {isLeaving ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <View className="flex-row items-center">
                                <Ionicons name="exit-outline" size={20} color="#EF4444" />
                                <Text className="text-red-500 font-semibold ml-2">Leave Group</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Three-Dot Menu */}
            <CustomPopupMenu
                visible={showOptionsMenu}
                items={menuItems}
                onClose={() => setShowOptionsMenu(false)}
            />

            {/* Add Participant Dialog */}
            <AddParticipantDialog
                visible={showAddParticipant}
                onClose={() => setShowAddParticipant(false)}
                chatId={chatId as string}
                existingParticipantIds={chat.participants.map((p: any) => p.userId._id)}
            />

            {/* Group Media Gallery */}
            <GroupMediaGallery
                visible={showMediaGallery}
                onClose={() => setShowMediaGallery(false)}
                chatId={chatId as string}
            />

            {/* Search in Group Dialog */}
            <SearchInGroupDialog
                visible={showSearchDialog}
                onClose={() => setShowSearchDialog(false)}
                chatId={chatId as string}
            />

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig({ visible: false, title: '' })}
            />
        </SafeAreaView>
    );
}
