import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    console.log('📱 Settings screen rendered');

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-slate-800 flex-row items-center">
                <TouchableOpacity
                    onPress={() => {
                        console.log('🔙 Back button pressed from Settings');
                        router.back();
                    }}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-lg ml-2">
                    Settings
                </Text>
            </View>

            <View className="flex-1 items-center justify-center px-6">
                <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                    <Ionicons name="settings-outline" size={40} color="#6C5CE7" />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                    Settings
                </Text>
                <Text className="text-slate-400 text-center text-sm">
                    Settings page coming soon!
                </Text>
            </View>
        </SafeAreaView>
    );
}
