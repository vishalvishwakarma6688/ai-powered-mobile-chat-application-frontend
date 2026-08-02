import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';

// Configure foreground notification presentation style for SDK 54
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for FCM Push Notifications & send token to backend
 */
export async function registerForPushNotificationsAsync() {
    try {
        if (!Device.isDevice) {
            console.log('ℹ️ Push notifications require a physical device');
            return null;
        }

        // Check & request notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('⚠️ Push notification permission was not granted');
            return null;
        }

        // Configure Android high importance channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#6C5CE7',
                sound: 'default',
            });
        }

        // Fetch FCM Device Token
        let token = '';
        try {
            const tokenData = await Notifications.getDevicePushTokenAsync();
            token = tokenData.data;
            console.log('🔥 [FCM PUSH TOKEN] Device FCM Token:', token);
        } catch (e) {
            console.warn('Fallback to Expo push token:', e);
            const expoTokenData = await Notifications.getExpoPushTokenAsync();
            token = expoTokenData.data;
        }

        if (token) {
            // Save push token on backend server
            await apiClient.post('/users/push-token', { pushToken: token });
            console.log('✅ [FCM PUSH TOKEN] Registered with backend server');
        }

        return token;
    } catch (error: any) {
        console.error('❌ Failed to register push token:', error?.message || error);
        return null;
    }
}

/**
 * Setup push notification tap response listeners
 */
export function setupNotificationListeners(onNavigateToChat: (chatId: string) => void) {
    // Received in foreground
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log('🔔 [NOTIFICATION RECEIVED]', notification.request.content.title);
    });

    // Tapped by user
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data && data.chatId) {
            console.log('👆 [NOTIFICATION TAPPED] Opening chat:', data.chatId);
            onNavigateToChat(data.chatId as string);
        }
    });

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
}
