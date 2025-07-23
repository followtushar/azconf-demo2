import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@timecap/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      login: async (email: string, password: string) => {
        try {
          const response = await authApi.login({ email, password });
          const { user, tokens } = response.data;
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          await authApi.register(data);
          // Don't auto-login after registration, require email verification
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        try {
          const { tokens } = get();
          if (tokens?.accessToken) {
            await authApi.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      refreshToken: async () => {
        try {
          const { tokens } = get();
          if (!tokens?.refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authApi.refreshToken(tokens.refreshToken);
          const newTokens = response.data;
          
          set({ tokens: newTokens });
        } catch (error) {
          get().clearAuth();
          throw error;
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (tokens: AuthTokens) => {
        set({ tokens });
      },

      initializeAuth: async () => {
        try {
          const { tokens } = get();
          
          if (!tokens?.accessToken) {
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          // Try to get current user to validate token
          const response = await authApi.getCurrentUser();
          const user = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // If token is invalid, try to refresh
          try {
            await get().refreshToken();
            // Retry getting user
            const response = await authApi.getCurrentUser();
            const user = response.data;
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (refreshError) {
            get().clearAuth();
          }
        }
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'timecap-auth',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
      }),
    }
  )
);