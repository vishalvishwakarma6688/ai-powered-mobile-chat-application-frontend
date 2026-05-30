import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage utility for persisting data locally.
 * Uses AsyncStorage for React Native.
 */

const STORAGE_KEYS = {
    AUTH_TOKEN: '@auth_token',
    USER_DATA: '@user_data',
} as const;

// ─── Token Storage ────────────────────────────────────────────────────────────

export const saveToken = async (token: string): Promise<void> => {
    try {
        if (!token) {
            throw new Error('Token is required');
        }
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        console.log('✅ Token saved successfully');
    } catch (error) {
        console.error('Error saving token:', error);
        // Don't throw - allow app to continue even if storage fails
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        return token;
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const removeToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        console.log('✅ Token removed successfully');
    } catch (error) {
        console.error('Error removing token:', error);
        // Don't throw - allow app to continue
    }
};

// ─── User Data Storage ────────────────────────────────────────────────────────

export const saveUserData = async (userData: any): Promise<void> => {
    try {
        if (!userData) {
            throw new Error('User data is required');
        }
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        console.log('✅ User data saved successfully');
    } catch (error) {
        console.error('Error saving user data:', error);
        // Don't throw - allow app to continue
    }
};

export const getUserData = async (): Promise<any | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

export const removeUserData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        console.log('✅ User data removed successfully');
    } catch (error) {
        console.error('Error removing user data:', error);
        // Don't throw - allow app to continue
    }
};

// ─── Clear All ────────────────────────────────────────────────────────────────

export const clearAllStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
        ]);
        console.log('✅ All storage cleared successfully');
    } catch (error) {
        console.error('Error clearing storage:', error);
        // Don't throw - allow app to continue
    }
};
