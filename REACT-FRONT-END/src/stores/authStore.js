/**
 * Zustand auth store — single source of truth for authentication state.
 *
 * Persists token and user to localStorage so the session survives page refresh.
 * The Axios interceptor reads auth_token from localStorage directly, so this
 * store is the React-side state layer on top of that.
 */

import { create } from 'zustand';
import api from '../lib/axios';

const useAuthStore = create((set) => ({
  // ── State ────────────────────────────────────────────────────────────────
  user:            JSON.parse(localStorage.getItem('auth_user') || 'null'),
  token:           localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading:       false,
  error:           null,

  // Preloader state — shown on login and logout
  preloader: null, // null | { portal, userName }

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * login — POST /auth/login, store token + user, show preloader, redirect.
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', credentials);
      const { user, token } = data.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      // Show preloader before navigating
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        preloader: { portal: user.portal, userName: user.first_name || user.full_name?.split(' ')[0] || '' },
      });

      return { portal: user.portal };
    } catch (err) {
      // Extract meaningful error message
      let message = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        // Server returned an error message (e.g., "Invalid credentials")
        message = err.response.data.message;
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        message = 'Server is taking too long to respond. Please try again — it may be waking up.';
      } else if (!err.response) {
        // Network error - server not reachable
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * logout — show logout preloader, then clear state.
   */
  logout: async () => {
    // Show logout preloader immediately
    set({ preloader: { portal: 'logout', userName: '' } });

    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, isAuthenticated: false, error: null });
      // preloader stays visible — caller dismisses it after navigation
    }
  },

  /**
   * clearPreloader — dismiss the preloader after navigation completes.
   */
  clearPreloader: () => set({ preloader: null }),

  /**
   * setUser — update user in state and localStorage.
   */
  setUser: (user) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user });
  },

  /**
   * clearError — reset the error state.
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
