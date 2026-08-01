import { Chat } from '../api/chat/chatApi';
import { Message } from '../api/message/messageApi';

/**
 * Web-compatible Database fallback service.
 * On Web platforms, SQLite is bypassed in favor of React Query cache & Memory.
 */

export const initDatabase = () => {
    console.log('✅ [WEB DB] Initialized web database fallback');
};

export const dbSaveChats = (chats: Chat[]) => {
    // Web fallback handled by React Query cache & AsyncStorage
};

export const dbGetChats = (): Partial<Chat>[] => {
    return [];
};

export const dbSaveMessages = (chatId: string, messages: Message[]) => {
    // Web fallback handled by React Query cache & AsyncStorage
};

export const dbGetMessages = (chatId: string, limit = 50, offset = 0): Message[] => {
    return [];
};

export const dbQueueOutbox = (id: string, chatId: string, text: string, type = 'text') => {
    // Web fallback handled by AsyncStorage in useOfflineQueue
};

export const dbGetOutbox = (): any[] => {
    return [];
};

export const dbClearOutboxItem = (id: string) => {
    // Web fallback
};
