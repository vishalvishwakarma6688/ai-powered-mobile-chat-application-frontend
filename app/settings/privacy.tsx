import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../lib/store/authStore';
import { useUpdatePrivacy } from '../../lib/hooks/user/useUpdateProfile';
import CustomAlert from '../../components/common/CustomAlert';

type PrivacyOption = 'everyone' | 'contacts' | 'nobody';

export default function PrivacyScreen() {
    const { user } = useAuthStore();
    const [lastSeen, setLastSeen] = useState<PrivacyOption>('everyone');
    const [profilePhoto, setProfilePhoto] = useState<PrivacyOption>('everyone');
    const [isSaving, setIsSaving] = useState(false);

    // Alert Config
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    const { mutateAsync: updatePrivacy } = useUpdatePrivacy();

    useEffect(() => {
        if (user?.privacy) {
            setLastSeen(user.privacy.lastSeen || 'everyone');
            setProfilePhoto(user.privacy.profilePhoto || 'everyone');
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log('📤 Updating privacy settings:', { lastSeen, profilePhoto });
            await updatePrivacy({
                lastSeen,
                profilePhoto,
            });
            console.log('✅ Privacy settings updated.');

            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'Your privacy settings have been updated.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.back();
                        },
                    },
                ],
            });
        } catch (error: any) {
            console.error('❌ Failed to save privacy settings:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: error.message || 'Failed to update privacy settings. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        } finally {
            setIsSaving(false);
        }
    };

    const renderOptionRow = (
        label: string, 
        value: PrivacyOption, 
        currentValue: PrivacyOption, 
        onSelect: (val: PrivacyOption) => void
    ) => {
        const isSelected = value === currentValue;
        return (
            <TouchableOpacity
                onPress={() => onSelect(value)}
                disabled={isSaving}
                className="flex-row items-center justify-between py-4 border-b border-slate-800 last:border-0 active:bg-slate-800/30 px-4"
            >
                <Text className={`text-base ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {label}
                </Text>
                {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#6C5CE7" />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']} style={{ backgroundColor: '#0F172A' }}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-slate-800 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 active:opacity-75"
                        disabled={isSaving}
                    >
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-lg ml-3">
                        Privacy
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-xl flex-row items-center ${isSaving ? 'bg-slate-800' : 'bg-[#6C5CE7] active:opacity-90'}`}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 4 }} />
                            <Text className="text-white font-bold text-sm">Save</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Description info */}
                <View className="px-6 py-6 border-b border-slate-800/60 bg-slate-900/10">
                    <Text className="text-slate-400 text-sm leading-5">
                        Manage your visibility settings. If you restrict who can see your Last Seen, you won't be able to see other users' Last Seen times.
                    </Text>
                </View>

                {/* Last Seen Section */}
                <View className="mt-6 px-6">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
                        Who Can See My Last Seen
                    </Text>
                    <View className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
                        {renderOptionRow('Everyone', 'everyone', lastSeen, setLastSeen)}
                        {renderOptionRow('My Contacts', 'contacts', lastSeen, setLastSeen)}
                        {renderOptionRow('Nobody', 'nobody', lastSeen, setLastSeen)}
                    </View>
                </View>

                {/* Profile Photo Section */}
                <View className="mt-8 px-6 mb-8">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
                        Who Can See My Profile Photo
                    </Text>
                    <View className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
                        {renderOptionRow('Everyone', 'everyone', profilePhoto, setProfilePhoto)}
                        {renderOptionRow('My Contacts', 'contacts', profilePhoto, setProfilePhoto)}
                        {renderOptionRow('Nobody', 'nobody', profilePhoto, setProfilePhoto)}
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
