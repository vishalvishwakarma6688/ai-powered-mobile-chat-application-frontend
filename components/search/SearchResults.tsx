import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchUser } from '../../lib/api/search/searchApi';
import UserCard from './UserCard';

interface SearchResultsProps {
    users: SearchUser[];
    isLoading: boolean;
    error: Error | null;
    searchQuery: string;
    onStartChat: (userId: string) => void;
    creatingChatForUserId?: string;
}

export default function SearchResults({
    users,
    isLoading,
    error,
    searchQuery,
    onStartChat,
    creatingChatForUserId,
}: SearchResultsProps) {
    // Loading state
    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text className="text-slate-400 mt-4">Searching users...</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View className="flex-1 items-center justify-center py-20 px-6">
                <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
                    <Ionicons name="alert-circle" size={32} color="#EF4444" />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                    Search Failed
                </Text>
                <Text className="text-slate-400 text-center text-sm">
                    {error.message || 'Something went wrong. Please try again.'}
                </Text>
            </View>
        );
    }

    // Empty state (no query)
    if (!searchQuery || searchQuery.trim().length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-20 px-6">
                <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                    <Ionicons name="search" size={40} color="#6C5CE7" />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                    Search Users
                </Text>
                <Text className="text-slate-400 text-center text-sm">
                    Enter a username to find and connect with other users
                </Text>
            </View>
        );
    }

    // No results
    if (users.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-20 px-6">
                <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                    <Ionicons name="person-outline" size={40} color="#94A3B8" />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                    No Users Found
                </Text>
                <Text className="text-slate-400 text-center text-sm">
                    No users found matching "{searchQuery}".{'\n'}
                    Try a different username.
                </Text>
            </View>
        );
    }

    // Results list
    return (
        <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <UserCard
                    user={item}
                    onStartChat={onStartChat}
                    isCreatingChat={creatingChatForUserId === item._id}
                />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
        />
    );
}
