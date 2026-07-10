import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../lib/store/authStore';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Show a clean loading state matching the app theme while checking auth
    if (isLoading) {
        return (
            <View className="flex-1 bg-[#0F172A] items-center justify-center" style={{ backgroundColor: '#0F172A' }}>
                <ActivityIndicator size="large" color="#6C5CE7" />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/login" />;
}
