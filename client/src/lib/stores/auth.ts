import { writable, derived } from 'svelte/store';
import { authApi, type User } from '$lib/api/auth';
import type { APIError } from '$lib/api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  return {
    subscribe,

    async checkSession() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const { user } = await authApi.checkSession();
        set({ user, isLoading: false, error: null });
        return user;
      } catch (err) {
        const error = err as APIError;
        if (error.status === 401) {
          // Not logged in - this is expected
          set({ user: null, isLoading: false, error: null });
        } else if (error.status === 429) {
          // Rate limited - don't clear user! Just stop loading
          update((state) => ({ ...state, isLoading: false, error: error.message }));
        } else {
          set({ user: null, isLoading: false, error: error.message });
        }
        return null;
      }
    },

    async login(email: string, password: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const { user } = await authApi.login({ email, password });
        set({ user, isLoading: false, error: null });
        return { success: true, user };
      } catch (err) {
        const error = err as APIError;
        set({ user: null, isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
    },

    async register(email: string, password: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const { user } = await authApi.register({ email, password });
        set({ user, isLoading: false, error: null });
        return { success: true, user };
      } catch (err) {
        const error = err as APIError;
        set({ user: null, isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
    },

    async logout() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        await authApi.logout();
        set({ user: null, isLoading: false, error: null });
        return { success: true };
      } catch (err) {
        const error = err as APIError;
        // Even if logout fails, clear local state
        set({ user: null, isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const auth = createAuthStore();

// Derived stores for convenience
export const user = derived(auth, ($auth) => $auth.user);
export const isAuthenticated = derived(auth, ($auth) => $auth.user !== null);
export const isAdmin = derived(auth, ($auth) => $auth.user?.role === 'admin');
export const gamification = derived(auth, ($auth) => ({
  level: $auth.user?.level || 1,
  totalXp: $auth.user?.totalXp || 0,
  dailyStreak: $auth.user?.dailyStreak || 0,
}));
