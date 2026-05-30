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
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useLogin } from '../lib/hooks/auth';
import { useAuthStore } from '../lib/store/authStore';
import { validateLoginForm } from '../lib/utils/validation';
import CustomAlert from '../components/common/CustomAlert';
import NetworkDiagnostic from '../components/debug/NetworkDiagnostic';

export default function Login() {
    const { expired } = useLocalSearchParams<{ expired?: string }>();
    const [form, setForm] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showDiagnostic, setShowDiagnostic] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
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

    // Show session expired message if redirected from token expiration
    useEffect(() => {
        if (expired === 'true') {
            setAlertConfig({
                visible: true,
                title: '⏰ Session Expired',
                message: 'Your session has expired. Please login again to continue.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    }, [expired]);

    const { mutate: login, isPending } = useLogin({
        onSuccess: async (data) => {
            console.log('✅ Login successful:', data.data.user.username);

            try {
                // Save authentication data to store and storage
                await setAuth(data.data.user, data.data.token);
                console.log('✅ Auth data saved');

                // Navigate immediately
                router.replace('/(tabs)');

                // Show welcome message after navigation
                setTimeout(() => {
                    setAlertConfig({
                        visible: true,
                        title: '👋 Welcome Back!',
                        message: `Good to see you again, ${data.data.user.username}!`,
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
            console.error('❌ Login failed:', error);

            // Handle specific error cases
            let errorMessage = error.message || 'Login failed. Please try again.';

            if (errorMessage.includes('Invalid credentials') ||
                errorMessage.includes('User not found') ||
                errorMessage.includes('Incorrect password')) {
                errorMessage = 'Invalid username or password. Please try again.';
            } else if (errorMessage.includes('Network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            setAlertConfig({
                visible: true,
                title: 'Login Failed',
                message: errorMessage,
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const handleLogin = () => {
        // Clear previous validation errors
        setValidationErrors({});

        // Validate form
        const validation = validateLoginForm(form);
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

        // Submit login
        login(form);
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
                                Welcome Back
                            </Text>
                            <Text className="text-slate-400 mt-2 text-base text-center">
                                Sign in to continue chatting
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

                        {/* Password */}
                        <View className="mb-4">
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

                        {/* Forgot Password */}
                        <TouchableOpacity
                            className="mb-6"
                            onPress={() => setAlertConfig({
                                visible: true,
                                title: 'Coming Soon',
                                message: 'Password reset feature will be available soon!',
                                buttons: [{ text: 'OK', style: 'default' }],
                            })}
                        >
                            <Text className="text-[#00CEC9] text-sm text-right">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isPending}
                            activeOpacity={0.85}
                            className="bg-[#6C5CE7] py-4 rounded-2xl items-center mb-4"
                        >
                            {isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-base font-bold tracking-wide">
                                    Sign In
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Network Diagnostic Button */}
                        <TouchableOpacity
                            onPress={() => setShowDiagnostic(!showDiagnostic)}
                            className="mb-6 py-2"
                        >
                            <Text className="text-[#6C5CE7] text-sm text-center">
                                {showDiagnostic ? '🔼 Hide' : '🔍 Test'} Network Connection
                            </Text>
                        </TouchableOpacity>

                        {/* Network Diagnostic Component */}
                        {showDiagnostic && <NetworkDiagnostic />}

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
                            <Text className="text-slate-400 text-sm">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.replace('/signup')}>
                                <Text className="text-[#00CEC9] font-semibold text-sm">Sign Up</Text>
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
