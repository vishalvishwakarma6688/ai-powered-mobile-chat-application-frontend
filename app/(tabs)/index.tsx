import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useChats } from '../../lib/hooks/chat/useChats';
import { useAuthStore } from '../../lib/store/authStore';
import ChatList from '../../components/chat/ChatList';
import CustomPopupMenu, { PopupMenuItem } from '../../components/common/CustomPopupMenu';
import CreateGroupDialog from '../../components/chat/CreateGroupDialog';

export default function ChatsScreen() {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Fetch chats
  const { data, isLoading, error, refetch, isRefetching } = useChats();

  const handleNewChat = () => {
    // Navigate to contacts tab to search for users
    router.push('/(tabs)/contacts');
  };

  const handleNewGroup = () => {
    setShowCreateGroup(true);
  };

  const handleGroupCreated = (chatId: string) => {
    // Navigate to the new group chat
    router.push(`/chat/${chatId}`);
  };

  const menuItems: PopupMenuItem[] = [
    {
      icon: 'people',
      label: 'New Group',
      onPress: () => {
        setShowMenu(false);
        handleNewGroup();
      },
    },
    {
      icon: 'star',
      label: 'Starred Messages',
      onPress: () => {
        console.log('🔍 Starred Messages menu item clicked');
        setShowMenu(false);
        console.log('🔍 Navigating to /(tabs)/starred-messages');
        try {
          router.push('/(tabs)/starred-messages');
          console.log('✅ Navigation command executed');
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      },
    },
    {
      icon: 'ban-outline',
      label: 'Blocked Users',
      onPress: () => {
        console.log('🔍 Blocked Users menu item clicked');
        setShowMenu(false);
        console.log('🔍 Navigating to /(tabs)/blocked-users');
        try {
          // Navigate within tabs group (but hidden from tab bar)
          router.push('/(tabs)/blocked-users');
          console.log('✅ Navigation command executed');
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      },
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => {
        console.log('🔍 Settings menu item clicked');
        setShowMenu(false);
        console.log('🔍 Navigating to settings tab');
        try {
          // Navigate to settings tab
          router.push('/(tabs)/settings');
          console.log('✅ Navigation command executed');
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      },
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-slate-800 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Chats</Text>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-[#6C5CE7] items-center justify-center"
            onPress={handleNewChat}
          >
            <Ionicons name="create" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      <ChatList
        chats={data?.data || []}
        currentUserId={user?._id || ''}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        isRefreshing={isRefetching}
      />

      {/* Menu */}
      <CustomPopupMenu
        visible={showMenu}
        items={menuItems}
        onClose={() => setShowMenu(false)}
      />

      {/* Create Group Dialog */}
      <CreateGroupDialog
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={handleGroupCreated}
      />
    </SafeAreaView>
  );
}
