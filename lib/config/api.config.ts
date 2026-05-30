import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * ⚠️ CHANGE YOUR IP ADDRESS HERE ⚠️
 * 
 * This is the ONLY place you need to change the IP address.
 * All API calls and Socket connections will use this IP.
 * 
 * To find your IP:
 * Windows: Run `ipconfig` in terminal
 * Mac: Run `ifconfig` in terminal
 * Linux: Run `ip addr` in terminal
 * 
 * Look for your Wi-Fi adapter's IPv4 address (e.g., 192.168.x.x)
 */
const SERVER_IP = '192.168.0.110'; // 👈 Current IP - Updated automatically
const SERVER_PORT = 5000;

/**
 * Get the base URL for API calls
 */
export const getApiUrl = (): string => {
    // Check for environment variable override
    const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    if (envApiUrl) {
        console.log('📌 Using API URL from environment:', envApiUrl);
        return envApiUrl;
    }

    // Use the configured IP address
    const apiUrl = `http://${SERVER_IP}:${SERVER_PORT}`;
    console.log('📌 Using API URL from config:', apiUrl);
    return apiUrl;
};

/**
 * Get the Socket.IO URL (same as API URL)
 */
export const getSocketUrl = (): string => {
    return getApiUrl();
};

// Export the URLs
export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Log configuration in development
if (__DEV__) {
    console.log('🌐 ========================================');
    console.log('🌐 API Configuration');
    console.log('🌐 ========================================');
    console.log('🌐 Server IP:', SERVER_IP);
    console.log('🌐 Server Port:', SERVER_PORT);
    console.log('🌐 API URL:', API_URL);
    console.log('🌐 Socket URL:', SOCKET_URL);
    console.log('🌐 Platform:', Platform.OS);
    console.log('🌐 ========================================');
}
