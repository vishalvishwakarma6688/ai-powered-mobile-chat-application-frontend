import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useChats } from '../../lib/hooks/chat/useChats';
import { useAuthStore } from '../../lib/store/authStore';
import { useSocket } from '../../lib/socket/socketContext';
import { BASE_URL } from '../../lib/api/client';
import ChatList from '../../components/chat/ChatList';
import CustomPopupMenu, { PopupMenuItem } from '../../components/common/CustomPopupMenu';
import CreateGroupDialog from '../../components/chat/CreateGroupDialog';

export default function ChatsScreen() {
  const { user } = useAuthStore();
  const { isConnected } = useSocket();
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showConnectingBanner, setShowConnectingBanner] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!isConnected) {
      // Delay showing "Connecting to server..." by 3.5 seconds to prevent startup banner flash
      timer = setTimeout(() => {
        setShowConnectingBanner(true);
      }, 3500);
    } else {
      setShowConnectingBanner(false);
    }
    return () => clearTimeout(timer);
  }, [isConnected]);

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
      {/* Network Status Banner */}
      {!isConnected && showConnectingBanner && (
        <View className="bg-amber-600/90 py-1.5 px-4 flex-row items-center justify-center" style={{ backgroundColor: '#D97706' }}>
          <Ionicons name="cloud-offline-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white text-xs font-semibold">
            Offline - Showing cached chats
          </Text>
        </View>
      )}

      {/* Header */}
      <View className="px-6 py-4 border-b border-slate-800 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {/* User Profile Avatar */}
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/settings')} 
            className="mr-3 active:opacity-80"
          >
            {user?.profilePic ? (
              <Image
                source={{ 
                  uri: user.profilePic.startsWith('http') || user.profilePic.startsWith('file://') 
                    ? user.profilePic 
                    : `${BASE_URL}${user.profilePic}` 
                }}
                className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-[#6C5CE7] items-center justify-center border border-slate-700">
                <Text className="text-white font-bold text-base">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Chats</Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              Logged in as <Text className="text-[#6C5CE7] font-semibold">{user?.username || 'User'}</Text>
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {/* New Chat Button */}
          <TouchableOpacity
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 items-center justify-center active:bg-slate-700"
            onPress={handleNewChat}
            style={{ marginRight: 8 }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          </TouchableOpacity>

          {/* More Menu Button */}
          <TouchableOpacity
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 items-center justify-center active:bg-slate-700"
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
