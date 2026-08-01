import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

/**
 * AsyncStorage persister for TanStack React Query.
 * Saves the entire query cache to local device disk so chats, messages,
 * contacts, and user state load instantly (0ms) even when offline.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'CHAT_APP_QUERY_CACHE',
    throttleTime: 1000,
});
