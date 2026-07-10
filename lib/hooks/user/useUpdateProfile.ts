import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { 
    updateProfileApi, 
    uploadProfilePictureApi, 
    updatePrivacyApi,
    UpdateProfileRequest, 
    UpdateProfileResponse, 
    UploadProfilePicResponse,
    UpdatePrivacyRequest,
    UpdatePrivacyResponse
} from '../../api/user/userApi';
import { useAuthStore } from '../../store/authStore';

/**
 * Hook for updating user profile details (username, bio)
 */
export const useUpdateProfile = (
    options?: Omit<UseMutationOptions<UpdateProfileResponse, Error, UpdateProfileRequest>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: updateProfileApi,
        onSuccess: async (response) => {
            const currentUser = useAuthStore.getState().user;
            const currentToken = useAuthStore.getState().token;
            if (currentUser && currentToken && response.data) {
                // Merge current user details with backend updates
                const updatedUser = {
                    ...currentUser,
                    username: response.data.username || currentUser.username,
                    bio: response.data.bio !== undefined ? response.data.bio : currentUser.bio,
                    profilePic: response.data.profilePic || currentUser.profilePic,
                };
                await useAuthStore.getState().setAuth(updatedUser, currentToken);
            }
        },
        ...options,
    });
};

/**
 * Hook for uploading user profile picture
 */
export const useUploadProfilePicture = (
    options?: Omit<UseMutationOptions<UploadProfilePicResponse, Error, string>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: uploadProfilePictureApi,
        onSuccess: async (response) => {
            const currentUser = useAuthStore.getState().user;
            const currentToken = useAuthStore.getState().token;
            if (currentUser && currentToken && response.data?.profilePic) {
                // Update profilePic in Zustand store
                const updatedUser = {
                    ...currentUser,
                    profilePic: response.data.profilePic,
                };
                await useAuthStore.getState().setAuth(updatedUser, currentToken);
            }
        },
        ...options,
    });
};

/**
 * Hook for updating user privacy settings (lastSeen, profilePhoto)
 */
export const useUpdatePrivacy = (
    options?: Omit<UseMutationOptions<UpdatePrivacyResponse, Error, UpdatePrivacyRequest>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: updatePrivacyApi,
        onSuccess: async (response) => {
            const currentUser = useAuthStore.getState().user;
            const currentToken = useAuthStore.getState().token;
            if (currentUser && currentToken && response.data) {
                // Merge current user details with backend privacy updates
                const updatedUser = {
                    ...currentUser,
                    privacy: response.data.privacy || currentUser.privacy,
                };
                await useAuthStore.getState().setAuth(updatedUser as any, currentToken);
            }
        },
        ...options,
    });
};
