import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchUser } from '../../lib/api/search/searchApi';

interface UserCardProps {
    user: SearchUser;
    onStartChat: (userId: string) => void;
    isCreatingChat?: boolean;
}

export default function UserCard({ user, onStartChat, isCreatingChat }: UserCardProps) {
    // Get first letter of username for avatar
    const avatarLetter = user.username.charAt(0).toUpperCase();

    // Format last seen
    const formatLastSeen = (lastSeen: string) => {
        const date = new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity
            className="flex-row items-center py-4 px-6 border-b border-slate-800"
            activeOpacity={0.7}
            disabled={isCreatingChat}
        >
            {/* Avatar */}
            <View className="w-14 h-14 rounded-full bg-[#6C5CE7] items-center justify-center">
                {user.profilePic ? (
                    <Text className="text-white text-xl font-bold">{avatarLetter}</Text>
                ) : (
                    <Text className="text-white text-xl font-bold">{avatarLetter}</Text>
                )}
            </View>

            {/* User Info */}
            <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                    <Text className="text-white font-semibold text-base">
                        {user.username}
                    </Text>
                    {user.isOnline && (
                        <View className="w-2 h-2 rounded-full bg-green-500 ml-2" />
                    )}
                </View>
                {user.bio ? (
                    <Text className="text-slate-400 text-sm mt-1" numberOfLines={1}>
                        {user.bio}
                    </Text>
                ) : (
                    <Text className="text-slate-500 text-sm mt-1">
                        @{user.username}
                    </Text>
                )}
                {!user.isOnline && user.lastSeen && (
                    <Text className="text-slate-500 text-xs mt-1">
                        {formatLastSeen(user.lastSeen)}
                    </Text>
                )}
            </View>

            {/* Start Chat Button */}
            <TouchableOpacity
                onPress={() => onStartChat(user._id)}
                disabled={isCreatingChat}
                className="bg-[#6C5CE7] px-4 py-2 rounded-full flex-row items-center"
                activeOpacity={0.8}
            >
                {isCreatingChat ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="chatbubble" size={16} color="#fff" />
                        <Text className="text-white font-semibold ml-2 text-sm">Chat</Text>
                    </>
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}
