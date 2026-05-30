import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { useRegister } from '../lib/hooks/auth';
import { useAuthStore } from '../lib/store/authStore';
import { validateSignupForm } from '../lib/utils/validation';
import CustomAlert from '../components/common/CustomAlert';

export default function Signup() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
        phone?: string;
        password?: string;
    }>({});
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    const setAuth = useAuthStore((state: any) => state.setAuth);

    const { mutate: register, isPending } = useRegister({
        onSuccess: async (data) => {
            console.log('✅ Registration successful:', data.data.user.username);

            try {
                // Save authentication data to store and storage
                await setAuth(data.data.user, data.data.token);
                console.log('✅ Auth data saved');

                // Navigate immediately (don't wait for alert)
                router.replace('/(tabs)');

                // Show success message after navigation
                setTimeout(() => {
                    setAlertConfig({
                        visible: true,
                        title: '🎉 Welcome!',
                        message: `Account created successfully! Welcome, ${data.data.user.username}!`,
                        buttons: [{ text: 'OK', style: 'default' }],
                    });
                }, 500);
            } catch (error) {
                console.error('❌ Failed to save auth data:', error);
                // Still navigate even if storage fails
                router.replace('/(tabs)');
            }
        },
        onError: (error: any) => {
            console.error('❌ Registration failed:', error);

            // Handle specific error cases
            let errorMessage = error.message || 'Registration failed. Please try again.';

            if (errorMessage.includes('Username already exists')) {
                errorMessage = 'This username is already taken. Please choose a different one.';
            } else if (errorMessage.includes('Email already exists')) {
                errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            } else if (errorMessage.includes('Phone already exists')) {
                errorMessage = 'This phone number is already registered.';
            } else if (errorMessage.includes('Network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            setAlertConfig({
                visible: true,
                title: 'Registration Failed',
                message: errorMessage,
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const handleSignup = () => {
        // Clear previous validation errors
        setValidationErrors({});

        // Validate form
        const validation = validateSignupForm(form);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            // Show first error in alert
            const firstError = Object.values(validation.errors)[0];
            if (firstError) {
                setAlertConfig({
                    visible: true,
                    title: 'Validation Error',
                    message: firstError,
                    buttons: [{ text: 'OK', style: 'default' }],
                });
            }
            return;
        }

        // Submit registration
        register(form);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 px-6 pt-8 pb-10">

                        {/* Logo / Icon */}
                        <View className="items-center mb-8">
                            <View className="w-16 h-16 rounded-2xl bg-[#6C5CE7] items-center justify-center mb-4">
                                <Ionicons name="chatbubbles" size={32} color="#fff" />
                            </View>
                            <Text className="text-white text-3xl font-bold tracking-tight">
                                Create Account
                            </Text>
                            <Text className="text-slate-400 mt-2 text-base text-center">
                                Join the next-gen chat experience
                            </Text>
                        </View>

                        {/* Username */}
                        <View className="mb-4">
                            <View
                                className={`bg-[#1E293B] rounded-2xl flex-row items-center px-4 border ${validationErrors.username
                                    ? 'border-red-500'
                                    : focusedField === 'username'
                                        ? 'border-[#6C5CE7]'
                                        : 'border-transparent'
                                    }`}
                            >
                                <Ionicons name="person-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    placeholder="Username"
                                    placeholderTextColor="#475569"
                                    className="flex-1 text-white ml-3 py-4 text-base"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={form.username}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => {
                                        setForm({ ...form, username: text });
                                        if (validationErrors.username) {
                                            setValidationErrors({ ...validationErrors, username: undefined });
                                        }
                                    }}
                                />
                            </View>
                            {validationErrors.username && (
                                <Text className="text-red-400 text-xs mt-1 ml-4">
                                    {validationErrors.username}
                                </Text>
                            )}
                        </View>

                        {/* Email */}
                        <View className="mb-4">
                            <View
                                className={`bg-[#1E293B] rounded-2xl flex-row items-center px-4 border ${validationErrors.email
                                    ? 'border-red-500'
                                    : focusedField === 'email'
                                        ? 'border-[#6C5CE7]'
                                        : 'border-transparent'
                                    }`}
                            >
                                <Feather name="mail" size={20} color="#94A3B8" />
                                <TextInput
                                    placeholder="Email address"
                                    placeholderTextColor="#475569"
                                    className="flex-1 text-white ml-3 py-4 text-base"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={form.email}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => {
                                        setForm({ ...form, email: text });
                                        if (validationErrors.email) {
                                            setValidationErrors({ ...validationErrors, email: undefined });
                                        }
                                    }}
                                />
                            </View>
                            {validationErrors.email && (
                                <Text className="text-red-400 text-xs mt-1 ml-4">
                                    {validationErrors.email}
                                </Text>
                            )}
                        </View>

                        {/* Phone */}
                        <View className="mb-4">
                            <View
                                className={`bg-[#1E293B] rounded-2xl flex-row items-center px-4 border ${validationErrors.phone
                                    ? 'border-red-500'
                                    : focusedField === 'phone'
                                        ? 'border-[#6C5CE7]'
                                        : 'border-transparent'
                                    }`}
                            >
                                <Feather name="phone" size={20} color="#94A3B8" />
                                <TextInput
                                    placeholder="Phone number"
                                    placeholderTextColor="#475569"
                                    className="flex-1 text-white ml-3 py-4 text-base"
                                    keyboardType="phone-pad"
                                    value={form.phone}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => {
                                        setForm({ ...form, phone: text });
                                        if (validationErrors.phone) {
                                            setValidationErrors({ ...validationErrors, phone: undefined });
                                        }
                                    }}
                                />
                            </View>
                            {validationErrors.phone && (
                                <Text className="text-red-400 text-xs mt-1 ml-4">
                                    {validationErrors.phone}
                                </Text>
                            )}
                        </View>

                        {/* Password */}
                        <View className="mb-6">
                            <View
                                className={`bg-[#1E293B] rounded-2xl flex-row items-center px-4 border ${validationErrors.password
                                    ? 'border-red-500'
                                    : focusedField === 'password'
                                        ? 'border-[#6C5CE7]'
                                        : 'border-transparent'
                                    }`}
                            >
                                <Feather name="lock" size={20} color="#94A3B8" />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#475569"
                                    secureTextEntry={!showPassword}
                                    className="flex-1 text-white ml-3 py-4 text-base"
                                    autoCapitalize="none"
                                    value={form.password}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => {
                                        setForm({ ...form, password: text });
                                        if (validationErrors.password) {
                                            setValidationErrors({ ...validationErrors, password: undefined });
                                        }
                                    }}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                                    <Feather
                                        name={showPassword ? 'eye' : 'eye-off'}
                                        size={20}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            </View>
                            {validationErrors.password && (
                                <Text className="text-red-400 text-xs mt-1 ml-4">
                                    {validationErrors.password}
                                </Text>
                            )}
                        </View>

                        {/* Signup Button */}
                        <TouchableOpacity
                            onPress={handleSignup}
                            disabled={isPending}
                            activeOpacity={0.85}
                            className="bg-[#6C5CE7] py-4 rounded-2xl items-center mb-6"
                        >
                            {isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-base font-bold tracking-wide">
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-px bg-slate-700" />
                            <Text className="text-slate-500 mx-4 text-sm">or continue with</Text>
                            <View className="flex-1 h-px bg-slate-700" />
                        </View>

                        {/* Social Buttons */}
                        <View className="flex-row gap-4 mb-8">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="flex-1 bg-[#1E293B] py-4 rounded-2xl flex-row items-center justify-center gap-2 border border-slate-700"
                            >
                                <Ionicons name="logo-google" size={20} color="#fff" />
                                <Text className="text-white font-medium">Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="flex-1 bg-[#1E293B] py-4 rounded-2xl flex-row items-center justify-center gap-2 border border-slate-700"
                            >
                                <Ionicons name="logo-github" size={20} color="#fff" />
                                <Text className="text-white font-medium">GitHub</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="flex-row justify-center">
                            <Text className="text-slate-400 text-sm">Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.replace('/login')}>
                                <Text className="text-[#00CEC9] font-semibold text-sm">Sign In</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

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
