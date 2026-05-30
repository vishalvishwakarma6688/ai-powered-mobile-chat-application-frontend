import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { GetMessagesResponse, Message } from '../api/message/messageApi';
import { GetChatsResponse } from '../api/chat/chatApi';
import { SOCKET_URL } from '../config/api.config';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinChat: (chatId: string) => void;
    leaveChat: (chatId: string) => void;
    sendTypingStart: (chatId: string) => void;
    sendTypingStop: (chatId: string) => void;
    typingUsers: Map<string, Set<string>>; // chatId -> Set of userIds typing
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    joinChat: () => { },
    leaveChat: () => { },
    sendTypingStart: () => { },
    sendTypingStop: () => { },
    typingUsers: new Map(),
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
    const { token, user } = useAuthStore();
    const queryClient = useQueryClient();
    const currentChatRef = useRef<string | null>(null);

    useEffect(() => {
        if (!token || !user) {
            // Disconnect if no auth
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection events
        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            console.log(`👤 User: ${user?.username} (${user?._id})`);
            console.log(`🏠 Joined personal room: user:${user?._id}`);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);

            // Handle authentication errors (token expired/invalid)
            if (error.message.includes('Authentication error') || error.message.includes('Invalid token') || error.message.includes('Token expired')) {
                console.log('🔒 Socket authentication failed, logging out user...');

                // Import router dynamically
                import('expo-router').then(({ router }) => {
                    // Clear auth state
                    useAuthStore.getState().logout();

                    // Redirect to login
                    router.replace('/login?expired=true');
                });
            }

            setIsConnected(false);
        });

        // Message events
        newSocket.on('message:new', (message: Message) => {
            console.log('📨 New message received:', {
                messageId: message._id,
                chatId: message.chatId,
                sender: message.sender.username,
                text: message.text?.substring(0, 50),
                currentUser: user?.username
            });

            // Update messages cache if it exists
            const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', message.chatId, 1]);

            if (messagesData) {
                console.log(`📦 Messages cache exists for chat ${message.chatId}, current count: ${messagesData.data.length}`);

                // Check if this exact message already exists by real ID
                const messageExists = messagesData.data.some(m => m._id === message._id);

                if (!messageExists) {
                    console.log(`✅ Message ${message._id} is new, adding to cache`);

                    // For sender: Remove temp messages from current user
                    // For recipient: Just add the new message (no temp messages to remove)
                    const filteredMessages = messagesData.data.filter(m =>
                        !(m._id.startsWith('temp-') && m.sender._id === user._id)
                    );

                    const removedCount = messagesData.data.length - filteredMessages.length;
                    if (removedCount > 0) {
                        console.log(`🗑️ Removed ${removedCount} temp message(s)`);
                    }

                    // Add real message at the beginning (backend returns DESC order)
                    queryClient.setQueryData<GetMessagesResponse>(
                        ['messages', message.chatId, 1],
                        {
                            ...messagesData,
                            data: [message, ...filteredMessages],
                        }
                    );
                    console.log(`✅ Message added to cache. New count: ${filteredMessages.length + 1}`);
                } else {
                    console.log(`⚠️ Message ${message._id} already exists in cache, skipping`);
                }
            } else {
                console.log(`⚠️ No messages cache found for chat ${message.chatId} - user hasn't opened this chat yet`);
            }

            // Auto-mark as delivered if message is from another user
            if (message.sender._id !== user._id) {
                console.log(`📬 Auto-marking message ${message._id} as delivered`);
                newSocket.emit('message:delivered', {
                    messageId: message._id,
                    senderId: message.sender._id,
                });

                // Auto-mark as read if user is viewing the chat
                if (currentChatRef.current === message.chatId) {
                    console.log(`👁️ User is viewing chat, auto-marking message ${message._id} as read`);
                    newSocket.emit('message:read', {
                        messageId: message._id,
                        senderId: message.sender._id,
                    });
                }
            }

            // Update chats list to refresh unread count and last message
            console.log(`🔄 Updating chats list for new message`);

            // Update chat list cache directly for instant feedback
            const chatsData = queryClient.getQueryData<GetChatsResponse>(['chats', 1, 20]);
            if (chatsData?.data) {
                const updatedChats = chatsData.data.map(chat => {
                    if (chat._id === message.chatId) {
                        // Generate friendly text for last message based on message type
                        let displayText = message.text || 'Media';

                        if (message.type === 'contact') {
                            try {
                                const contacts = JSON.parse(message.text || '[]');
                                const count = contacts.length;
                                if (count === 1) {
                                    displayText = `📇 ${contacts[0].name}`;
                                } else {
                                    displayText = `📇 ${count} contacts`;
                                }
                            } catch (error) {
                                displayText = '📇 Contact';
                            }
                        } else if (message.type === 'image') {
                            displayText = '📷 Photo';
                        } else if (message.type === 'video') {
                            displayText = '🎥 Video';
                        } else if (message.type === 'audio') {
                            displayText = '🎵 Audio';
                        } else if (message.type === 'file') {
                            displayText = '📄 Document';
                        } else if (message.type === 'location') {
                            displayText = '📍 Location';
                        }

                        // Update last message
                        const updatedChat = {
                            ...chat,
                            lastMessage: {
                                messageId: message._id,
                                text: displayText,
                                sender: message.sender,
                                createdAt: message.createdAt,
                            },
                            updatedAt: message.createdAt,
                        };

                        // Increment unread count only if message is from another user and user is not viewing the chat
                        if (message.sender._id !== user._id && currentChatRef.current !== message.chatId) {
                            updatedChat.unreadCount = (chat.unreadCount || 0) + 1;
                        }

                        return updatedChat;
                    }
                    return chat;
                });

                // Sort chats by updatedAt (most recent first)
                updatedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

                queryClient.setQueryData<GetChatsResponse>(['chats', 1, 20], {
                    ...chatsData,
                    data: updatedChats,
                });
                console.log(`✅ Chat list updated with new message`);
            } else {
                // If no cache, invalidate to fetch fresh data
                queryClient.invalidateQueries({ queryKey: ['chats'] });
            }
        });

        // Delivery receipt
        newSocket.on('message:delivered', (data: { messageId: string; deliveredBy: string; deliveredAt: Date }) => {
            console.log('✅ Message delivered:', data);

            // Update message in cache
            updateMessageStatus(data.messageId, 'delivered', data.deliveredBy, data.deliveredAt);
        });

        // Read receipt
        newSocket.on('message:read', (data: { messageId: string; readBy: string; readAt: Date }) => {
            console.log('👁️ Message read:', data);

            // Update message in cache
            updateMessageStatus(data.messageId, 'read', data.readBy, data.readAt);

            // Update chat list to decrement unread count if the reader is the current user
            if (data.readBy === user._id) {
                const chatsData = queryClient.getQueryData<GetChatsResponse>(['chats', 1, 20]);
                if (chatsData?.data) {
                    // Find which chat this message belongs to
                    const updatedChats = chatsData.data.map(chat => {
                        // Check if this message belongs to this chat
                        const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', chat._id, 1]);
                        if (messagesData) {
                            const messageExists = messagesData.data.some(m => m._id === data.messageId);
                            if (messageExists && chat.unreadCount && chat.unreadCount > 0) {
                                return { ...chat, unreadCount: Math.max(0, chat.unreadCount - 1) };
                            }
                        }
                        return chat;
                    });

                    queryClient.setQueryData<GetChatsResponse>(['chats', 1, 20], {
                        ...chatsData,
                        data: updatedChats,
                    });
                    console.log(`✅ Decremented unread count for message ${data.messageId}`);
                }
            }
        });

        // Reaction events
        newSocket.on('reaction:add', (data: { messageId: string; userId: string; emoji: string; chatId: string }) => {
            console.log('😊 Reaction added:', data);

            // Update message in cache
            const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', data.chatId, 1]);
            if (messagesData) {
                const updatedMessages = messagesData.data.map(msg => {
                    if (msg._id === data.messageId) {
                        const reactions = msg.reactions || [];
                        // Remove existing reaction from this user (if any)
                        const filteredReactions = reactions.filter(r => r.userId !== data.userId);
                        // Add new reaction
                        return {
                            ...msg,
                            reactions: [...filteredReactions, { userId: data.userId, emoji: data.emoji }],
                        };
                    }
                    return msg;
                });

                queryClient.setQueryData<GetMessagesResponse>(
                    ['messages', data.chatId, 1],
                    {
                        ...messagesData,
                        data: updatedMessages,
                    }
                );
                console.log(`✅ Reaction added to message ${data.messageId}`);
            }
        });

        newSocket.on('reaction:remove', (data: { messageId: string; userId: string; chatId: string }) => {
            console.log('😐 Reaction removed:', data);

            // Update message in cache
            const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', data.chatId, 1]);
            if (messagesData) {
                const updatedMessages = messagesData.data.map(msg => {
                    if (msg._id === data.messageId) {
                        const reactions = msg.reactions || [];
                        // Remove reaction from this user
                        return {
                            ...msg,
                            reactions: reactions.filter(r => r.userId !== data.userId),
                        };
                    }
                    return msg;
                });

                queryClient.setQueryData<GetMessagesResponse>(
                    ['messages', data.chatId, 1],
                    {
                        ...messagesData,
                        data: updatedMessages,
                    }
                );
                console.log(`✅ Reaction removed from message ${data.messageId}`);
            }
        });

        // Pin/Unpin events
        newSocket.on('message:pinned', (data: { messageId: string; pinnedBy: string; pinnedAt: Date; chatId: string }) => {
            console.log('📌 Message pinned:', data);

            // Update message in cache
            const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', data.chatId, 1]);
            if (messagesData) {
                const updatedMessages = messagesData.data.map(msg => {
                    if (msg._id === data.messageId) {
                        return {
                            ...msg,
                            isPinned: true,
                            pinnedBy: data.pinnedBy,
                            pinnedAt: data.pinnedAt.toString(),
                        };
                    }
                    return msg;
                });

                queryClient.setQueryData<GetMessagesResponse>(
                    ['messages', data.chatId, 1],
                    {
                        ...messagesData,
                        data: updatedMessages,
                    }
                );
                console.log(`✅ Message ${data.messageId} marked as pinned`);
            }

            // Invalidate pinned messages query
            queryClient.invalidateQueries({ queryKey: ['pinnedMessages', data.chatId] });
        });

        newSocket.on('message:unpinned', (data: { messageId: string; chatId: string }) => {
            console.log('📌 Message unpinned:', data);

            // Update message in cache
            const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', data.chatId, 1]);
            if (messagesData) {
                const updatedMessages = messagesData.data.map(msg => {
                    if (msg._id === data.messageId) {
                        return {
                            ...msg,
                            isPinned: false,
                            pinnedBy: undefined,
                            pinnedAt: undefined,
                        };
                    }
                    return msg;
                });

                queryClient.setQueryData<GetMessagesResponse>(
                    ['messages', data.chatId, 1],
                    {
                        ...messagesData,
                        data: updatedMessages,
                    }
                );
                console.log(`✅ Message ${data.messageId} marked as unpinned`);
            }

            // Invalidate pinned messages query
            queryClient.invalidateQueries({ queryKey: ['pinnedMessages', data.chatId] });
        });

        // Typing events
        newSocket.on('typing:start', (data: { chatId: string; userId: string; username: string }) => {
            console.log('⌨️ User typing:', data);
            setTypingUsers((prev) => {
                const newMap = new Map(prev);
                const chatTyping = newMap.get(data.chatId) || new Set();
                chatTyping.add(data.userId);
                newMap.set(data.chatId, chatTyping);
                return newMap;
            });
        });

        newSocket.on('typing:stop', (data: { chatId: string; userId: string }) => {
            console.log('⌨️ User stopped typing:', data);
            setTypingUsers((prev) => {
                const newMap = new Map(prev);
                const chatTyping = newMap.get(data.chatId);
                if (chatTyping) {
                    chatTyping.delete(data.userId);
                    if (chatTyping.size === 0) {
                        newMap.delete(data.chatId);
                    } else {
                        newMap.set(data.chatId, chatTyping);
                    }
                }
                return newMap;
            });
        });

        // Message deletion event
        newSocket.on('message:update', (data: { action: string; message: Message }) => {
            console.log('🔄 Message update received:', data);

            if (data.action === 'delete') {
                const deletedMessage = data.message;

                // Update message in cache
                const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', deletedMessage.chatId, 1]);
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === deletedMessage._id) {
                            return {
                                ...msg,
                                isDeleted: true,
                                text: 'This message was deleted',
                            };
                        }
                        return msg;
                    });

                    queryClient.setQueryData<GetMessagesResponse>(
                        ['messages', deletedMessage.chatId, 1],
                        {
                            ...messagesData,
                            data: updatedMessages,
                        }
                    );
                    console.log(`✅ Message ${deletedMessage._id} marked as deleted in cache`);
                }

                // Update chat list last message if this was the last message
                const chatsData = queryClient.getQueryData<GetChatsResponse>(['chats', 1, 20]);
                if (chatsData?.data) {
                    const updatedChats = chatsData.data.map(chat => {
                        if (chat._id === deletedMessage.chatId && chat.lastMessage?.messageId === deletedMessage._id) {
                            return {
                                ...chat,
                                lastMessage: {
                                    ...chat.lastMessage,
                                    text: 'This message was deleted',
                                },
                            };
                        }
                        return chat;
                    });

                    queryClient.setQueryData<GetChatsResponse>(['chats', 1, 20], {
                        ...chatsData,
                        data: updatedChats,
                    });
                    console.log(`✅ Chat list updated for deleted message`);
                }
            } else if (data.action === 'edit') {
                const editedMessage = data.message;

                // Update message in cache
                const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', editedMessage.chatId, 1]);
                if (messagesData) {
                    const updatedMessages = messagesData.data.map(msg => {
                        if (msg._id === editedMessage._id) {
                            return {
                                ...msg,
                                text: editedMessage.text,
                                isEdited: true,
                            };
                        }
                        return msg;
                    });

                    queryClient.setQueryData<GetMessagesResponse>(
                        ['messages', editedMessage.chatId, 1],
                        {
                            ...messagesData,
                            data: updatedMessages,
                        }
                    );
                    console.log(`✅ Message ${editedMessage._id} marked as edited in cache`);
                }

                // Update chat list last message if this was the last message
                const chatsData = queryClient.getQueryData<GetChatsResponse>(['chats', 1, 20]);
                if (chatsData?.data) {
                    const updatedChats = chatsData.data.map(chat => {
                        if (chat._id === editedMessage.chatId && chat.lastMessage?.messageId === editedMessage._id) {
                            return {
                                ...chat,
                                lastMessage: {
                                    ...chat.lastMessage,
                                    text: editedMessage.text,
                                },
                            };
                        }
                        return chat;
                    });

                    queryClient.setQueryData<GetChatsResponse>(['chats', 1, 20], {
                        ...chatsData,
                        data: updatedChats,
                    });
                    console.log(`✅ Chat list updated for edited message`);
                }
            }
        });

        // Presence events
        newSocket.on('presence:update', (data: { userId: string; isOnline: boolean; timestamp: Date }) => {
            console.log('👤 Presence update:', data);

            // Update chats list to reflect online status
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
            newSocket.disconnect();
        };
    }, [token, user, queryClient]);

    // Helper function to update message status in cache
    const updateMessageStatus = (messageId: string, status: 'delivered' | 'read', userId: string, timestamp: Date) => {
        // Find which chat this message belongs to
        const chatsData = queryClient.getQueryData<GetChatsResponse>(['chats', 1, 20]);
        if (!chatsData) return;

        for (const chat of chatsData.data) {
            const messagesData = queryClient.getQueryData<GetMessagesResponse>(['messages', chat._id, 1]);
            if (!messagesData) continue;

            const messageIndex = messagesData.data.findIndex(m => m._id === messageId);
            if (messageIndex !== -1) {
                const updatedMessages = [...messagesData.data];
                const message = { ...updatedMessages[messageIndex] };

                if (status === 'delivered') {
                    message.deliveredTo = message.deliveredTo || [];
                    if (!message.deliveredTo.some(d => d.userId === userId)) {
                        message.deliveredTo.push({ userId, deliveredAt: timestamp.toString() });
                    }
                } else if (status === 'read') {
                    message.readBy = message.readBy || [];
                    if (!message.readBy.some(r => r.userId === userId)) {
                        message.readBy.push({ userId, readAt: timestamp.toString() });
                    }
                    // Also ensure it's in deliveredTo
                    message.deliveredTo = message.deliveredTo || [];
                    if (!message.deliveredTo.some(d => d.userId === userId)) {
                        message.deliveredTo.push({ userId, deliveredAt: timestamp.toString() });
                    }
                }

                updatedMessages[messageIndex] = message;

                queryClient.setQueryData<GetMessagesResponse>(
                    ['messages', chat._id, 1],
                    {
                        ...messagesData,
                        data: updatedMessages,
                    }
                );
                break;
            }
        }
    };

    // Socket actions
    const joinChat = (chatId: string) => {
        if (socket && isConnected) {
            socket.emit('join:chat', chatId);
            currentChatRef.current = chatId;
            console.log('🚪 Joined chat:', chatId);
        }
    };

    const leaveChat = (chatId: string) => {
        if (socket && isConnected) {
            socket.emit('leave:chat', chatId);
            if (currentChatRef.current === chatId) {
                currentChatRef.current = null;
            }
            console.log('🚪 Left chat:', chatId);
        }
    };

    const sendTypingStart = (chatId: string) => {
        if (socket && isConnected) {
            socket.emit('typing:start', { chatId });
        }
    };

    const sendTypingStop = (chatId: string) => {
        if (socket && isConnected) {
            socket.emit('typing:stop', { chatId });
        }
    };

    const value: SocketContextType = {
        socket,
        isConnected,
        joinChat,
        leaveChat,
        sendTypingStart,
        sendTypingStop,
        typingUsers,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
