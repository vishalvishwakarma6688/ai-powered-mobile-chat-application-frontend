import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface AutoDeleteDialogProps {
    visible: boolean;
    onClose: () => void;
    onSetAutoDelete: (duration: number) => void;
    currentAutoDeleteAt?: string;
}

interface TimerOption {
    label: string;
    duration: number; // in seconds
    icon: keyof typeof Ionicons.glyphMap;
}

export default function AutoDeleteDialog({
    visible,
    onClose,
    onSetAutoDelete,
    currentAutoDeleteAt,
}: AutoDeleteDialogProps) {
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customDays, setCustomDays] = useState('');
    const [customHours, setCustomHours] = useState('');
    const [customMinutes, setCustomMinutes] = useState('');

    // Timer options
    const timerOptions: TimerOption[] = [
        { label: '1 Hour', duration: 3600, icon: 'time-outline' },
        { label: '24 Hours', duration: 86400, icon: 'time-outline' },
        { label: '7 Days', duration: 604800, icon: 'calendar-outline' },
        { label: '30 Days', duration: 2592000, icon: 'calendar-outline' },
        { label: '90 Days', duration: 7776000, icon: 'calendar-outline' },
    ];

    const handleSetAutoDelete = () => {
        if (selectedDuration !== null) {
            onSetAutoDelete(selectedDuration);
            setSelectedDuration(null);
            setShowCustomInput(false);
            setCustomDays('');
            setCustomHours('');
            setCustomMinutes('');
            onClose();
        }
    };

    const handleCancel = () => {
        setSelectedDuration(null);
        setShowCustomInput(false);
        setCustomDays('');
        setCustomHours('');
        setCustomMinutes('');
        onClose();
    };

    const handleCustomTimeSelect = () => {
        setShowCustomInput(true);
        setSelectedDuration(null);
    };

    const calculateCustomDuration = () => {
        const days = parseInt(customDays) || 0;
        const hours = parseInt(customHours) || 0;
        const minutes = parseInt(customMinutes) || 0;

        const totalSeconds = (days * 86400) + (hours * 3600) + (minutes * 60);

        if (totalSeconds > 0) {
            setSelectedDuration(totalSeconds);
        }
    };

    // Format remaining time
    const formatRemainingTime = (autoDeleteAt: string) => {
        const now = new Date().getTime();
        const deleteTime = new Date(autoDeleteAt).getTime();
        const diffMs = deleteTime - now;

        if (diffMs <= 0) return 'Expired';

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays > 0) return `${diffDays}d`;
        if (diffHours > 0) return `${diffHours}h`;
        if (diffMins > 0) return `${diffMins}m`;
        return 'Less than 1m';
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleCancel}
                className="flex-1 bg-black/50 justify-center items-center px-4"
            >
                <TouchableOpacity
                    activeOpacity={1}
                    className="bg-[#1E293B] rounded-2xl w-full max-w-sm overflow-hidden"
                    style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                >
                    {/* Header */}
                    <View className="px-6 py-4 border-b border-slate-700">
                        <Text className="text-white text-lg font-semibold">
                            Auto-Delete Message
                        </Text>
                        <Text className="text-slate-400 text-sm mt-1">
                            Message will be automatically deleted after the selected time
                        </Text>
                    </View>

                    {/* Current Timer Info */}
                    {currentAutoDeleteAt && (
                        <View className="px-6 py-3 bg-[#6C5CE7]/10 border-b border-slate-700">
                            <View className="flex-row items-center">
                                <Ionicons name="timer-outline" size={16} color="#6C5CE7" />
                                <Text className="text-[#6C5CE7] text-sm ml-2">
                                    Current timer: {formatRemainingTime(currentAutoDeleteAt)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Timer Options */}
                    <ScrollView className="max-h-96">
                        <View className="py-2">
                            {timerOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setSelectedDuration(option.duration);
                                        setShowCustomInput(false);
                                    }}
                                    className={`flex-row items-center px-6 py-4 ${selectedDuration === option.duration && !showCustomInput ? 'bg-[#6C5CE7]/10' : ''
                                        }`}
                                >
                                    <View
                                        className={`w-10 h-10 rounded-full items-center justify-center ${selectedDuration === option.duration && !showCustomInput
                                            ? 'bg-[#6C5CE7]'
                                            : 'bg-slate-700'
                                            }`}
                                    >
                                        <Ionicons
                                            name={option.icon}
                                            size={20}
                                            color={selectedDuration === option.duration && !showCustomInput ? '#fff' : '#94A3B8'}
                                        />
                                    </View>
                                    <Text
                                        className={`ml-4 text-base flex-1 ${selectedDuration === option.duration && !showCustomInput
                                            ? 'text-[#6C5CE7] font-semibold'
                                            : 'text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                    {selectedDuration === option.duration && !showCustomInput && (
                                        <Ionicons name="checkmark-circle" size={24} color="#6C5CE7" />
                                    )}
                                </TouchableOpacity>
                            ))}

                            {/* Custom Time Option */}
                            <TouchableOpacity
                                onPress={handleCustomTimeSelect}
                                className={`flex-row items-center px-6 py-4 ${showCustomInput ? 'bg-[#6C5CE7]/10' : ''
                                    }`}
                            >
                                <View
                                    className={`w-10 h-10 rounded-full items-center justify-center ${showCustomInput
                                        ? 'bg-[#6C5CE7]'
                                        : 'bg-slate-700'
                                        }`}
                                >
                                    <Ionicons
                                        name="create-outline"
                                        size={20}
                                        color={showCustomInput ? '#fff' : '#94A3B8'}
                                    />
                                </View>
                                <Text
                                    className={`ml-4 text-base flex-1 ${showCustomInput
                                        ? 'text-[#6C5CE7] font-semibold'
                                        : 'text-white'
                                        }`}
                                >
                                    Custom Time
                                </Text>
                                {showCustomInput && (
                                    <Ionicons name="checkmark-circle" size={24} color="#6C5CE7" />
                                )}
                            </TouchableOpacity>

                            {/* Custom Time Input */}
                            {showCustomInput && (
                                <View className="px-6 py-4 bg-slate-800/50">
                                    <Text className="text-slate-400 text-sm mb-3">
                                        Enter custom duration:
                                    </Text>
                                    <View className="flex-row space-x-3">
                                        {/* Days */}
                                        <View className="flex-1">
                                            <Text className="text-slate-400 text-xs mb-1">Days</Text>
                                            <TextInput
                                                value={customDays}
                                                onChangeText={(text) => {
                                                    setCustomDays(text);
                                                    setTimeout(calculateCustomDuration, 100);
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="0"
                                                placeholderTextColor="#64748B"
                                                className="bg-slate-700 text-white px-3 py-2 rounded-lg text-center"
                                                maxLength={3}
                                            />
                                        </View>

                                        {/* Hours */}
                                        <View className="flex-1">
                                            <Text className="text-slate-400 text-xs mb-1">Hours</Text>
                                            <TextInput
                                                value={customHours}
                                                onChangeText={(text) => {
                                                    setCustomHours(text);
                                                    setTimeout(calculateCustomDuration, 100);
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="0"
                                                placeholderTextColor="#64748B"
                                                className="bg-slate-700 text-white px-3 py-2 rounded-lg text-center"
                                                maxLength={2}
                                            />
                                        </View>

                                        {/* Minutes */}
                                        <View className="flex-1">
                                            <Text className="text-slate-400 text-xs mb-1">Minutes</Text>
                                            <TextInput
                                                value={customMinutes}
                                                onChangeText={(text) => {
                                                    setCustomMinutes(text);
                                                    setTimeout(calculateCustomDuration, 100);
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="0"
                                                placeholderTextColor="#64748B"
                                                className="bg-slate-700 text-white px-3 py-2 rounded-lg text-center"
                                                maxLength={2}
                                            />
                                        </View>
                                    </View>
                                    {selectedDuration && selectedDuration > 0 && (
                                        <Text className="text-[#6C5CE7] text-xs mt-2 text-center">
                                            Total: {Math.floor(selectedDuration / 86400)}d {Math.floor((selectedDuration % 86400) / 3600)}h {Math.floor((selectedDuration % 3600) / 60)}m
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View className="flex-row border-t border-slate-700">
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="flex-1 py-4 items-center justify-center border-r border-slate-700"
                        >
                            <Text className="text-slate-400 text-base font-medium">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSetAutoDelete}
                            disabled={selectedDuration === null || selectedDuration === 0}
                            className={`flex-1 py-4 items-center justify-center ${selectedDuration === null || selectedDuration === 0 ? 'opacity-50' : ''
                                }`}
                        >
                            <Text className="text-[#6C5CE7] text-base font-semibold">
                                Set Timer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
