import { apiClient } from '../client';

export interface Chat {
    _id: string;
    isGroup: boolean;
    name?: string;
    description?: string;
    groupIcon?: string;
    participants: Array<{
        userId: {
            _id: string;
            username: string;
            profilePic?: string;
            isOnline: boolean;
            lastSeen?: string;
        };
        role: string;
        joinedAt: string;
        isMuted: boolean;
    }>;
    lastMessage?: {
        text?: string; // Backend uses 'text'
        content?: string; // Fallback for compatibility
        sender: {
            _id: string;
            username: string;
            profilePic?: string;
        };
        createdAt: string;
    };
    unreadCount?: number; // Unread message count for this chat
    createdAt: string;
    updatedAt: string;
}

export interface GetChatsResponse {
    success: boolean;
    data: Chat[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetChatResponse {
    success: boolean;
    data: Chat;
}

export interface CreateChatResponse {
    success: boolean;
    message: string;
    data: Chat;
}

/**
 * Get user's chats with pagination
 */
export const getUserChats = async (page: number = 1, limit: number = 20): Promise<GetChatsResponse> => {
    try {
        console.log(`📡 Fetching chats: page=${page}, limit=${limit}`);
        const response = await apiClient.get<GetChatsResponse>('/api/chats', {
            params: { page, limit }
        });
        console.log(`✅ Chats fetched successfully:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch chats:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        throw error;
    }
};

/**
 * Get single chat by ID
 */
export const getChatById = async (chatId: string): Promise<GetChatResponse> => {
    try {
        console.log(`📡 Fetching chat details: ${chatId}`);
        const response = await apiClient.get<GetChatResponse>(`/api/chats/${chatId}`);
        console.log(`✅ Chat details fetched successfully:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch chat details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        throw error;
    }
};

/**
 * Create one-on-one chat
 */
export const createOneOnOneChat = async (userId: string): Promise<CreateChatResponse> => {
    try {
        console.log(`📡 Creating chat with user: ${userId}`);
        const response = await apiClient.post<CreateChatResponse>('/api/chats/one-on-one', {
            userId
        });
        console.log(`✅ Chat created successfully:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create chat:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        throw error;
    }
};

/**
 * Create group chat
 */
export const createGroupChat = async (name: string, description: string, participantIds: string[]): Promise<CreateChatResponse> => {
    try {
        console.log(`📡 Creating group chat: ${name}`);
        const response = await apiClient.post<CreateChatResponse>('/api/chats/group', {
            name,
            description,
            participantIds
        });
        console.log(`✅ Group chat created successfully:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create group chat:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        throw error;
    }
};

/**
 * Mute/unmute chat
 */
export const muteChat = async (chatId: string, isMuted: boolean): Promise<GetChatResponse> => {
    try {
        console.log(`📡 ${isMuted ? 'Muting' : 'Unmuting'} chat: ${chatId}`);
        const response = await apiClient.put<GetChatResponse>(`/api/chats/${chatId}/mute`, {
            isMuted
        });
        console.log(`✅ Chat ${isMuted ? 'muted' : 'unmuted'} successfully`);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Failed to ${isMuted ? 'mute' : 'unmute'} chat:`, error);
        throw error;
    }
};

/**
 * Add participant to group chat
 */
export const addParticipantToGroup = async (chatId: string, userId: string): Promise<GetChatResponse> => {
    try {
        console.log(`📡 Adding participant ${userId} to group: ${chatId}`);
        const response = await apiClient.post<GetChatResponse>(`/api/chats/${chatId}/participants`, {
            userId
        });
        console.log(`✅ Participant added successfully`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to add participant:', error);
        throw error;
    }
};

/**
 * Remove participant from group chat
 */
export const removeParticipantFromGroup = async (chatId: string, userId: string): Promise<GetChatResponse> => {
    try {
        console.log(`📡 [REMOVE PARTICIPANT] Starting request`);
        console.log(`   Chat ID: ${chatId}`);
        console.log(`   User ID to remove: ${userId}`);
        console.log(`   URL: DELETE /api/chats/${chatId}/participants/${userId}`);

        const response = await apiClient.delete<GetChatResponse>(`/api/chats/${chatId}/participants/${userId}`);

        console.log(`✅ [REMOVE PARTICIPANT] Success`);
        console.log(`   Response status: ${response.status}`);
        console.log(`   Updated participants count: ${response.data.data.participants.length}`);
        console.log(`   Response data:`, JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error: any) {
        console.error('❌ [REMOVE PARTICIPANT] Failed');
        console.error('   Error message:', error.message);
        console.error('   Error response:', error.response?.data);
        console.error('   Error status:', error.response?.status);
        throw error;
    }
};

/**
 * Update group details (name, icon)
 */
export const updateGroupDetails = async (
    chatId: string,
    updates: { name?: string; description?: string; groupIcon?: string }
): Promise<GetChatResponse> => {
    try {
        console.log(`📡 Updating group details: ${chatId}`);
        const response = await apiClient.put<GetChatResponse>(`/api/chats/${chatId}`, updates);
        console.log(`✅ Group details updated successfully`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to update group details:', error);
        throw error;
    }
};

/**
 * Upload group icon
 */
export const uploadGroupIcon = async (chatId: string, imageUri: string): Promise<GetChatResponse> => {
    try {
        console.log(`📡 Uploading group icon: ${chatId}`);

        // Create form data
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'group-icon.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('icon', {
            uri: imageUri,
            name: filename,
            type,
        } as any);

        const response = await apiClient.post<GetChatResponse>(`/api/chats/${chatId}/icon`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log(`✅ Group icon uploaded successfully`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to upload group icon:', error);
        throw error;
    }
};

/**
 * Promote member to admin
 */
export const promoteToAdmin = async (chatId: string, userId: string): Promise<GetChatResponse> => {
    try {
        console.log(`📡 Promoting user ${userId} to admin in group: ${chatId}`);
        const response = await apiClient.put<GetChatResponse>(`/api/chats/${chatId}/participants/${userId}/promote`);
        console.log(`✅ User promoted to admin successfully`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to promote user:', error);
        throw error;
    }
};

/**
 * Leave group chat
 */
export const leaveGroupChat = async (chatId: string): Promise<{ success: boolean; message: string; data?: Chat }> => {
    try {
        console.log(`📡 Leaving group: ${chatId}`);
        const response = await apiClient.post<{ success: boolean; message: string; data?: Chat }>(
            `/api/chats/${chatId}/leave`
        );
        console.log(`✅ Left group successfully`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to leave group:', error);
        throw error;
    }
};

/**
 * Update disappearing messages settings
 */
export const updateDisappearingMessages = async (
    chatId: string,
    enabled: boolean,
    time?: number
): Promise<GetChatResponse> => {
    try {
        console.log(`📡 Updating disappearing messages for chat: ${chatId}`);
        const response = await apiClient.put<GetChatResponse>(`/api/chats/${chatId}/disappearing-messages`, {
            enabled,
            time
        });
        console.log(`✅ Disappearing messages updated successfully`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to update disappearing messages:', error);
        throw error;
    }
};
