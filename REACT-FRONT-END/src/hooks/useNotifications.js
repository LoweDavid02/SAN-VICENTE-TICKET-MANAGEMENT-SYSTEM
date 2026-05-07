/**
 * useNotifications Hook
 * 
 * Fetches real-time notifications from the backend API.
 * Polls every 30 seconds for new notifications.
 * Provides methods to mark notifications as read.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export function useNotifications() {
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('auth_token');

  // Fetch notifications with polling
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications');
        return response.data.data;
      } catch (error) {
        // Silently fail if endpoint doesn't exist or returns error
        console.warn('Notifications API not available:', error.message);
        return { notifications: [], unread_count: 0 };
      }
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
    retry: false, // Don't retry on failure
    enabled: isAuthenticated, // Only fetch if user is authenticated
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    },
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    error,
    markAsRead: (id) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id) => deleteNotificationMutation.mutate(id),
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}
