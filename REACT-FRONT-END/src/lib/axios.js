/**
 * Axios instance pre-configured for the Laravel API.
 *
 * Uses 127.0.0.1 (not localhost) to avoid Windows IPv6 resolution delays.
 * Bearer token auth — no cookies, no CSRF needed.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 15000,           // 15 second timeout — prevents hanging requests
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - clear auth and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Let the calling code handle other errors with proper context
    return Promise.reject(error);
  }
);

export default api;
