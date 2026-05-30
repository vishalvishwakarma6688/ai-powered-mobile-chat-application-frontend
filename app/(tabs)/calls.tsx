import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CallsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 border-b border-slate-800 flex-row items-center justify-between">
                    <Text className="text-white text-2xl font-bold">Calls</Text>
                    <TouchableOpacity className="w-10 h-10 rounded-full bg-[#6C5CE7] items-center justify-center">
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Call History Placeholder */}
                <View className="flex-1 items-center justify-center px-6 py-20">
                    <View className="w-24 h-24 rounded-full bg-slate-800 items-center justify-center mb-6">
                        <Ionicons name="call-outline" size={48} color="#6C5CE7" />
                    </View>
                    <Text className="text-white text-xl font-semibold mb-2">
                        No Calls Yet
                    </Text>
                    <Text className="text-slate-400 text-center text-sm mb-8">
                        Your call history will appear here.{'\n'}
                        Start a voice or video call with your contacts.
                    </Text>
                    <TouchableOpacity className="bg-[#6C5CE7] px-8 py-3 rounded-full">
                        <Text className="text-white font-semibold">Make a Call</Text>
                    </TouchableOpacity>
                </View>

                {/* Example Call Items (commented out for now) */}
                {/* 
                <View className="px-6 py-2">
                    <TouchableOpacity className="flex-row items-center py-4 border-b border-slate-800">
                        <View className="w-12 h-12 rounded-full bg-[#6C5CE7] items-center justify-center">
                            <Text className="text-white font-bold text-lg">J</Text>
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-white font-semibold">John Doe</Text>
                            <View className="flex-row items-center mt-1">
                                <Ionicons name="call-outline" size={14} color="#10B981" />
                                <Text className="text-slate-400 text-sm ml-1">Incoming • 2:34</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-slate-500 text-xs">10:30 AM</Text>
                            <TouchableOpacity className="mt-2">
                                <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
                */}
            </ScrollView>
        </SafeAreaView>
    );
}
