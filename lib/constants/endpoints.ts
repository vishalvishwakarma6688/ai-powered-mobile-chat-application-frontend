/**
 * Central API endpoint constants.
 * Import from here — never hardcode URLs in hooks or components.
 *
 * Base URL is read from the environment (set in lib/api/client.ts).
 * All paths here are relative to the base URL.
 */

export const ENDPOINTS = {
    // ─── Auth ────────────────────────────────────────────────────────────────
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
    },

    // ─── Users ───────────────────────────────────────────────────────────────
    USERS: {
        GET_BY_ID: (id: string) => `/api/users/${id}`,
        UPDATE_PROFILE: '/api/users/profile',
        GET_CONTACTS: '/api/users/contacts',
        ADD_CONTACT: '/api/users/contacts',
        REMOVE_CONTACT: (id: string) => `/api/users/contacts/${id}`,
        UPDATE_PRIVACY: '/api/users/privacy',
        DEVICE_TOKEN: '/api/users/device-token',
    },

    // ─── Chats ───────────────────────────────────────────────────────────────
    CHATS: {
        CREATE_ONE_ON_ONE: '/api/chats/one-on-one',
        CREATE_GROUP: '/api/chats/group',
        GET_ALL: '/api/chats',
        UPDATE_GROUP: (chatId: string) => `/api/chats/${chatId}`,
        ADD_PARTICIPANT: (chatId: string) => `/api/chats/${chatId}/participants`,
        REMOVE_PARTICIPANT: (chatId: string, userId: string) => `/api/chats/${chatId}/participants/${userId}`,
        PROMOTE_MEMBER: (chatId: string, userId: string) => `/api/chats/${chatId}/participants/${userId}/promote`,
        LEAVE: (chatId: string) => `/api/chats/${chatId}/leave`,
        MUTE: (chatId: string) => `/api/chats/${chatId}/mute`,
        DISAPPEARING: (chatId: string) => `/api/chats/${chatId}/disappearing-messages`,
    },

    // ─── Messages ────────────────────────────────────────────────────────────
    MESSAGES: {
        SEND_TEXT: '/api/messages/text',
        SEND_MEDIA: '/api/messages/media',
        SEND_MEDIA_UPLOAD: '/api/messages/media/upload',
        SEND_LOCATION: '/api/messages/location',
        SEND_CONTACT: '/api/messages/contact',
        GET_BY_CHAT: (chatId: string) => `/api/messages/${chatId}`,
        EDIT: (messageId: string) => `/api/messages/${messageId}`,
        DELETE: (messageId: string) => `/api/messages/${messageId}`,
        FORWARD: (messageId: string) => `/api/messages/${messageId}/forward`,
        REACT: (messageId: string) => `/api/messages/${messageId}/react`,
        MARK_DELIVERED: (messageId: string) => `/api/messages/${messageId}/delivered`,
        MARK_READ: (messageId: string) => `/api/messages/${messageId}/read`,
        UNREAD_COUNT: (chatId: string) => `/api/messages/unread/${chatId}`,
        SEARCH: '/api/messages/search',
    },

    // ─── Advanced Messages ───────────────────────────────────────────────────
    ADVANCED_MESSAGES: {
        SCHEDULE: '/api/messages/advanced/schedule',
        GET_SCHEDULED: (chatId: string) => `/api/messages/advanced/scheduled/${chatId}`,
        CANCEL_SCHEDULED: (messageId: string) => `/api/messages/advanced/scheduled/${messageId}`,
        PIN: (messageId: string) => `/api/messages/advanced/${messageId}/pin`,
        UNPIN: (messageId: string) => `/api/messages/advanced/${messageId}/pin`,
        GET_PINNED: (chatId: string) => `/api/messages/advanced/pinned/${chatId}`,
        STAR: (messageId: string) => `/api/messages/advanced/${messageId}/star`,
        UNSTAR: (messageId: string) => `/api/messages/advanced/${messageId}/star`,
        GET_STARRED: '/api/messages/advanced/starred',
        WAVEFORM: (messageId: string) => `/api/messages/advanced/${messageId}/waveform`,
        AUTO_DELETE: (messageId: string) => `/api/messages/advanced/${messageId}/auto-delete`,
    },

    // ─── Media ───────────────────────────────────────────────────────────────
    MEDIA: {
        UPLOAD_IMAGE: '/api/media/image',
        UPLOAD_VIDEO: '/api/media/video',
        UPLOAD_AUDIO: '/api/media/audio',
        UPLOAD_DOCUMENT: '/api/media/document',
    },

    // ─── Search ──────────────────────────────────────────────────────────────
    SEARCH: {
        USERS: '/api/search/users',
        CHATS: '/api/search/chats',
        MESSAGES: '/api/search/messages',
        GLOBAL: '/api/search/global',
    },

    // ─── Blocking ────────────────────────────────────────────────────────────
    BLOCK: {
        BLOCK: (userId: string) => `/api/block/${userId}`,
        UNBLOCK: (userId: string) => `/api/block/${userId}`,
        GET_BLOCKED: '/api/block',
    },

    // ─── Notifications ───────────────────────────────────────────────────────
    NOTIFICATIONS: {
        GET_ALL: '/api/notifications',
        MARK_READ: (id: string) => `/api/notifications/${id}/read`,
        MARK_ALL_READ: '/api/notifications/read-all',
        DELETE: (id: string) => `/api/notifications/${id}`,
    },

    // ─── Calls ───────────────────────────────────────────────────────────────
    CALLS: {
        INITIATE: '/api/calls',
        ACCEPT: (callId: string) => `/api/calls/${callId}/accept`,
        REJECT: (callId: string) => `/api/calls/${callId}/reject`,
        END: (callId: string) => `/api/calls/${callId}/end`,
        HISTORY: '/api/calls/history',
    },

    // ─── AI bot ───────────────────────────────────────────────────────────────
    AI_CHAT: {
        GET_BOT: '/api/ai/bot',
        GET_CHAT: '/api/ai/chat',
        SEND_MESSAGE: '/api/ai/message',
    },

    // ─── Health ──────────────────────────────────────────────────────────────
    HEALTH: '/health',
} as const;
