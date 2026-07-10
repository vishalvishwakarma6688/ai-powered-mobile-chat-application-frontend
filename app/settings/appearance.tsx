import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppSettingsStore, AppTheme } from '../../lib/store/appSettingsStore';

export default function AppearanceScreen() {
    const { theme, setTheme } = useAppSettingsStore();

    const renderThemeRow = (label: string, value: AppTheme, iconName: keyof typeof Ionicons.glyphMap, color: string) => {
        const isSelected = value === theme;
        return (
            <TouchableOpacity
                onPress={() => setTheme(value)}
                className="flex-row items-center justify-between py-4 border-b border-slate-800 last:border-0 active:bg-slate-800/30 px-4"
            >
                <View className="flex-row items-center">
                    <View 
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${color}15` }}
                    >
                        <Ionicons name={iconName} size={20} color={color} />
                    </View>
                    <Text className={`text-base ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}`}>
                        {label}
                    </Text>
                </View>
                {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#6C5CE7" />
                )}
            </TouchableOpacity>
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
                    Appearance
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 24 }}>
                {/* Description info */}
                <View className="px-6 py-6 border-b border-slate-800/60 bg-slate-900/10 mb-6">
                    <Text className="text-slate-400 text-sm leading-5">
                        Customize how ChatApp looks on your device. Choose a theme configuration to match your personal preference or device configuration.
                    </Text>
                </View>

                {/* Theme Selector Section */}
                <View className="px-6">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
                        Theme Selection
                    </Text>
                    <View className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
                        {renderThemeRow('Dark Theme', 'dark', 'moon-outline', '#8B5CF6')}
                        {renderThemeRow('Light Theme', 'light', 'sunny-outline', '#F59E0B')}
                        {renderThemeRow('System Default', 'system', 'cog-outline', '#10B981')}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
