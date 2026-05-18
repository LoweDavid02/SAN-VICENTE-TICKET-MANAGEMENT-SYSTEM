/**
 * Axios instance pre-configured for the Laravel API.
 *
 * Bearer token auth — no cookies, no CSRF needed.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 30000,  // 30s — Laravel cold start on first request can be slow
  headers: {
    Accept: 'application/json',
    // Don't set Content-Type here - let it be set per request
  },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set Content-Type based on data type
    if (config.data instanceof FormData) {
      // For FormData, don't set Content-Type - browser will set it with boundary
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      // For other requests, default to JSON
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────────────────────
// We use a lazy getter for the auth store to avoid circular imports.
// The store module is loaded on first 401, not at module init time.
let _authStore = null;
const getAuthStore = () => {
  if (!_authStore) {
    // Dynamic require — safe because this only runs in browser after full init
    try { _authStore = require('../stores/authStore').default; } catch { /* ignore */ }
  }
  return _authStore;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Clear Zustand store state so ProtectedRoute redirects immediately
      const store = getAuthStore();
      if (store?.setState) {
        store.setState({ user: null, token: null, isAuthenticated: false, preloader: null });
      }

      // Redirect to login if not already there
      const isLoginPage = window.location.pathname === '/login'
        || window.location.pathname === '/';
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
