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
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.response = {
        data: { message: 'Request timed out. Make sure the backend server is running on port 8000.' }
      };
    } else if (!error.response) {
      // Server is not running or network error
      error.response = {
        data: {
          message: 'Cannot connect to server. Start Laravel with:\n  cd LARAVEL-BACK-END && php artisan serve'
        }
      };
    } else if (error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
