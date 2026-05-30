import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../lib/store/authStore';
import CustomAlert from '../../components/common/CustomAlert';

export default function SettingsScreen() {
    const { user, clearAuth } = useAuthStore();
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    const handleLogout = () => {
        setAlertConfig({
            visible: true,
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            buttons: [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearAuth();
                            router.replace('/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            // Navigate anyway
                            router.replace('/login');
                        }
                    },
                },
            ],
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 border-b border-slate-800">
                    <Text className="text-white text-2xl font-bold">Settings</Text>
                </View>

                {/* User Info Section */}
                <View className="px-6 py-6 border-b border-slate-800">
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 rounded-full bg-[#6C5CE7] items-center justify-center">
                            <Text className="text-white text-2xl font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-white text-lg font-semibold">
                                {user?.username || 'User'}
                            </Text>
                            <Text className="text-slate-400 text-sm">
                                {user?.email || 'email@example.com'}
                            </Text>
                        </View>
                        <TouchableOpacity className="p-2">
                            <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Options */}
                <View className="px-6 py-4">
                    {/* Account Section */}
                    <Text className="text-slate-400 text-xs font-semibold uppercase mb-3">
                        Account
                    </Text>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-slate-800"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Coming Soon',
                            message: 'Profile editing will be available soon!',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="person-outline" size={24} color="#94A3B8" />
                        <Text className="text-white text-base ml-4 flex-1">Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-slate-800"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Coming Soon',
                            message: 'Privacy settings will be available soon!',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="lock-closed-outline" size={24} color="#94A3B8" />
                        <Text className="text-white text-base ml-4 flex-1">Privacy</Text>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-slate-800"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Coming Soon',
                            message: 'Notifications settings will be available soon!',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#94A3B8" />
                        <Text className="text-white text-base ml-4 flex-1">Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    {/* App Section */}
                    <Text className="text-slate-400 text-xs font-semibold uppercase mb-3 mt-6">
                        App
                    </Text>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-slate-800"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Coming Soon',
                            message: 'Theme settings will be available soon!',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="color-palette-outline" size={24} color="#94A3B8" />
                        <Text className="text-white text-base ml-4 flex-1">Appearance</Text>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-slate-800"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Coming Soon',
                            message: 'Language settings will be available soon!',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="language-outline" size={24} color="#94A3B8" />
                        <Text className="text-white text-base ml-4 flex-1">Language</Text>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    {/* About Section */}
                    <Text className="text-slate-400 text-xs font-semibold uppercase mb-3 mt-6">
                        About
                    </Text>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-slate-800"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Help & Support',
                            message: 'Contact us at support@chatapp.com',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="help-circle-outline" size={24} color="#94A3B8" />
                        <Text className="text-white text-base ml-4 flex-1">Help & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-slate-800"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'About',
                            message: 'ChatApp v1.0.0\nNext-gen chat experience',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="information-circle-outline" size={24} color="#94A3B8" />
                        <Text className="text-white text-base ml-4 flex-1">About</Text>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <TouchableOpacity
                        className="flex-row items-center py-4 mt-6 bg-red-500/10 rounded-2xl px-4"
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                        <Text className="text-red-500 text-base ml-4 flex-1 font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Version Info */}
                <View className="items-center py-6">
                    <Text className="text-slate-500 text-xs">Version 1.0.0</Text>
                    <Text className="text-slate-600 text-xs mt-1">© 2026 ChatApp</Text>
                </View>
            </ScrollView>

            {/* Custom Alert */}
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
