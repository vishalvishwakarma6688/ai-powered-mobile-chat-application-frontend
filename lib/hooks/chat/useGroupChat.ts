import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createGroupChat,
    addParticipantToGroup,
    removeParticipantFromGroup,
    updateGroupDetails,
    promoteToAdmin,
    leaveGroupChat,
    updateDisappearingMessages,
    uploadGroupIcon,
} from '../../api/chat/chatApi';

/**
 * Hook for creating a group chat
 */
export const useCreateGroupChat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, description, participantIds }: { name: string; description: string; participantIds: string[] }) =>
            createGroupChat(name, description, participantIds),
        onSuccess: () => {
            // Invalidate chats query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
    });
};

/**
 * Hook for adding a participant to a group
 */
export const useAddParticipant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) =>
            addParticipantToGroup(chatId, userId),
        onSuccess: (response, variables) => {
            // Update chats list with new data
            queryClient.setQueryData(['chats'], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((chat: any) =>
                        chat._id === variables.chatId ? response.data : chat
                    ),
                };
            });
        },
    });
};

/**
 * Hook for removing a participant from a group
 */
export const useRemoveParticipant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) => {
            console.log(`🔧 [HOOK] useRemoveParticipant called`);
            console.log(`   Chat ID: ${chatId}`);
            console.log(`   User ID: ${userId}`);
            return removeParticipantFromGroup(chatId, userId);
        },
        onSuccess: (response, variables) => {
            console.log(`✅ [HOOK] Remove participant mutation succeeded`);
            console.log(`   Response:`, response);
            console.log(`   Variables:`, variables);

            // Update chats list with new data
            queryClient.setQueryData(['chats'], (oldData: any) => {
                console.log(`🔄 [HOOK] Updating query cache`);
                console.log(`   Old data:`, oldData);

                if (!oldData) {
                    console.log(`⚠️ [HOOK] No old data in cache`);
                    return oldData;
                }

                const newData = {
                    ...oldData,
                    data: oldData.data.map((chat: any) =>
                        chat._id === variables.chatId ? response.data : chat
                    ),
                };

                console.log(`✅ [HOOK] Cache updated with new data`);
                console.log(`   New data:`, newData);

                return newData;
            });
        },
        onError: (error, variables) => {
            console.error(`❌ [HOOK] Remove participant mutation failed`);
            console.error(`   Error:`, error);
            console.error(`   Variables:`, variables);
        },
    });
};

/**
 * Hook for updating group details
 */
export const useUpdateGroupDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            chatId,
            updates,
        }: {
            chatId: string;
            updates: { name?: string; description?: string; groupIcon?: string };
        }) => updateGroupDetails(chatId, updates),
        onSuccess: (response, variables) => {
            // Update chats list with new data
            queryClient.setQueryData(['chats'], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((chat: any) =>
                        chat._id === variables.chatId ? response.data : chat
                    ),
                };
            });
        },
    });
};

/**
 * Hook for uploading group icon
 */
export const useUploadGroupIcon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, imageUri }: { chatId: string; imageUri: string }) =>
            uploadGroupIcon(chatId, imageUri),
        onSuccess: (response, variables) => {
            // Update chats list with new data
            queryClient.setQueryData(['chats'], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((chat: any) =>
                        chat._id === variables.chatId ? response.data : chat
                    ),
                };
            });
        },
    });
};

/**
 * Hook for promoting a member to admin
 */
export const usePromoteToAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) =>
            promoteToAdmin(chatId, userId),
        onSuccess: (response, variables) => {
            // Update chats list with new data
            queryClient.setQueryData(['chats'], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((chat: any) =>
                        chat._id === variables.chatId ? response.data : chat
                    ),
                };
            });
        },
    });
};

/**
 * Hook for leaving a group chat
 */
export const useLeaveGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (chatId: string) => leaveGroupChat(chatId),
        onSuccess: () => {
            // Invalidate chats list
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
    });
};

/**
 * Hook for updating disappearing messages settings
 */
export const useUpdateDisappearingMessages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            chatId,
            enabled,
            time,
        }: {
            chatId: string;
            enabled: boolean;
            time?: number;
        }) => updateDisappearingMessages(chatId, enabled, time),
        onSuccess: (_, variables) => {
            // Invalidate specific chat query
            queryClient.invalidateQueries({ queryKey: ['chat', variables.chatId] });
        },
    });
};
