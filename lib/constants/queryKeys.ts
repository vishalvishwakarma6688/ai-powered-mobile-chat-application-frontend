/**
 * Centralised React Query cache keys.
 * Always use these — never write raw string arrays in hooks.
 *
 * Convention:
 *   - Top-level key = domain (e.g. 'chats')
 *   - Second level  = operation (e.g. 'list', 'detail')
 *   - Third level   = identifier (e.g. chatId)
 */

export const QUERY_KEYS = {
    // ─── Auth ─────────────────────────────────────────────────────────────────
    AUTH: {
        ME: ['auth', 'me'] as const,
    },

    // ─── Users ────────────────────────────────────────────────────────────────
    USERS: {
        DETAIL: (id: string) => ['users', 'detail', id] as const,
        CONTACTS: ['users', 'contacts'] as const,
    },

    // ─── Chats ────────────────────────────────────────────────────────────────
    CHATS: {
        LIST: ['chats', 'list'] as const,
        DETAIL: (chatId: string) => ['chats', 'detail', chatId] as const,
    },

    // ─── Messages ─────────────────────────────────────────────────────────────
    MESSAGES: {
        LIST: (chatId: string) => ['messages', 'list', chatId] as const,
        UNREAD: (chatId: string) => ['messages', 'unread', chatId] as const,
        SEARCH: ['messages', 'search'] as const,
        PINNED: (chatId: string) => ['messages', 'pinned', chatId] as const,
        STARRED: ['messages', 'starred'] as const,
        SCHEDULED: (chatId: string) => ['messages', 'scheduled', chatId] as const,
    },

    // ─── Notifications ────────────────────────────────────────────────────────
    NOTIFICATIONS: {
        LIST: ['notifications', 'list'] as const,
    },

    // ─── Calls ────────────────────────────────────────────────────────────────
    CALLS: {
        HISTORY: ['calls', 'history'] as const,
    },

    // ─── Search ───────────────────────────────────────────────────────────────
    SEARCH: {
        USERS: (q: string) => ['search', 'users', q] as const,
        CHATS: (q: string) => ['search', 'chats', q] as const,
        MESSAGES: (q: string) => ['search', 'messages', q] as const,
        GLOBAL: (q: string) => ['search', 'global', q] as const,
    },

    // ─── Block ────────────────────────────────────────────────────────────────
    BLOCK: {
        LIST: ['block', 'list'] as const,
    },
} as const;
