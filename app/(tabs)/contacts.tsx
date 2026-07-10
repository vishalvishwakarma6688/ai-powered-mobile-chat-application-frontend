import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

import { useSearchUsers } from '../../lib/hooks/search/useSearchUsers';
import { useCreateChat } from '../../lib/hooks/chat/useCreateChat';
import { useGetContacts, useAddContact, useRemoveContact } from '../../lib/hooks/user/useContacts';
import { BASE_URL, apiClient } from '../../lib/api/client';
import SearchResults from '../../components/search/SearchResults';
import CustomAlert from '../../components/common/CustomAlert';

export default function ContactsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [creatingChatForUserId, setCreatingChatForUserId] = useState<string | undefined>();
    const [addingContactId, setAddingContactId] = useState<string | undefined>();

    // Add Contact Modal State
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [targetUsername, setTargetUsername] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupResult, setLookupResult] = useState<any | null>(null);
    const [lookupMessage, setLookupMessage] = useState('');

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

    // Debounce search query (wait 300ms after user stops typing)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Query hooks
    const { data: contactsData, isLoading: isContactsLoading, error: contactsError } = useGetContacts();
    const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useSearchUsers(
        debouncedQuery,
        debouncedQuery.trim().length > 0
    );

    const { mutate: createChat } = useCreateChat({
        onSuccess: (response) => {
            console.log('✅ Chat created:', response.data._id);
            setCreatingChatForUserId(undefined);
            setAddModalVisible(false);
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

    const { mutateAsync: addContactMutate } = useAddContact({
        onError: (err) => {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: err.message || 'Failed to add contact.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    });

    const { mutateAsync: removeContactMutate } = useRemoveContact({
        onError: (err) => {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: err.message || 'Failed to remove contact.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    });

    const handleStartChat = (userId: string) => {
        setCreatingChatForUserId(userId);
        createChat(userId);
    };

    const handleAddContact = async (userId: string) => {
        setAddingContactId(userId);
        try {
            await addContactMutate({ contactId: userId });
            console.log('✅ Contact added successfully.');
            
            // If inside lookup modal, clear state
            setLookupResult(null);
            setTargetUsername('');
            setAddModalVisible(false);

            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'Contact has been added to your list.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        } catch (err) {
            console.error(err);
        } finally {
            setAddingContactId(undefined);
        }
    };

    const confirmRemoveContact = (userId: string, username: string) => {
        setAlertConfig({
            visible: true,
            title: 'Remove Contact',
            message: `Are you sure you want to remove @${username} from your contacts list?`,
            buttons: [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeContactMutate(userId);
                            console.log('✅ Contact removed.');
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            ],
        });
    };

    // Lookup user by exact username for the Add modal
    const handleUsernameLookup = async () => {
        const query = targetUsername.trim();
        if (query.length === 0) return;

        setLookupLoading(true);
        setLookupResult(null);
        setLookupMessage('');

        try {
            console.log(`🔍 Looking up username: ${query}`);
            const { data } = await apiClient.get(`/api/search/users?query=${query}`);
            const foundUser = data.data.find(
                (u: any) => u.username.toLowerCase() === query.toLowerCase()
            );

            if (foundUser) {
                setLookupResult(foundUser);
            } else {
                setLookupMessage('No user found with that exact username.');
            }
        } catch (error) {
            console.error('Failed to lookup user:', error);
            setLookupMessage('Failed to query user. Check your connection.');
        } finally {
            setLookupLoading(false);
        }
    };

    const getFullImageUrl = (path: string | null | undefined): string | null => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    // Render row for current contacts
    const renderContactRow = ({ item }: { item: any }) => {
        const avatarLetter = item.username.charAt(0).toUpperCase();
        return (
            <View className="flex-row items-center py-4 px-6 border-b border-slate-800/80 bg-slate-900/10">
                {/* Profile Pic / Initial */}
                <View className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800 items-center justify-center">
                    {item.profilePic ? (
                        <Image source={{ uri: getFullImageUrl(item.profilePic) || undefined }} className="w-full h-full" />
                    ) : (
                        <Text className="text-white text-lg font-bold">{avatarLetter}</Text>
                    )}
                </View>

                {/* Details */}
                <View className="flex-1 ml-4 mr-2">
                    <View className="flex-row items-center">
                        <Text className="text-white font-bold text-base" numberOfLines={1}>
                            {item.customName || item.username}
                        </Text>
                        {item.isOnline && (
                            <View className="w-2.5 h-2.5 rounded-full bg-green-500 border border-[#0F172A] ml-2" />
                        )}
                    </View>
                    <Text className="text-slate-500 text-xs mt-0.5">
                        @{item.username}
                    </Text>
                </View>

                {/* Actions */}
                <View className="flex-row items-center" style={{ gap: 10 }}>
                    {/* Chat */}
                    <TouchableOpacity
                        onPress={() => handleStartChat(item._id)}
                        disabled={creatingChatForUserId === item._id}
                        className="w-9 h-9 rounded-full bg-[#6C5CE7]/15 items-center justify-center active:bg-[#6C5CE7]/30"
                    >
                        {creatingChatForUserId === item._id ? (
                            <ActivityIndicator size="small" color="#6C5CE7" />
                        ) : (
                            <Ionicons name="chatbubble-outline" size={18} color="#6C5CE7" />
                        )}
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity
                        onPress={() => confirmRemoveContact(item._id, item.username)}
                        className="w-9 h-9 rounded-full bg-red-500/10 items-center justify-center active:bg-red-500/20"
                    >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-slate-800">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-2xl font-bold">Contacts</Text>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-[#6C5CE7] items-center justify-center active:opacity-90 shadow-lg shadow-[#6C5CE7]/30"
                        onPress={() => {
                            setLookupResult(null);
                            setTargetUsername('');
                            setLookupMessage('');
                            setAddModalVisible(true);
                        }}
                    >
                        <Ionicons name="person-add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-[#1E293B] rounded-2xl flex-row items-center px-4 py-2 border border-slate-800">
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

            {/* Main Content Area */}
            {searchQuery.trim().length > 0 ? (
                /* Search Results (When typing) */
                <SearchResults
                    users={searchResults?.data || []}
                    isLoading={isSearchLoading}
                    error={searchError as any}
                    searchQuery={debouncedQuery}
                    onStartChat={handleStartChat}
                    creatingChatForUserId={creatingChatForUserId}
                    contacts={contactsData?.data || []}
                    onAddContact={handleAddContact}
                    addingContactId={addingContactId}
                />
            ) : (
                /* Contact list (When search is empty) */
                <View className="flex-1">
                    {isContactsLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#6C5CE7" />
                            <Text className="text-slate-400 mt-4">Loading contacts...</Text>
                        </View>
                    ) : contactsError ? (
                        <View className="flex-1 items-center justify-center px-6">
                            <Ionicons name="alert-circle" size={40} color="#EF4444" />
                            <Text className="text-white text-base font-semibold mt-2">Failed to load contacts</Text>
                            <Text className="text-slate-400 text-sm text-center mt-1">{(contactsError as any).message || 'Try again later'}</Text>
                        </View>
                    ) : !contactsData?.data || contactsData.data.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-6">
                            <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                                <Ionicons name="people-outline" size={40} color="#94A3B8" />
                            </View>
                            <Text className="text-white text-lg font-semibold mb-2">No Contacts Yet</Text>
                            <Text className="text-slate-400 text-center text-sm leading-5">
                                Add users by tapping the icon in the top right, or search using the search bar.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={contactsData.data}
                            keyExtractor={(item) => item._id}
                            renderItem={renderContactRow}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            )}

            {/* Custom Modal for Adding Contact by Username */}
            <Modal
                visible={addModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-[#0F172A] rounded-t-[32px] border-t border-slate-850 p-6 min-h-[350px] border-slate-800">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-lg font-bold">Add Contact</Text>
                            <TouchableOpacity 
                                onPress={() => setAddModalVisible(false)}
                                className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center"
                            >
                                <Ionicons name="close" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Row */}
                        <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                            Friend's Username
                        </Text>
                        <View className="flex-row items-center mb-4" style={{ gap: 10 }}>
                            <View className="flex-1 bg-[#1E293B] border border-slate-700 rounded-xl flex-row items-center px-4 h-11">
                                <Ionicons name="at" size={18} color="#94A3B8" />
                                <TextInput
                                    placeholder="Enter exact username..."
                                    placeholderTextColor="#475569"
                                    className="flex-1 text-white ml-2 text-base h-full"
                                    value={targetUsername}
                                    onChangeText={setTargetUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    style={{ paddingVertical: 0 }}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleUsernameLookup}
                                disabled={lookupLoading || targetUsername.trim().length === 0}
                                className="bg-[#6C5CE7] h-11 px-4 rounded-xl items-center justify-center active:opacity-90"
                            >
                                {lookupLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text className="text-white font-bold text-sm">Search</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Lookup Results */}
                        <View className="mt-2 min-h-[100px] justify-center">
                            {lookupResult ? (
                                <View className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1 mr-4">
                                        <View className="w-12 h-12 rounded-full overflow-hidden bg-[#6C5CE7] items-center justify-center">
                                            {lookupResult.profilePic ? (
                                                <Image source={{ uri: getFullImageUrl(lookupResult.profilePic) || undefined }} className="w-full h-full" />
                                            ) : (
                                                <Text className="text-white text-lg font-bold">
                                                    {lookupResult.username.charAt(0).toUpperCase()}
                                                </Text>
                                            )}
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-white font-bold text-base" numberOfLines={1}>
                                                {lookupResult.username}
                                            </Text>
                                            <Text className="text-slate-500 text-xs mt-0.5">
                                                @{lookupResult.username}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {/* Action Button inside modal */}
                                    {contactsData?.data?.some(c => c._id === lookupResult._id) ? (
                                        <TouchableOpacity
                                            onPress={() => handleStartChat(lookupResult._id)}
                                            className="bg-[#6C5CE7] px-4 py-2 rounded-xl"
                                        >
                                            <Text className="text-white font-bold text-xs">Chat</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleAddContact(lookupResult._id)}
                                            disabled={addingContactId === lookupResult._id}
                                            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl"
                                        >
                                            {addingContactId === lookupResult._id ? (
                                                <ActivityIndicator size="small" color="#6C5CE7" />
                                            ) : (
                                                <Text className="text-[#6C5CE7] font-bold text-xs">Add Contact</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : lookupMessage ? (
                                <Text className="text-slate-500 text-center text-sm py-4">
                                    {lookupMessage}
                                </Text>
                            ) : (
                                <Text className="text-slate-650 text-center text-sm py-4 text-slate-500">
                                    Enter username and tap search to load details.
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

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
