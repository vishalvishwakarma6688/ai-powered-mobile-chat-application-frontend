import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettingsState {
    soundEnabled: boolean;
    vibrateEnabled: boolean;
    showPreviews: boolean;
    groupSoundsEnabled: boolean;
    
    toggleSound: () => void;
    toggleVibrate: () => void;
    togglePreviews: () => void;
    toggleGroupSounds: () => void;
}

/**
 * Zustand store to manage and persist local notification preferences
 */
export const useNotificationSettingsStore = create<NotificationSettingsState>()(
    persist(
        (set) => ({
            soundEnabled: true,
            vibrateEnabled: true,
            showPreviews: true,
            groupSoundsEnabled: true,

            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
            toggleVibrate: () => set((state) => ({ vibrateEnabled: !state.vibrateEnabled })),
            togglePreviews: () => set((state) => ({ showPreviews: !state.showPreviews })),
            toggleGroupSounds: () => set((state) => ({ groupSoundsEnabled: !state.groupSoundsEnabled })),
        }),
        {
            name: 'notification-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
