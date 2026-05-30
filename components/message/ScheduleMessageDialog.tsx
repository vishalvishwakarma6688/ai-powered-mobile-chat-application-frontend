import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ScheduleMessageDialogProps {
    visible: boolean;
    onClose: () => void;
    onSchedule: (text: string, scheduledFor: Date) => void;
    initialText?: string;
}

export default function ScheduleMessageDialog({
    visible,
    onClose,
    onSchedule,
    initialText = '',
}: ScheduleMessageDialogProps) {
    const [text, setText] = useState(initialText);
    const [scheduledDate, setScheduledDate] = useState(new Date(Date.now() + 3600000)); // Default: 1 hour from now
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleSchedule = () => {
        if (!text.trim()) {
            return;
        }

        // Validate that scheduled time is in the future
        if (scheduledDate <= new Date()) {
            alert('Please select a future date and time');
            return;
        }

        onSchedule(text.trim(), scheduledDate);
        setText('');
        setScheduledDate(new Date(Date.now() + 3600000));
        onClose();
    };

    const handleClose = () => {
        setText('');
        setScheduledDate(new Date(Date.now() + 3600000));
        onClose();
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        if (isToday) {
            return 'Today';
        } else if (isTomorrow) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const getRelativeTime = () => {
        const now = new Date();
        const diff = scheduledDate.getTime() - now.getTime();

        if (diff < 0) {
            return 'Past time';
        }

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `in ${days} day${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `in ${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return 'in less than a minute';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-[#1E293B] rounded-t-3xl max-h-[80%]">
                    {/* Header */}
                    <View className="px-4 py-4 border-b border-slate-700 flex-row items-center justify-between">
                        <Text className="text-white text-lg font-semibold">Schedule Message</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-4 py-4">
                        {/* Message Input */}
                        <View className="mb-4">
                            <Text className="text-slate-400 text-sm mb-2">Message</Text>
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder="Type your message..."
                                placeholderTextColor="#64748B"
                                className="bg-slate-800 text-white text-base p-3 rounded-lg"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={5000}
                            />
                            <Text className="text-slate-500 text-xs mt-1 text-right">
                                {text.length}/5000
                            </Text>
                        </View>

                        {/* Date & Time Selection */}
                        <View className="mb-4">
                            <Text className="text-slate-400 text-sm mb-2">Schedule For</Text>

                            {/* Date Picker Button */}
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="bg-slate-800 p-4 rounded-lg mb-3 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="calendar-outline" size={20} color="#6C5CE7" />
                                    <Text className="text-white text-base ml-3">{formatDate(scheduledDate)}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#64748B" />
                            </TouchableOpacity>

                            {/* Time Picker Button */}
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(true)}
                                className="bg-slate-800 p-4 rounded-lg flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={20} color="#6C5CE7" />
                                    <Text className="text-white text-base ml-3">{formatTime(scheduledDate)}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#64748B" />
                            </TouchableOpacity>

                            {/* Preview */}
                            <View className="mt-3 bg-[#6C5CE7]/10 p-3 rounded-lg border border-[#6C5CE7]/30">
                                <Text className="text-[#6C5CE7] text-sm">
                                    📅 Message will be sent {getRelativeTime()}
                                </Text>
                                <Text className="text-slate-400 text-xs mt-1">
                                    {scheduledDate.toLocaleString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </Text>
                            </View>
                        </View>

                        {/* Quick Schedule Options */}
                        <View className="mb-4">
                            <Text className="text-slate-400 text-sm mb-2">Quick Schedule</Text>
                            <View className="flex-row flex-wrap gap-2">
                                <TouchableOpacity
                                    onPress={() => {
                                        const date = new Date();
                                        date.setHours(date.getHours() + 1);
                                        setScheduledDate(date);
                                    }}
                                    className="bg-slate-800 px-4 py-2 rounded-full"
                                >
                                    <Text className="text-white text-sm">1 hour</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const date = new Date();
                                        date.setHours(date.getHours() + 3);
                                        setScheduledDate(date);
                                    }}
                                    className="bg-slate-800 px-4 py-2 rounded-full"
                                >
                                    <Text className="text-white text-sm">3 hours</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const date = new Date();
                                        date.setDate(date.getDate() + 1);
                                        date.setHours(9, 0, 0, 0);
                                        setScheduledDate(date);
                                    }}
                                    className="bg-slate-800 px-4 py-2 rounded-full"
                                >
                                    <Text className="text-white text-sm">Tomorrow 9 AM</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View className="px-4 py-4 border-t border-slate-700 flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleClose}
                            className="flex-1 bg-slate-700 py-3 rounded-lg items-center"
                        >
                            <Text className="text-white font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSchedule}
                            disabled={!text.trim()}
                            className={`flex-1 py-3 rounded-lg items-center ${text.trim() ? 'bg-[#6C5CE7]' : 'bg-slate-700'
                                }`}
                        >
                            <Text className={`font-semibold ${text.trim() ? 'text-white' : 'text-slate-500'}`}>
                                Schedule
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Picker */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={scheduledDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) {
                                    const newDate = new Date(scheduledDate);
                                    newDate.setFullYear(selectedDate.getFullYear());
                                    newDate.setMonth(selectedDate.getMonth());
                                    newDate.setDate(selectedDate.getDate());
                                    setScheduledDate(newDate);
                                }
                            }}
                        />
                    )}

                    {/* Time Picker */}
                    {showTimePicker && (
                        <DateTimePicker
                            value={scheduledDate}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedTime) => {
                                setShowTimePicker(Platform.OS === 'ios');
                                if (selectedTime) {
                                    const newDate = new Date(scheduledDate);
                                    newDate.setHours(selectedTime.getHours());
                                    newDate.setMinutes(selectedTime.getMinutes());
                                    setScheduledDate(newDate);
                                }
                            }}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
