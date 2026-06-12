// src/stores/useAuthStore.ts
import { create } from 'zustand';
import type { User, AuthStatus } from '../types';
import { apiFetch } from '../utils/api';
import { useSystemStore } from './useSystemStore';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyEmail: (token?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, token: string, password?: string, passwordConfirmation?: string) => Promise<boolean>;
  updateProfile: (name: string, email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: (typeof window !== 'undefined' && localStorage.getItem('subly_token')) ? 'loading' : 'unauthenticated',

  login: async (email, password = 'password') => {
    try {
      const loginRes = await apiFetch<{ token: string; role: string }>('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      localStorage.setItem('subly_token', loginRes.token);

      // Fetch user profile info
      const meRes = await apiFetch<{ success: boolean; data: any }>('/auth/me');
      const userData = meRes.data;

      const loggedInUser: User = {
        id: Number(userData.id),
        name: userData.name,
        email: userData.email,
        role: userData.role === 'Client' ? 'Customer' : 'Admin',
        email_verified_at: userData.emailVerifiedAt,
        last_seen_at: userData.lastSeenAt,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt,
      };

      set({
        user: loggedInUser,
        status: 'loading',
      });

      // Synchronize role in system store
      useSystemStore.getState().setCurrentRole(loggedInUser.role);

      // Delay for 2.5 seconds to display the smooth logo outline animation
      await new Promise((resolve) => setTimeout(resolve, 2500));

      set({
        status: 'authenticated',
      });

      return true;
    } catch (error: any) {
      // Handle the unverified error case specifically to redirect the user to verification page
      if (error.status === 403 && error.data?.status === 'unverified') {
        set({
          user: {
            id: 0,
            name: email.split('@')[0],
            email: email,
            role: 'Customer',
            email_verified_at: null,
            last_seen_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          status: 'verifying'
        });
      }
      throw error;
    }
  },

  register: async (name, email, password = 'password') => {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: { name, email, password, password_confirmation: password }
    });

    set({
      user: {
        id: 0,
        name,
        email,
        role: 'Customer',
        email_verified_at: null,
        last_seen_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      status: 'verifying',
    });
    return true;
  },

  logout: async () => {
    localStorage.removeItem('subly_token');
    set({ user: null, status: 'unauthenticated' });
    useSystemStore.getState().setActiveTab('dashboard');
  },

  verifyEmail: async (token) => {
    const activeToken = token || new URLSearchParams(window.location.search).get('token');
    if (!activeToken) {
      throw new Error('Token verifikasi tidak ditemukan.');
    }

    await apiFetch(`/auth/verify-email?token=${encodeURIComponent(activeToken)}`, {
      method: 'GET'
    });

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    set((state) => {
      if (state.user) {
        return {
          user: {
            ...state.user,
            email_verified_at: new Date().toISOString(),
          },
          status: 'authenticated',
        };
      }
      return { status: 'unauthenticated' };
    });
  },

  forgotPassword: async (email) => {
    await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
    return true;
  },

  resetPassword: async (email, token, password = 'password', passwordConfirmation = 'password') => {
    await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      }
    });
    return true;
  },

  updateProfile: async (name, email) => {
    // Note: Backend does not expose a profile update endpoint currently.
    // We update local state to preserve visual change response.
    set((state) => {
      if (state.user) {
        return {
          user: {
            ...state.user,
            name,
            email,
            updated_at: new Date().toISOString(),
          },
        };
      }
      return {};
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('subly_token');
    if (!token) {
      set({ user: null, status: 'unauthenticated' });
      return;
    }

    try {
      const meRes = await apiFetch<{ success: boolean; data: any }>('/auth/me');
      const userData = meRes.data;

      const loggedInUser: User = {
        id: Number(userData.id),
        name: userData.name,
        email: userData.email,
        role: userData.role === 'Client' ? 'Customer' : 'Admin',
        email_verified_at: userData.emailVerifiedAt,
        last_seen_at: userData.lastSeenAt,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt,
      };

      set({
        user: loggedInUser,
        status: 'authenticated',
      });

      useSystemStore.getState().setCurrentRole(loggedInUser.role);
    } catch (error) {
      localStorage.removeItem('subly_token');
      set({ user: null, status: 'unauthenticated' });
    }
  },

  deleteAccount: async () => {
    await apiFetch('/auth/me', {
      method: 'DELETE'
    });
    localStorage.removeItem('subly_token');
    set({ user: null, status: 'unauthenticated' });
    useSystemStore.getState().setActiveTab('dashboard');
  }
}));
