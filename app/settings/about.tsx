import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/common/CustomAlert';
import OTADebugModal from '../../components/common/OTADebugModal';

export default function AboutScreen() {
    const [showDebugModal, setShowDebugModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    const showPolicyAlert = (title: string, message: string) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons: [{ text: 'Done', style: 'default' }],
        });
    };

    const renderAboutRow = (
        iconName: keyof typeof Ionicons.glyphMap, 
        color: string, 
        label: string, 
        onPress: () => void
    ) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                className="flex-row items-center justify-between py-4 border-b border-slate-800 last:border-0 active:bg-slate-800/30 px-4"
            >
                <View className="flex-row items-center">
                    <View 
                        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${color}15` }}
                    >
                        <Ionicons name={iconName} size={18} color={color} />
                    </View>
                    <Text className="text-slate-300 text-base">
                        {label}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#475569" />
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
                    About
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 32, alignItems: 'center' }}>
                {/* Logo Box */}
                <View className="w-24 h-24 rounded-3xl bg-[#6C5CE7] items-center justify-center shadow-2xl mb-4 shadow-[#6C5CE7]/30">
                    <Ionicons name="chatbubbles" size={48} color="#fff" />
                </View>

                {/* App Details */}
                <Text className="text-white text-2xl font-bold tracking-wide">
                    ChatApp
                </Text>
                <Text className="text-slate-500 text-sm mt-1">
                    Version 1.0.14
                </Text>
                <Text className="text-slate-400 text-center px-8 text-sm mt-4 leading-6">
                    A next-generation real-time mobile messaging application built with React Native, Expo, and WebSockets.
                </Text>

                {/* Info List Section */}
                <View className="w-full px-6 mt-10">
                    <View className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
                        {renderAboutRow(
                            'refresh-circle-outline',
                            '#6C5CE7',
                            'Check Updates & Diagnostics',
                            () => setShowDebugModal(true)
                        )}
                        {renderAboutRow(
                            'document-text-outline',
                            '#3B82F6',
                            'Terms of Service',
                            () => showPolicyAlert(
                                'Terms of Service', 
                                'By using ChatApp, you agree to treat other users with respect, refrain from sending spam or malicious links, and comply with all international communication regulations. We reserve the right to suspend accounts violating safety protocols.'
                            )
                        )}
                        {renderAboutRow(
                            'shield-checkmark-outline',
                            '#10B981',
                            'Privacy Policy',
                            () => showPolicyAlert(
                                'Privacy Policy',
                                'Your privacy is our core priority. We only collect details essential for account registration (email, username). Message content and media are encrypted and kept private. We never share or sell user analytics to third parties.'
                            )
                        )}
                        {renderAboutRow(
                            'code-slash-outline',
                            '#F59E0B',
                            'Open Source Licenses',
                            () => showPolicyAlert(
                                'Licenses',
                                'Built utilizing open-source libraries: React Native, Expo Router, Axios, Socket.io-client, Zustand, TailwindCSS, Mongoose, Redis, Winston, and Express. Special thanks to the open-source community.'
                            )
                        )}
                    </View>
                </View>

                {/* Credits / Footer */}
                <View className="mt-12 items-center">
                    <Text className="text-slate-500 text-xs">
                        Developed & Styled with ❤️ by
                    </Text>
                    <Text className="text-slate-400 text-xs font-semibold mt-1">
                        Antigravity Advanced Agentic Coding
                    </Text>
                    <Text className="text-slate-600 text-[10px] mt-6">
                        © 2026 ChatApp Inc. All rights reserved.
                    </Text>
                </View>
            </ScrollView>

            {/* OTA Debug Modal */}
            <OTADebugModal
                visible={showDebugModal}
                onClose={() => setShowDebugModal(false)}
            />

            {/* Custom Dialog Alert */}
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
