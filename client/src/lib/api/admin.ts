import { apiClient } from './client';

export interface AdminStats {
  totalUsers: number;
  totalWords: number;
  totalSessions: number;
  activeToday: number;
}

export interface TopStudent {
  id: number;
  username: string;
  level: number;
  total_xp: number;
  words_learned: number;
  accuracy: number;
}

export interface UserManagement {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
  last_login?: string;
  level: number;
  total_xp: number;
}

export const adminApi = {
  getStats: () => apiClient<AdminStats>('/admin/stats'),

  getTopStudents: (limit = 10) =>
    apiClient<{ students: TopStudent[] }>(`/admin/top-students?limit=${limit}`),

  getUsers: (params?: { search?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());

    return apiClient<{ users: UserManagement[]; total: number }>(
      `/admin/users?${query.toString()}`
    );
  },

  updateUserAdmin: (userId: number, role: 'student' | 'admin') =>
    apiClient<{ message: string }>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  deleteUser: (userId: number) =>
    apiClient<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  resetUserPassword: (userId: number, password: string) =>
    apiClient<{ message: string }>(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getVocabulary: (params?: {
    search?: string;
    deck?: string;
    pos?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.deck) query.set('deck', params.deck);
    if (params?.pos) query.set('pos', params.pos);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());

    return apiClient<{
      words: Array<{
        id: number;
        word: string;
        part_of_speech: string;
        definition: string;
        example_sentence?: string;
        deck_name?: string;
      }>;
      total: number;
    }>(`/admin/vocabulary?${query.toString()}`);
  },

  createWord: (word: {
    word: string;
    part_of_speech: string;
    definition: string;
    example_sentence?: string;
    deck_name?: string;
  }) =>
    apiClient<{ id: number; message: string }>('/admin/vocabulary', {
      method: 'POST',
      body: JSON.stringify(word),
    }),

  updateWord: (
    id: number,
    word: {
      word?: string;
      part_of_speech?: string;
      definition?: string;
      example_sentence?: string;
      deck_name?: string;
    }
  ) =>
    apiClient<{ message: string }>(`/admin/vocabulary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(word),
    }),

  deleteWord: (id: number) =>
    apiClient<{ message: string }>(`/admin/vocabulary/${id}`, {
      method: 'DELETE',
    }),
};
