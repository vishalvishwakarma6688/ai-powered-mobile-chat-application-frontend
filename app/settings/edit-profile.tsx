import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '../../lib/store/authStore';
import { BASE_URL } from '../../lib/api/client';
import { useUpdateProfile, useUploadProfilePicture } from '../../lib/hooks/user/useUpdateProfile';
import CustomAlert from '../../components/common/CustomAlert';

export default function EditProfileScreen() {
    const { user } = useAuthStore();
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [localImageUri, setLocalImageUri] = useState<string | null>(null);
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

    const { mutateAsync: updateProfile } = useUpdateProfile();
    const { mutateAsync: uploadProfilePicture } = useUploadProfilePicture();

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setBio(user.bio || '');
        }
    }, [user]);

    const getFullImageUrl = (iconPath: string | null | undefined): string | null => {
        if (!iconPath) return null;
        if (iconPath.startsWith('http')) return iconPath;
        if (iconPath.startsWith('file://')) return iconPath;
        return `${BASE_URL}${iconPath}`;
    };

    // Camera launcher
    const handleCameraLaunch = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Denied',
                    message: 'Camera permission is required to take photos.',
                    buttons: [{ text: 'OK', style: 'default' }],
                });
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setLocalImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Camera launch error:', error);
        }
    };

    // Library launcher
    const handleLibraryLaunch = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Denied',
                    message: 'Photo library permission is required to choose photos.',
                    buttons: [{ text: 'OK', style: 'default' }],
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setLocalImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Photo library launch error:', error);
        }
    };

    const triggerPhotoMenu = () => {
        setAlertConfig({
            visible: true,
            title: 'Change Profile Photo',
            message: 'Choose where you want to select your photo from:',
            buttons: [
                {
                    text: 'Take Photo',
                    onPress: handleCameraLaunch,
                },
                {
                    text: 'Choose from Gallery',
                    onPress: handleLibraryLaunch,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
        });
    };

    const handleSave = async () => {
        // Validation checks
        const trimmedUsername = username.trim();
        if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
            setAlertConfig({
                visible: true,
                title: 'Invalid Username',
                message: 'Username must be between 3 and 30 characters.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
            setAlertConfig({
                visible: true,
                title: 'Invalid Username',
                message: 'Username can only contain letters, numbers, and underscores.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
            return;
        }

        if (bio.length > 150) {
            setAlertConfig({
                visible: true,
                title: 'Bio Too Long',
                message: 'Bio must not exceed 150 characters.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
            return;
        }

        setIsSaving(true);

        try {
            // Step 1: Upload profile picture if updated locally
            if (localImageUri) {
                console.log('📤 Uploading new profile picture...');
                await uploadProfilePicture(localImageUri);
                console.log('✅ Profile picture uploaded.');
            }

            // Step 2: Save text updates (username, bio) if changed
            const usernameChanged = trimmedUsername !== user?.username;
            const bioChanged = bio.trim() !== (user?.bio || '').trim();

            if (usernameChanged || bioChanged) {
                console.log('📤 Updating text profile details...');
                await updateProfile({
                    username: trimmedUsername,
                    bio: bio.trim(),
                });
                console.log('✅ Text profile details updated.');
            }

            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'Your profile has been updated successfully.',
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
            console.error('❌ Failed to save profile:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: error.message || 'Failed to save changes. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        } finally {
            setIsSaving(false);
        }
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
                        Edit Profile
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

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingVertical: 24 }}>
                {/* Profile Pic Section */}
                <View className="items-center mb-8">
                    <TouchableOpacity 
                        onPress={triggerPhotoMenu} 
                        disabled={isSaving}
                        className="relative active:opacity-90"
                    >
                        <View className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#6C5CE7] bg-slate-800 items-center justify-center">
                            {localImageUri ? (
                                <Image source={{ uri: localImageUri }} className="w-full h-full" />
                            ) : user?.profilePic ? (
                                <Image source={{ uri: getFullImageUrl(user.profilePic) || undefined }} className="w-full h-full" />
                            ) : (
                                <Text className="text-white text-3xl font-bold">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#6C5CE7] border-2 border-[#0F172A] items-center justify-center">
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-slate-400 text-xs mt-3">
                        Tap avatar to change profile photo
                    </Text>
                </View>

                {/* Form Fields */}
                <View style={{ gap: 20 }}>
                    {/* Username Input */}
                    <View>
                        <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Username
                        </Text>
                        <View className="bg-[#1E293B] border border-slate-700/60 rounded-xl flex-row items-center px-4 py-3">
                            <Ionicons name="at" size={20} color="#94A3B8" />
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Choose a username..."
                                placeholderTextColor="#475569"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isSaving}
                                className="flex-1 text-white ml-2 text-base"
                            />
                        </View>
                    </View>

                    {/* Bio Input */}
                    <View>
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                Bio
                            </Text>
                            <Text className="text-slate-500 text-xs font-medium">
                                {bio.length}/150
                            </Text>
                        </View>
                        <View className="bg-[#1E293B] border border-slate-700/60 rounded-xl flex-row items-start px-4 py-3">
                            <Ionicons name="document-text-outline" size={20} color="#94A3B8" style={{ marginTop: 2 }} />
                            <TextInput
                                value={bio}
                                onChangeText={(text) => {
                                    if (text.length <= 150) setBio(text);
                                }}
                                placeholder="Tell us about yourself..."
                                placeholderTextColor="#475569"
                                multiline
                                numberOfLines={3}
                                editable={!isSaving}
                                className="flex-1 text-white ml-2 text-base leading-5"
                                style={{ 
                                    minHeight: 60,
                                    textAlignVertical: 'top',
                                    paddingTop: 0,
                                    paddingBottom: 0
                                }}
                            />
                        </View>
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
