import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/api/queryClient';
import { useAuthStore } from '../lib/store/authStore';
import { SocketProvider } from '../lib/socket/socketContext';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const BG = '#0F172A';

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();

  useEffect(() => {
    // Load authentication state from storage
    loadAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inChatScreen = segments[0] === 'chat';
    const inCallScreen = segments[0] === 'call';

    if (isAuthenticated && !inAuthGroup && !inChatScreen && !inCallScreen) {
      // User is authenticated but not in protected routes, redirect to main app
      router.replace('/(tabs)');
    } else if (!isAuthenticated && (inAuthGroup || inChatScreen || inCallScreen)) {
      // User is not authenticated but trying to access protected routes, redirect to login
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: BG },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ contentStyle: { backgroundColor: BG } }} />
      <Stack.Screen name="login" options={{ contentStyle: { backgroundColor: BG } }} />
      <Stack.Screen
        name="chat/[id]"
        options={{
          contentStyle: { backgroundColor: BG },
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="call/incoming"
        options={{
          contentStyle: { backgroundColor: BG },
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="call/[callId]"
        options={{
          contentStyle: { backgroundColor: BG },
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="blocked-users"
        options={{
          contentStyle: { backgroundColor: BG },
          animation: 'slide_from_right',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          contentStyle: { backgroundColor: BG },
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen name="(tabs)" options={{ contentStyle: { backgroundColor: BG } }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Put any real startup work here (load fonts, check auth token, etc.)
      await new Promise((r) => setTimeout(r, 1800));
      await SplashScreen.hideAsync();
      setReady(true);
    };
    init();
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
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <RootLayoutContent />
          </SocketProvider>
        </QueryClientProvider>
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
