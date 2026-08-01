import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Chat } from '../api/chat/chatApi';
import { Message } from '../api/message/messageApi';

// Open synchronous SQLite database on native platforms
let db: SQLite.SQLiteDatabase | null = null;

if (Platform.OS !== 'web') {
    try {
        db = SQLite.openDatabaseSync('chatapp.db');
        console.log('✅ [SQLITE DB] Opened chatapp.db on device');
    } catch (e) {
        console.error('❌ [SQLITE DB] Failed to open database:', e);
    }
}

/**
 * Initialize SQLite tables & indexes
 */
export const initDatabase = () => {
    if (!db) return;

    try {
        db.execSync(`
            PRAGMA journal_mode = WAL;
            
            -- Chats Table
            CREATE TABLE IF NOT EXISTS chats (
                id TEXT PRIMARY KEY,
                is_group INTEGER DEFAULT 0,
                name TEXT,
                last_message_text TEXT,
                updated_at TEXT
            );

            -- Messages Table
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                chat_id TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                sender_name TEXT,
                sender_profile_pic TEXT,
                text TEXT,
                type TEXT DEFAULT 'text',
                status TEXT DEFAULT 'sent',
                created_at TEXT NOT NULL
            );

            -- Fast Index for <1ms WhatsApp-style message queries
            CREATE INDEX IF NOT EXISTS idx_messages_chat_time ON messages(chat_id, created_at DESC);

            -- Offline Outbox Queue Table
            CREATE TABLE IF NOT EXISTS outbox (
                id TEXT PRIMARY KEY,
                chat_id TEXT NOT NULL,
                text TEXT NOT NULL,
                type TEXT DEFAULT 'text',
                created_at TEXT NOT NULL
            );
        `);
        console.log('✅ [SQLITE DB] Tables & indexes initialized');
    } catch (e) {
        console.error('❌ [SQLITE DB] Failed to initialize tables:', e);
    }
};

/**
 * Save array of chats into local SQLite database
 */
export const dbSaveChats = (chats: Chat[]) => {
    if (!db || chats.length === 0) return;

    try {
        db.withTransactionSync(() => {
            const statement = db!.prepareSync(`
                INSERT OR REPLACE INTO chats (id, is_group, name, last_message_text, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `);

            for (const chat of chats) {
                statement.executeSync([
                    chat._id,
                    chat.isGroup ? 1 : 0,
                    chat.name || '',
                    chat.lastMessage?.text || '',
                    chat.updatedAt || chat.createdAt || new Date().toISOString(),
                ]);
            }
            statement.finalizeSync();
        });
        console.log(`✅ [SQLITE DB] Cached ${chats.length} chats in SQLite`);
    } catch (e) {
        console.error('❌ [SQLITE DB] Error saving chats:', e);
    }
};

/**
 * Get chats from local SQLite database
 */
export const dbGetChats = (): Partial<Chat>[] => {
    if (!db) return [];

    try {
        const rows = db.getAllSync<any>(`
            SELECT * FROM chats ORDER BY updated_at DESC
        `);

        return rows.map((row) => ({
            _id: row.id,
            isGroup: row.is_group === 1,
            name: row.name,
            lastMessage: row.last_message_text ? { text: row.last_message_text } as any : undefined,
            updatedAt: row.updated_at,
        }));
    } catch (e) {
        console.error('❌ [SQLITE DB] Error fetching chats:', e);
        return [];
    }
};

/**
 * Save messages for a chat into local SQLite database
 */
export const dbSaveMessages = (chatId: string, messages: Message[]) => {
    if (!db || messages.length === 0) return;

    try {
        db.withTransactionSync(() => {
            const statement = db!.prepareSync(`
                INSERT OR REPLACE INTO messages (id, chat_id, sender_id, sender_name, sender_profile_pic, text, type, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const msg of messages) {
                statement.executeSync([
                    msg._id,
                    chatId,
                    msg.sender?._id || '',
                    msg.sender?.username || '',
                    msg.sender?.profilePic || '',
                    msg.text || '',
                    msg.type || 'text',
                    'sent',
                    msg.createdAt || new Date().toISOString(),
                ]);
            }
            statement.finalizeSync();
        });
        console.log(`✅ [SQLITE DB] Cached ${messages.length} messages for chat ${chatId}`);
    } catch (e) {
        console.error('❌ [SQLITE DB] Error saving messages:', e);
    }
};

/**
 * Query messages from local SQLite database in <1ms
 */
export const dbGetMessages = (chatId: string, limit = 50, offset = 0): Message[] => {
    if (!db) return [];

    try {
        const rows = db.getAllSync<any>(`
            SELECT * FROM messages 
            WHERE chat_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [chatId, limit, offset]);

        return rows.map((row) => ({
            _id: row.id,
            chatId: row.chat_id,
            sender: {
                _id: row.sender_id,
                username: row.sender_name || 'User',
                profilePic: row.sender_profile_pic || null,
            },
            text: row.text,
            type: row.type || 'text',
            createdAt: row.created_at,
            updatedAt: row.created_at,
            isEdited: false,
            isDeleted: false,
        }));
    } catch (e) {
        console.error('❌ [SQLITE DB] Error fetching messages:', e);
        return [];
    }
};

/**
 * Save pending message to SQLite outbox
 */
export const dbQueueOutbox = (id: string, chatId: string, text: string, type = 'text') => {
    if (!db) return;

    try {
        db.runSync(`
            INSERT OR REPLACE INTO outbox (id, chat_id, text, type, created_at)
            VALUES (?, ?, ?, ?, ?)
        `, [id, chatId, text, type, new Date().toISOString()]);
        console.log(`✅ [SQLITE OUTBOX] Queued message ${id}`);
    } catch (e) {
        console.error('❌ [SQLITE OUTBOX] Error queueing message:', e);
    }
};

/**
 * Get pending outbox messages from SQLite
 */
export const dbGetOutbox = (): any[] => {
    if (!db) return [];

    try {
        return db.getAllSync(`SELECT * FROM outbox ORDER BY created_at ASC`);
    } catch (e) {
        console.error('❌ [SQLITE OUTBOX] Error fetching outbox:', e);
        return [];
    }
};

/**
 * Clear message from SQLite outbox after successful sync
 */
export const dbClearOutboxItem = (id: string) => {
    if (!db) return;

    try {
        db.runSync(`DELETE FROM outbox WHERE id = ?`, [id]);
        console.log(`✅ [SQLITE OUTBOX] Cleared item ${id}`);
    } catch (e) {
        console.error('❌ [SQLITE OUTBOX] Error clearing item:', e);
    }
};
