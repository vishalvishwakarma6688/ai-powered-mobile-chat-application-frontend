import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../lib/api/message/messageApi';

interface PinnedMessageBannerProps {
    pinnedMessages: Message[];
    onPressPinned: (messageId: string) => void;
    onClose: () => void;
}

export default function PinnedMessageBanner({
    pinnedMessages,
    onPressPinned,
    onClose,
}: PinnedMessageBannerProps) {
    if (!pinnedMessages || pinnedMessages.length === 0) {
        return null;
    }

    // Show the most recent pinned message
    const latestPinned = pinnedMessages[0];
    const hasMultiple = pinnedMessages.length > 1;

    return (
        <TouchableOpacity
            onPress={() => onPressPinned(latestPinned._id)}
            activeOpacity={0.7}
            className="bg-[#1E293B] border-b border-slate-700"
        >
            <View className="flex-row items-center px-4 py-3">
                {/* Pin Icon */}
                <View className="mr-3">
                    <Ionicons name="pin" size={20} color="#6C5CE7" />
                </View>

                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="pin" size={12} color="#94A3B8" />
                        <Text className="text-slate-400 text-xs ml-1 font-medium">
                            Pinned Message
                            {hasMultiple && ` (${pinnedMessages.length})`}
                        </Text>
                    </View>
                    <Text className="text-white text-sm" numberOfLines={1}>
                        {latestPinned.text || 'Media message'}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-0.5">
                        {latestPinned.sender.username}
                    </Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="ml-2 p-1"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={20} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
