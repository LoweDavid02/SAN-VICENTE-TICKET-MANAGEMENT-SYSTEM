/**
 * useTicketApi — React Query hooks for all ticket API endpoints.
 *
 * Polling intervals are staggered so queries don't all fire at the same time
 * (php artisan serve is single-threaded and queues concurrent requests).
 *
 * Intervals:
 *   Dashboard queries : 30s  (main data, not critical to be instant)
 *   Ticket lists      : 20s
 *   Tasks             : 25s
 *
 * Each hook also sets retry:3 and placeholderData:keepPreviousData so
 * temporary server slowness never shows the error state.
 */

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../lib/axios';
import useAuthStore from '../stores/authStore';

// ── Shared query options ──────────────────────────────────────────────────
const QUERY_OPTS = {
  retry:           2,
  retryDelay:      (attempt) => Math.min(1000 * (attempt + 1), 4000),
  placeholderData: keepPreviousData,
};

// ── Polling intervals — staggered using prime numbers to prevent thundering herd ────────
const POLL = {
  dashboard: 61_000,  // 61s (prime)
  tickets:   47_000,  // 47s (prime)
  tasks:     53_000,  // 53s (prime)
};

// ── Query keys ────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  adminDashboard:    ['admin', 'dashboard'],
  adminTickets:      ['admin', 'tickets'],
  adminPersonnel:    ['admin', 'personnel'],
  personnelDashboard:['personnel', 'dashboard'],
  personnelTasks:    ['personnel', 'tasks'],
  profile:           (portal) => [portal, 'profile'],
};

// ── Admin hooks ───────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    ...QUERY_OPTS,
    queryKey: QUERY_KEYS.adminDashboard,
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    },
    refetchInterval: POLL.dashboard,
  });
}

export function useAdminTickets(filters = {}) {
  return useQuery({
    ...QUERY_OPTS,
    queryKey: [...QUERY_KEYS.adminTickets, filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/tickets', { params: filters });
      return data.data;
    },
    refetchInterval: POLL.tickets,
  });
}

export function useAdminPersonnel() {
  return useQuery({
    ...QUERY_OPTS,
    queryKey: QUERY_KEYS.adminPersonnel,
    queryFn: async () => {
      const { data } = await api.get('/admin/personnel');
      return data.data;
    },
    refetchInterval: false, // personnel list rarely changes — no polling
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, field_note }) =>
      api.patch(`/admin/tickets/${id}/status`, { status, field_note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['personnel'] });
    },
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, personnel_id, note }) =>
      api.post(`/admin/tickets/${id}/assign`, { personnel_id, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['personnel'] });
    },
  });
}

// ── Personnel hooks ───────────────────────────────────────────────────────

export function usePersonnelDashboard() {
  return useQuery({
    ...QUERY_OPTS,
    queryKey: QUERY_KEYS.personnelDashboard,
    queryFn: async () => {
      const { data } = await api.get('/personnel/dashboard');
      return data.data;
    },
    refetchInterval: POLL.dashboard,
  });
}

export function usePersonnelTasks(filters = {}) {
  return useQuery({
    ...QUERY_OPTS,
    queryKey: [...QUERY_KEYS.personnelTasks, filters],
    queryFn: async () => {
      const { data } = await api.get('/personnel/tasks', { params: filters });
      return data.data;
    },
    refetchInterval: POLL.tasks,
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, field_note }) =>
      api.patch(`/personnel/tasks/${id}/status`, { status, field_note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personnel'] });
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

// ── Profile hooks ─────────────────────────────────────────────────────────

export function useProfile(portal) {
  return useQuery({
    ...QUERY_OPTS,
    queryKey: QUERY_KEYS.profile(portal),
    queryFn: async () => {
      const { data } = await api.get(`/${portal}/profile`);
      return data.data;
    },
    enabled:         !!portal,
    refetchInterval: false, // profile doesn't need polling
  });
}

export function useUpdateProfile(portal) {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (profileData) => api.patch(`/${portal}/profile`, profileData),
    onSuccess: (response) => {
      // response is the axios response object
      // response.data is the API JSON body: { success, message, data: user }
      // response.data.data is the actual user object
      const updatedUser = response?.data?.data;
      if (updatedUser) {
        setUser(updatedUser);
      }
      qc.invalidateQueries({ queryKey: QUERY_KEYS.profile(portal) });
    },
  });
}

// ── Map hooks ─────────────────────────────────────────────

export function useMapTickets(filters = {}) {
  return useQuery({
    ...QUERY_OPTS,
    queryKey: ['admin', 'map', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/map', { params: filters });
      return data.data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
