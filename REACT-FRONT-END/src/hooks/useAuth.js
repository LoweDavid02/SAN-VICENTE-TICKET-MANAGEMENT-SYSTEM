/**
 * React Query hooks for auth endpoints.
 *
 * useLogin    — useMutation wrapping POST /auth/login
 * useLogout   — useMutation wrapping POST /auth/logout
 * useMe       — useQuery wrapping GET /auth/me (only runs when authenticated)
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import useAuthStore from '../stores/authStore';

// ── Login ─────────────────────────────────────────────────────────────────
export function useLogin() {
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  return useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: ({ portal }) => {
      navigate(`/${portal}/dashboard`, { replace: true });
    },
  });
}

// ── Logout ────────────────────────────────────────────────────────────────
export function useLogout() {
  const { logout } = useAuthStore();
  const navigate   = useNavigate();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      navigate('/login', { replace: true });
    },
    onError: () => {
      // Force logout even if API call fails
      navigate('/login', { replace: true });
    },
  });
}

// ── Me (current user) ─────────────────────────────────────────────────────
export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
