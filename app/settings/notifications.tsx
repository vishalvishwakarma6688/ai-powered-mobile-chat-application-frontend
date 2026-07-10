import React from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useNotificationSettingsStore } from '../../lib/store/notificationSettingsStore';

export default function NotificationsScreen() {
    const {
        soundEnabled,
        vibrateEnabled,
        showPreviews,
        groupSoundsEnabled,
        toggleSound,
        toggleVibrate,
        togglePreviews,
        toggleGroupSounds,
    } = useNotificationSettingsStore();

    const renderToggleRow = (
        iconName: keyof typeof Ionicons.glyphMap,
        iconColor: string,
        title: string,
        description: string,
        value: boolean,
        onToggle: () => void
    ) => {
        return (
            <View className="flex-row items-center justify-between py-4 border-b border-slate-800 last:border-0 px-4">
                <View className="flex-row items-center flex-1 mr-4">
                    <View 
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${iconColor}15` }}
                    >
                        <Ionicons name={iconName} size={20} color={iconColor} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-base font-semibold">
                            {title}
                        </Text>
                        <Text className="text-slate-400 text-xs mt-1 leading-4">
                            {description}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#334155', true: '#6C5CE7' }}
                    thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                    ios_backgroundColor="#334155"
                />
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']} style={{ backgroundColor: '#0F172A' }}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-slate-800 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 active:opacity-75"
                >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-lg ml-3">
                    Notifications
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 24 }}>
                {/* Message Notifications Section */}
                <View className="px-6">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
                        Message Notifications
                    </Text>
                    <View className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
                        {renderToggleRow(
                            'volume-high-outline',
                            '#3B82F6',
                            'Play Sounds',
                            'Play alerts sounds for incoming messages.',
                            soundEnabled,
                            toggleSound
                        )}
                        {renderToggleRow(
                            'phone-portrait-outline',
                            '#10B981',
                            'Vibrate',
                            'Vibrate on incoming messages.',
                            vibrateEnabled,
                            toggleVibrate
                        )}
                        {renderToggleRow(
                            'eye-outline',
                            '#F59E0B',
                            'Show Previews',
                            'Display sender name and message preview in notifications.',
                            showPreviews,
                            togglePreviews
                        )}
                    </View>
                </View>

                {/* Group Notifications Section */}
                <View className="mt-8 px-6 mb-8">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
                        Group Notifications
                    </Text>
                    <View className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
                        {renderToggleRow(
                            'people-outline',
                            '#8B5CF6',
                            'Group Sounds',
                            'Play alert sounds specifically for group chat messages.',
                            groupSoundsEnabled,
                            toggleGroupSounds
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
