import { Platform } from 'react-native';
import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

export interface User {
    _id: string;
    username: string;
    email: string;
    profilePic?: string;
    bio?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export interface GetAllUsersResponse {
    success: boolean;
    data: User[];
}

export interface UpdateProfileRequest {
    username?: string;
    bio?: string;
    profilePic?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface UploadProfilePicResponse {
    success: boolean;
    message: string;
    data: {
        profilePic: string;
    };
}

/**
 * Get all users (for contact sharing)
 */
export const getAllUsersApi = async (): Promise<GetAllUsersResponse> => {
    const { data } = await apiClient.get<GetAllUsersResponse>(ENDPOINTS.SEARCH.USERS, {
        params: { q: '' } // Empty query to get all users
    });
    return data;
};

/**
 * Update user profile details (username, bio)
 */
export const updateProfileApi = async (payload: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const { data } = await apiClient.put<UpdateProfileResponse>(ENDPOINTS.USERS.UPDATE_PROFILE, payload);
    return data;
};

export interface UpdatePrivacyRequest {
    lastSeen?: 'everyone' | 'contacts' | 'nobody';
    profilePhoto?: 'everyone' | 'contacts' | 'nobody';
}

export interface UpdatePrivacyResponse {
    success: boolean;
    message: string;
    data: User & {
        privacy?: {
            lastSeen: 'everyone' | 'contacts' | 'nobody';
            profilePhoto: 'everyone' | 'contacts' | 'nobody';
        };
    };
}

/**
 * Update user privacy settings
 */
export const updatePrivacyApi = async (payload: UpdatePrivacyRequest): Promise<UpdatePrivacyResponse> => {
    const { data } = await apiClient.put<UpdatePrivacyResponse>(ENDPOINTS.USERS.UPDATE_PRIVACY, payload);
    return data;
};

/**
 * Upload user profile picture
 */
export const uploadProfilePictureApi = async (imageUri: string): Promise<UploadProfilePicResponse> => {
    const formData = new FormData();
    
    // Normalize URI for React Native FormData file uploads
    const uri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    
    // Get file extension for mimetype
    const ext = filename.split('.').pop() || 'jpg';
    const type = `image/${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpeg'}`;
    
    formData.append('profilePic', {
        uri,
        name: filename,
        type,
    } as any);

    const { data } = await apiClient.post<UploadProfilePicResponse>('/api/users/profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export interface Contact {
    _id: string;
    username: string;
    profilePic?: string;
    customName?: string;
    isOnline: boolean;
    lastSeen?: string;
    isBlocked: boolean;
}

export interface GetContactsResponse {
    success: boolean;
    data: Contact[];
}

export interface AddContactResponse {
    success: boolean;
    message: string;
    data: any;
}

/**
 * Get user's contacts
 */
export const getContactsApi = async (): Promise<GetContactsResponse> => {
    const { data } = await apiClient.get<GetContactsResponse>(ENDPOINTS.USERS.GET_CONTACTS);
    return data;
};

/**
 * Add a contact
 */
export const addContactApi = async (payload: { contactId: string; customName?: string }): Promise<AddContactResponse> => {
    const { data } = await apiClient.post<AddContactResponse>(ENDPOINTS.USERS.ADD_CONTACT, payload);
    return data;
};

/**
 * Remove a contact
 */
export const removeContactApi = async (contactId: string): Promise<any> => {
    const { data } = await apiClient.delete<any>(ENDPOINTS.USERS.REMOVE_CONTACT(contactId));
    return data;
};
