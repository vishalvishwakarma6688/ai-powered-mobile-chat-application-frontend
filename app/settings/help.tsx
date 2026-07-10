import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/common/CustomAlert';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface FAQItem {
    question: string;
    answer: string;
}

export default function HelpScreen() {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    const faqs: FAQItem[] = [
        {
            question: 'How do I create a group chat?',
            answer: "Navigate to the main Chats tab, click on the options menu (three vertical dots) in the top right, select 'New Group', select participants, choose a group name/avatar, and tap create.",
        },
        {
            question: 'Are my chats secure and encrypted?',
            answer: 'Yes! ChatApp enforces robust industry-standard database encryption and secure WebSockets for all message signaling, keeping your chats and media safe from unauthorized access.',
        },
        {
            question: 'How do I manage blocked users?',
            answer: "Go to Settings tab, tap 'Privacy', or click on the Chats tab options menu and select 'Blocked Users'. Here you can view currently blocked profiles and unblock them easily.",
        },
        {
            question: 'How do I configure disappearing messages?',
            answer: 'Inside any individual or group chat room, tap the chat header/group name, select the disappearing messages option, and configure your preferred auto-delete timer.',
        },
        {
            question: 'Why am I getting connection errors?',
            answer: 'Make sure your mobile client is connected to the same local Wi-Fi network as the backend server. Verify that your machine IP matches the SERVER_IP configuration in api.config.ts.',
        }
    ];

    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const handleContactSupport = () => {
        setAlertConfig({
            visible: true,
            title: 'Contact Support',
            message: 'You can reach our dedicated support desk anytime at:\n\n📧 support@chatapp.com\n\nWe typically respond within 24 hours.',
            buttons: [{ text: 'OK', style: 'default' }],
        });
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
                    Help & Support
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 24 }}>
                {/* Support Card */}
                <View className="px-6 mb-8">
                    <View className="bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] p-6 rounded-2xl shadow-xl bg-[#6C5CE7]">
                        <Ionicons name="help-buoy" size={32} color="#fff" style={{ marginBottom: 12 }} />
                        <Text className="text-white text-xl font-bold mb-2">
                            Need Quick Help?
                        </Text>
                        <Text className="text-white/80 text-sm mb-4 leading-5">
                            Our support staff is ready to help you with any issue, query, or technical bug you encounter.
                        </Text>
                        <TouchableOpacity
                            onPress={handleContactSupport}
                            className="bg-white/20 active:bg-white/30 px-5 py-3 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-sm">Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQ Accordion Section */}
                <View className="px-6 mb-8">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 ml-1">
                        Frequently Asked Questions
                    </Text>

                    <View style={{ gap: 12 }}>
                        {faqs.map((faq, index) => {
                            const isExpanded = expandedIndex === index;
                            return (
                                <View 
                                    key={index}
                                    className="bg-[#1E293B] border border-slate-800 rounded-xl overflow-hidden"
                                >
                                    <TouchableOpacity
                                        onPress={() => toggleExpand(index)}
                                        className="flex-row items-center justify-between p-4 active:bg-slate-800/30"
                                    >
                                        <Text className="text-white font-semibold text-sm flex-1 mr-4">
                                            {faq.question}
                                        </Text>
                                        <Ionicons 
                                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                                            size={18} 
                                            color="#94A3B8" 
                                        />
                                    </TouchableOpacity>
                                    
                                    {isExpanded && (
                                        <View className="px-4 pb-4 pt-1 border-t border-slate-800/40">
                                            <Text className="text-slate-300 text-sm leading-6">
                                                {faq.answer}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

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
