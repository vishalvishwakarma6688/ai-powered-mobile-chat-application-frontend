import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSearchUsers } from '../../lib/hooks/search/useSearchUsers';
import { useCreateChat } from '../../lib/hooks/chat/useCreateChat';
import SearchResults from '../../components/search/SearchResults';
import CustomAlert from '../../components/common/CustomAlert';

export default function ContactsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [creatingChatForUserId, setCreatingChatForUserId] = useState<string | undefined>();
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    // Debounce search query (wait 300ms after user stops typing)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search users
    const { data, isLoading, error } = useSearchUsers(
        debouncedQuery,
        debouncedQuery.trim().length > 0
    );

    // Create chat mutation
    const { mutate: createChat } = useCreateChat({
        onSuccess: (response) => {
            console.log('✅ Chat created:', response.data._id);
            setCreatingChatForUserId(undefined);

            // Navigate directly to chat screen
            router.push(`/chat/${response.data._id}`);
        },
        onError: (error) => {
            console.error('❌ Failed to create chat:', error);
            setCreatingChatForUserId(undefined);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: error.message || 'Failed to create chat. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const handleStartChat = (userId: string) => {
        setCreatingChatForUserId(userId);
        createChat(userId);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-slate-800">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-2xl font-bold">Contacts</Text>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-[#6C5CE7] items-center justify-center"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Coming Soon',
                            message: 'Add contact feature will be available soon!',
                            buttons: [{ text: 'OK', style: 'default' }],
                        })}
                    >
                        <Ionicons name="person-add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-[#1E293B] rounded-2xl flex-row items-center px-4 py-2">
                    <Ionicons name="search" size={20} color="#94A3B8" />
                    <TextInput
                        placeholder="Search users by username..."
                        placeholderTextColor="#475569"
                        className="flex-1 text-white ml-3 text-base"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Search Results */}
            <SearchResults
                users={data?.data || []}
                isLoading={isLoading}
                error={error}
                searchQuery={debouncedQuery}
                onStartChat={handleStartChat}
                creatingChatForUserId={creatingChatForUserId}
            />

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
