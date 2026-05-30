import { apiClient } from '../client';
import { ENDPOINTS } from '../../constants/endpoints';

// ─── Request / Response types ─────────────────────────────────────────────────

export interface RegisterPayload {
    username: string;
    email: string;
    phone: string;
    password: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface AuthUser {
    _id: string;
    username: string;
    email: string;
    phone: string;
    profilePic: string | null;
    bio: string;
    isOnline: boolean;
    lastSeen: string;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: AuthUser;
        token: string;
    };
}

// ─── API functions ────────────────────────────────────────────────────────────

export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload);
    return data;
};

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
    return data;
};
