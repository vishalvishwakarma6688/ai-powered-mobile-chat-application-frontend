import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../../socket/socketContext';
import { sendTextMessageApi } from '../../api/message/messageApi';
import { queryClient } from '../../api/queryClient';

const PENDING_QUEUE_KEY = '@OFFLINE_PENDING_MESSAGES';

export interface PendingMessage {
    id: string;
    chatId: string;
    text: string;
    createdAt: string;
    type: 'text' | 'image' | 'audio' | 'document' | 'location';
}

export const useOfflineQueue = () => {
    const { isConnected } = useSocket();
    const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Load queued messages from AsyncStorage
    const loadQueue = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
            if (raw) {
                const parsed: PendingMessage[] = JSON.parse(raw);
                setPendingMessages(parsed);
            }
        } catch (e) {
            console.error('Failed to load offline message queue:', e);
        }
    }, []);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    // Queue a message for offline sending
    const queueMessage = useCallback(async (msg: PendingMessage) => {
        try {
            const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
            const current: PendingMessage[] = raw ? JSON.parse(raw) : [];
            const updated = [...current, msg];
            await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(updated));
            setPendingMessages(updated);
        } catch (e) {
            console.error('Failed to queue offline message:', e);
        }
    }, []);

    // Sync & flush queue when network is restored
    const flushQueue = useCallback(async () => {
        if (!isConnected || isSyncing) return;

        try {
            const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
            if (!raw) return;

            const queue: PendingMessage[] = JSON.parse(raw);
            if (queue.length === 0) return;

            setIsSyncing(true);
            console.log(`📡 [OFFLINE QUEUE] Flushing ${queue.length} pending messages...`);

            const remaining: PendingMessage[] = [];

            for (const item of queue) {
                try {
                    await sendTextMessageApi({
                        chatId: item.chatId,
                        text: item.text,
                    });
                    console.log(`✅ [OFFLINE QUEUE] Synced message ${item.id}`);
                } catch (err) {
                    console.error(`❌ [OFFLINE QUEUE] Failed to sync message ${item.id}:`, err);
                    remaining.push(item);
                }
            }

            await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(remaining));
            setPendingMessages(remaining);

            // Invalidate queries so fresh server data reflects instantly
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        } catch (e) {
            console.error('Failed to flush offline queue:', e);
        } finally {
            setIsSyncing(false);
        }
    }, [isConnected, isSyncing]);

    useEffect(() => {
        if (isConnected) {
            flushQueue();
        }
    }, [isConnected, flushQueue]);

    return {
        pendingMessages,
        queueMessage,
        flushQueue,
        isSyncing,
    };
};
