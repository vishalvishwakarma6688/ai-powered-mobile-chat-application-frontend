import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useGetAllUsers } from '../../lib/hooks/user/useGetAllUsers';
import CustomAlert from '../common/CustomAlert';

interface ContactPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelectContacts: (contacts: Array<{ name: string; phoneNumber?: string; userId?: string }>) => void;
}

export const ContactPicker: React.FC<ContactPickerProps> = ({
    visible,
    onClose,
    onSelectContacts,
}) => {
    const [activeTab, setActiveTab] = useState<'app' | 'device'>('app');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    const { data: usersData, isLoading: loadingUsers } = useGetAllUsers();

    // Load device contacts when switching to device tab
    useEffect(() => {
        if (activeTab === 'device' && deviceContacts.length === 0) {
            loadDeviceContacts();
        }
    }, [activeTab]);

    const loadDeviceContacts = async () => {
        try {
            setLoadingContacts(true);
            const { status } = await Contacts.requestPermissionsAsync();

            if (status !== 'granted') {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Denied',
                    message: 'Cannot access contacts without permission',
                    buttons: [
                        {
                            text: 'OK',
                            style: 'default',
                            onPress: () => {
                                setActiveTab('app');
                                setAlertConfig({ visible: false, title: '' });
                            }
                        }
                    ],
                });
                return;
            }

            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
            });

            // Filter contacts with phone numbers
            const contactsWithPhone = data.filter(
                (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
            );

            setDeviceContacts(contactsWithPhone);
        } catch (error) {
            console.error('Error loading contacts:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to load contacts',
                buttons: [{ text: 'OK', style: 'default', onPress: () => setAlertConfig({ visible: false, title: '' }) }],
            });
        } finally {
            setLoadingContacts(false);
        }
    };

    // Filter users based on search
    const filteredUsers = usersData?.data?.filter((user: any) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Filter device contacts based on search
    const filteredDeviceContacts = deviceContacts.filter((contact) =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleContactSelection = (id: string) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedContacts(newSelected);
    };

    const handleSend = () => {
        const contacts: Array<{ name: string; phoneNumber?: string; userId?: string }> = [];

        if (activeTab === 'app') {
            // Get selected app users
            selectedContacts.forEach((userId) => {
                const user = usersData?.data?.find((u: any) => u._id === userId);
                if (user) {
                    contacts.push({
                        name: user.username,
                        userId: user._id,
                    });
                }
            });
        } else {
            // Get selected device contacts
            selectedContacts.forEach((contactId) => {
                const contact = deviceContacts.find((c) => (c as any).id === contactId);
                if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    contacts.push({
                        name: contact.name || 'Unknown',
                        phoneNumber: contact.phoneNumbers[0].number,
                    });
                }
            });
        }

        if (contacts.length > 0) {
            onSelectContacts(contacts);
            setSelectedContacts(new Set());
            onClose();
        }
    };

    const renderAppUser = ({ item }: { item: any }) => {
        const isSelected = selectedContacts.has(item._id);
        const checkboxClass = isSelected
            ? 'w-6 h-6 rounded-full border-2 items-center justify-center bg-[#6C5CE7] border-[#6C5CE7]'
            : 'w-6 h-6 rounded-full border-2 items-center justify-center border-gray-500';

        return (
            <TouchableOpacity
                className="flex-row items-center px-4 py-3 border-b border-gray-800"
                onPress={() => toggleContactSelection(item._id)}
            >
                {item.profilePic ? (
                    <Image
                        source={{ uri: item.profilePic }}
                        className="w-12 h-12 rounded-full"
                    />
                ) : (
                    <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center">
                        <Text className="text-white text-lg font-semibold">
                            {item.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View className="flex-1 ml-3">
                    <Text className="text-white text-base font-medium">
                        {item.username}
                    </Text>
                    {item.bio && (
                        <Text className="text-gray-400 text-sm" numberOfLines={1}>
                            {item.bio}
                        </Text>
                    )}
                </View>
                <View className={checkboxClass}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
            </TouchableOpacity>
        );
    };

    const renderDeviceContact = ({ item }: { item: Contacts.Contact }) => {
        const contactId = (item as any).id; // expo-contacts uses 'id' but TypeScript types don't include it
        const isSelected = selectedContacts.has(contactId);
        const phoneNumber = item.phoneNumbers?.[0]?.number || '';
        const checkboxClass = isSelected
            ? 'w-6 h-6 rounded-full border-2 items-center justify-center bg-[#6C5CE7] border-[#6C5CE7]'
            : 'w-6 h-6 rounded-full border-2 items-center justify-center border-gray-500';

        return (
            <TouchableOpacity
                className="flex-row items-center px-4 py-3 border-b border-gray-800"
                onPress={() => toggleContactSelection(contactId)}
            >
                <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center">
                    <Text className="text-white text-lg font-semibold">
                        {(item.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View className="flex-1 ml-3">
                    <Text className="text-white text-base font-medium">
                        {item.name || 'Unknown'}
                    </Text>
                    <Text className="text-gray-400 text-sm">{phoneNumber}</Text>
                </View>
                <View className={checkboxClass}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
            </TouchableOpacity>
        );
    };

    const tabAppClass = activeTab === 'app'
        ? 'flex-1 py-3 items-center border-b-2 border-[#6C5CE7]'
        : 'flex-1 py-3 items-center';

    const tabDeviceClass = activeTab === 'device'
        ? 'flex-1 py-3 items-center border-b-2 border-[#6C5CE7]'
        : 'flex-1 py-3 items-center';

    const tabAppTextClass = activeTab === 'app'
        ? 'text-base font-medium text-[#6C5CE7]'
        : 'text-base font-medium text-gray-400';

    const tabDeviceTextClass = activeTab === 'device'
        ? 'text-base font-medium text-[#6C5CE7]'
        : 'text-base font-medium text-gray-400';

    const sendButtonClass = selectedContacts.size > 0
        ? 'text-base font-semibold text-[#6C5CE7]'
        : 'text-base font-semibold text-gray-600';

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                transparent={false}
                onRequestClose={onClose}
            >
                <View className="flex-1 bg-[#0F172A]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800">
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-semibold">
                            Share Contact
                        </Text>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={selectedContacts.size === 0}
                        >
                            <Text className={sendButtonClass}>
                                Send ({selectedContacts.size})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row border-b border-gray-800">
                        <TouchableOpacity
                            className={tabAppClass}
                            onPress={() => setActiveTab('app')}
                        >
                            <Text className={tabAppTextClass}>
                                App Users
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={tabDeviceClass}
                            onPress={() => setActiveTab('device')}
                        >
                            <Text className={tabDeviceTextClass}>
                                Device Contacts
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="px-4 py-3 border-b border-gray-800">
                        <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-white"
                                placeholder={`Search ${activeTab === 'app' ? 'users' : 'contacts'}...`}
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Content */}
                    {activeTab === 'app' ? (
                        loadingUsers ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" color="#6C5CE7" />
                            </View>
                        ) : (
                            <FlatList
                                data={filteredUsers}
                                keyExtractor={(item) => item._id}
                                renderItem={renderAppUser}
                                ListEmptyComponent={
                                    <View className="items-center justify-center py-8">
                                        <Ionicons name="people-outline" size={48} color="#6B7280" />
                                        <Text className="text-gray-400 text-base mt-2">
                                            {searchQuery ? 'No users found' : 'No users available'}
                                        </Text>
                                    </View>
                                }
                            />
                        )
                    ) : loadingContacts ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#6C5CE7" />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredDeviceContacts}
                            keyExtractor={(item) => (item as any).id}
                            renderItem={renderDeviceContact}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-8">
                                    <Ionicons name="phone-portrait-outline" size={48} color="#6B7280" />
                                    <Text className="text-gray-400 text-base mt-2">
                                        {searchQuery ? 'No contacts found' : 'No contacts available'}
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </Modal>

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig({ visible: false, title: '' })}
            />
        </>
    );
};
