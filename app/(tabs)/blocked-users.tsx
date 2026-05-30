import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useBlockedUsers, useUnblockUser } from '../../lib/hooks/user/useBlock';
import { BlockedUser } from '../../lib/api/user/blockApi';
import CustomAlert from '../../components/common/CustomAlert';

export default function BlockedUsersScreen() {
    console.log('📱 BlockedUsersScreen rendered');

    const { data, isLoading, error, refetch } = useBlockedUsers();

    console.log('🔍 Blocked users data:', {
        hasData: !!data,
        dataLength: data?.data?.length,
        isLoading,
        hasError: !!error,
    });
    const { mutate: unblockUser } = useUnblockUser({
        onSuccess: () => {
            console.log('✅ User unblocked successfully');
            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'User unblocked successfully',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
        onError: (error: any) => {
            console.error('❌ Failed to unblock user:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to unblock user. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    const handleUnblock = (userId: string, username: string) => {
        setAlertConfig({
            visible: true,
            title: `Unblock ${username}?`,
            message: 'You will be able to receive messages and calls from this contact.',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    style: 'destructive',
                    onPress: () => unblockUser(userId),
                },
            ],
        });
    };

    const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
        <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-slate-700 items-center justify-center mr-3">
                {item.profilePic ? (
                    <Text className="text-white text-lg font-bold">
                        {item.username.charAt(0).toUpperCase()}
                    </Text>
                ) : (
                    <Text className="text-white text-lg font-bold">
                        {item.username.charAt(0).toUpperCase()}
                    </Text>
                )}
            </View>

            {/* User Info */}
            <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                    {item.username}
                </Text>
                {item.bio && (
                    <Text className="text-slate-400 text-sm mt-0.5" numberOfLines={1}>
                        {item.bio}
                    </Text>
                )}
            </View>

            {/* Unblock Button */}
            <TouchableOpacity
                onPress={() => handleUnblock(item._id, item.username)}
                className="px-4 py-2 bg-[#6C5CE7] rounded-lg"
            >
                <Text className="text-white font-medium text-sm">
                    Unblock
                </Text>
            </TouchableOpacity>
        </View>
    );

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
                {/* Header */}
                <View className="px-4 py-3 border-b border-slate-800 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-lg ml-2">
                        Blocked Users
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6C5CE7" />
                    <Text className="text-slate-400 mt-4">Loading blocked users...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
                {/* Header */}
                <View className="px-4 py-3 border-b border-slate-800 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-lg ml-2">
                        Blocked Users
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
                        <Ionicons name="alert-circle" size={32} color="#EF4444" />
                    </View>
                    <Text className="text-white text-lg font-semibold mb-2">
                        Failed to Load
                    </Text>
                    <Text className="text-slate-400 text-center text-sm">
                        {error.message || 'Something went wrong. Please try again.'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        className="mt-4 px-6 py-3 bg-[#6C5CE7] rounded-lg"
                    >
                        <Text className="text-white font-medium">
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Empty state
    if (!data?.data || data.data.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
                {/* Header */}
                <View className="px-4 py-3 border-b border-slate-800 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-lg ml-2">
                        Blocked Users
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                        <Ionicons name="ban-outline" size={40} color="#6C5CE7" />
                    </View>
                    <Text className="text-white text-lg font-semibold mb-2">
                        No Blocked Users
                    </Text>
                    <Text className="text-slate-400 text-center text-sm">
                        You haven't blocked anyone yet
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // List view
    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-slate-800 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-lg ml-2">
                    Blocked Users
                </Text>
                <View className="flex-1" />
                <View className="bg-slate-800 px-3 py-1 rounded-full">
                    <Text className="text-slate-400 text-sm">
                        {data.data.length}
                    </Text>
                </View>
            </View>

            {/* Blocked Users List */}
            <FlatList
                data={data.data}
                keyExtractor={(item) => item._id}
                renderItem={renderBlockedUser}
                contentContainerStyle={{ paddingVertical: 8 }}
            />

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </SafeAreaView>
    );
}
