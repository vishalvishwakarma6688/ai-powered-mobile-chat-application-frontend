import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from '../lib/api/queryClient';
import { asyncStoragePersister } from '../lib/api/queryPersister';
import { useAuthStore } from '../lib/store/authStore';
import { SocketProvider } from '../lib/socket/socketContext';
import { initDatabase } from '../lib/db/database';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../lib/notifications/notificationService';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const BG = '#0F172A';

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();

  useEffect(() => {
    // Initialize SQLite database & load authentication state
    initDatabase();
    loadAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync();
      const unsubscribe = setupNotificationListeners((chatId) => {
        router.push(`/chat/${chatId}`);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inChatScreen = segments[0] === 'chat';
    const inCallScreen = segments[0] === 'call';
    const inSettingsScreen = segments[0] === 'settings';

    if (isAuthenticated && !inAuthGroup && !inChatScreen && !inCallScreen && !inSettingsScreen) {
      // User is authenticated but not in protected routes, redirect to main app
      router.replace('/(tabs)');
    } else if (!isAuthenticated && (inAuthGroup || inChatScreen || inCallScreen || inSettingsScreen)) {
      // User is not authenticated but trying to access protected routes, redirect to login
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 150,
        contentStyle: { backgroundColor: BG },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen
        name="call/incoming"
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="call/[callId]" />
      <Stack.Screen
        name="blocked-users"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="settings/edit-profile" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/appearance" />
      <Stack.Screen name="settings/language" />
      <Stack.Screen name="settings/help" />
      <Stack.Screen name="settings/about" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  // Helper to check & apply OTA updates automatically
  const checkAndApplyUpdate = async () => {
    try {
      if (__DEV__ || !Updates.isEnabled) return;
      console.log('🔍 Checking for OTA updates automatically...');
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        console.log('🔄 New OTA update found! Downloading automatically...');
        await Updates.fetchUpdateAsync();
        console.log('✅ OTA update downloaded! Reloading app automatically...');
        await Updates.reloadAsync();
      }
    } catch (e: any) {
      console.log('ℹ️ Automatic OTA update status:', e?.message || e);
    }
  };

  useEffect(() => {
    // Hide splash screen & reveal app UI instantly (<200ms)
    const init = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Splash screen hide error:', e);
      }
      setReady(true);

      // Check for updates asynchronously in background (never block startup)
      setTimeout(() => {
        checkAndApplyUpdate();
      }, 1000);
    };
    init();

    // Check again when app resumes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAndApplyUpdate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // In-app splash — rendered before the Stack mounts, same dark bg as every screen
  if (!ready) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" backgroundColor={BG} translucent={false} />
        <View style={styles.iconBox}>
          <Ionicons name="chatbubbles" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>ChatApp</Text>
        <Text style={styles.subtitle}>Connect. Chat. Vibe.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={BG} translucent={false} />
      <SafeAreaProvider style={styles.root}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <SocketProvider>
            <RootLayoutContent />
          </SocketProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  splash: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    marginTop: 8,
  },
});
