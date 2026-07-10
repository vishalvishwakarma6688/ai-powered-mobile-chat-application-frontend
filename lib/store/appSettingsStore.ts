import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'dark' | 'light' | 'system';
export type AppLanguage = 'en' | 'es' | 'fr' | 'hi';

interface AppSettingsState {
    theme: AppTheme;
    language: AppLanguage;
    
    setTheme: (theme: AppTheme) => void;
    setLanguage: (language: AppLanguage) => void;
}

/**
 * Zustand store to manage and persist local app preferences (Theme & Language)
 */
export const useAppSettingsStore = create<AppSettingsState>()(
    persist(
        (set) => ({
            theme: 'dark',
            language: 'en',

            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'app-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
