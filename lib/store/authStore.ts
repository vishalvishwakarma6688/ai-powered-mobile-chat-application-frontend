import { create } from 'zustand';
import { AuthUser } from '../api/auth/authApi';
import { saveToken, getToken, removeToken, saveUserData, getUserData, clearAllStorage } from '../utils/storage';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setAuth: (user: AuthUser, token: string) => Promise<void>;
    clearAuth: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

/**
 * Global authentication store using Zustand.
 * Handles user state, token management, and persistence.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    /**
     * Set authentication data (user + token) and persist to storage
     */
    setAuth: async (user: AuthUser, token: string) => {
        // Set state immediately for better UX
        set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
        });

        // Try to persist to storage (non-blocking)
        try {
            await saveToken(token);
            await saveUserData(user);
        } catch (error) {
            console.error('Failed to persist auth to storage:', error);
            // Don't throw - state is already set, storage is just a bonus
        }
    },

    /**
     * Clear authentication data and remove from storage
     */
    clearAuth: async () => {
        // Clear state immediately
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });

        // Try to clear storage (non-blocking)
        try {
            await clearAllStorage();
        } catch (error) {
            console.error('Failed to clear storage:', error);
            // Don't throw - state is already cleared
        }
    },

    /**
     * Load authentication data from storage on app start
     */
    loadAuth: async () => {
        try {
            set({ isLoading: true });
            const [token, userData] = await Promise.all([
                getToken(),
                getUserData(),
            ]);

            if (token && userData) {
                set({
                    user: userData,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error('Failed to load auth:', error);
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },
}));
