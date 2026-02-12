import { apiClient } from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'admin';
  level: number;
  totalXp: number;
  dailyStreak: number;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username?: string; // Optional, not used by backend
  email: string;
  password: string;
}

export const authApi = {
  checkSession: () => apiClient<{ user: User }>('/auth/me'),
  
  login: (credentials: LoginCredentials) =>
    apiClient<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: RegisterData) =>
    apiClient<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
};
