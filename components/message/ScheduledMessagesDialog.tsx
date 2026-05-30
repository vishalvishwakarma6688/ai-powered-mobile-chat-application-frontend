import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScheduledMessages, useCancelScheduledMessage } from '../../lib/hooks/message/useScheduleMessage';
import { ScheduledMessage } from '../../lib/api/message/scheduleApi';

interface ScheduledMessagesDialogProps {
    visible: boolean;
    onClose: () => void;
    chatId: string;
}

export default function ScheduledMessagesDialog({
    visible,
    onClose,
    chatId,
}: ScheduledMessagesDialogProps) {
    const { data, isLoading, error } = useScheduledMessages(chatId, visible);
    const cancelMutation = useCancelScheduledMessage();

    const handleCancel = (messageId: string) => {
        cancelMutation.mutate(messageId);
    };

    const formatScheduledTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = date.getTime() - now.getTime();

        // Format date
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        let dateStr = '';
        if (isToday) {
            dateStr = 'Today';
        } else if (isTomorrow) {
            dateStr = 'Tomorrow';
        } else {
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        // Format time
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

        // Relative time
        let relativeStr = '';
        if (diff > 0) {
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) {
                relativeStr = `in ${days}d`;
            } else if (hours > 0) {
                relativeStr = `in ${hours}h`;
            } else if (minutes > 0) {
                relativeStr = `in ${minutes}m`;
            } else {
                relativeStr = 'soon';
            }
        }

        return { dateStr, timeStr, relativeStr };
    };

    const renderScheduledMessage = (message: ScheduledMessage) => {
        const { dateStr, timeStr, relativeStr } = formatScheduledTime(message.scheduledFor);

        return (
            <View
                key={message._id}
                className="bg-slate-800 p-4 rounded-lg mb-3 border border-slate-700"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={16} color="#6C5CE7" />
                        <Text className="text-[#6C5CE7] text-sm font-medium ml-2">
                            {dateStr} at {timeStr}
                        </Text>
                    </View>
                    {relativeStr && (
                        <View className="bg-[#6C5CE7]/20 px-2 py-1 rounded">
                            <Text className="text-[#6C5CE7] text-xs">{relativeStr}</Text>
                        </View>
                    )}
                </View>

                {/* Message Text */}
                <Text className="text-white text-base mb-3" numberOfLines={3}>
                    {message.text}
                </Text>

                {/* Actions */}
                <View className="flex-row items-center justify-between pt-3 border-t border-slate-700">
                    <Text className="text-slate-400 text-xs">
                        Created {new Date(message.createdAt).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity
                        onPress={() => handleCancel(message._id)}
                        disabled={cancelMutation.isPending}
                        className="flex-row items-center bg-red-500/20 px-3 py-1.5 rounded"
                    >
                        <Ionicons name="trash-outline" size={14} color="#EF4444" />
                        <Text className="text-red-500 text-sm font-medium ml-1">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-[#1E293B] rounded-t-3xl max-h-[80%]">
                    {/* Header */}
                    <View className="px-4 py-4 border-b border-slate-700 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={24} color="#6C5CE7" />
                            <Text className="text-white text-lg font-semibold ml-2">Scheduled Messages</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView className="px-4 py-4">
                        {isLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="large" color="#6C5CE7" />
                                <Text className="text-slate-400 mt-4">Loading...</Text>
                            </View>
                        ) : error ? (
                            <View className="py-8 items-center">
                                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                                <Text className="text-white text-lg font-semibold mt-4">
                                    Failed to Load
                                </Text>
                                <Text className="text-slate-400 text-center mt-2">
                                    {(error as Error).message || 'Something went wrong'}
                                </Text>
                            </View>
                        ) : data?.data.length === 0 ? (
                            <View className="py-8 items-center">
                                <Ionicons name="calendar-outline" size={64} color="#64748B" />
                                <Text className="text-white text-lg font-semibold mt-4">
                                    No Scheduled Messages
                                </Text>
                                <Text className="text-slate-400 text-center mt-2">
                                    Schedule messages to send them later
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text className="text-slate-400 text-sm mb-3">
                                    {data?.data.length} scheduled message{data?.data.length !== 1 ? 's' : ''}
                                </Text>
                                {data?.data.map(renderScheduledMessage)}
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
