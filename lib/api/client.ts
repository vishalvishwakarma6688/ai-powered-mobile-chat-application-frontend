import axios from 'axios';
import { API_URL } from '../config/api.config';

// Use centralized API URL
const BASE_URL = API_URL;

// Export BASE_URL for use in other modules
export { BASE_URL };

// Log the API URL for debugging (only in development)
if (__DEV__) {
    console.log('🌐 API Client initialized with Base URL:', BASE_URL);
}

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request interceptor — attach auth token ─────────────────────────────────
apiClient.interceptors.request.use(
    async (config) => {
        // Dynamically import to avoid circular dependencies
        const { useAuthStore } = await import('../store/authStore');
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response interceptor — unwrap data / handle errors ──────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const statusCode = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || 'Something went wrong';

        // Handle token expiration (401 Unauthorized)
        if (statusCode === 401 && (message.includes('Token expired') || message.includes('Invalid token') || message.includes('Authentication'))) {
            console.log('🔒 Token expired, logging out user...');

            // Dynamically import to avoid circular dependencies
            const { useAuthStore } = await import('../store/authStore');
            const { router } = await import('expo-router');

            // Clear auth state
            useAuthStore.getState().logout();

            // Redirect to login with a message
            // We'll use a query parameter to show a friendly message
            router.replace('/login?expired=true');

            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        return Promise.reject(new Error(message));
    },
);
