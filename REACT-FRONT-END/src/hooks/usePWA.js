/**
 * PWA React Hooks
 * 
 * - useSyncStatus — connection status and sync progress
 * - useOfflineMutation — offline-first mutations with queue
 * - usePWAInstall — install prompt handling
 * - usePushNotifications — push notification subscription
 */

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import syncManager from '../lib/syncManager';
import { addOperation, saveEntity, getEntity } from '../lib/db';
import api from '../lib/axios';

/**
 * Subscribe to sync status
 * @returns {{ status: string, progress: number, isOnline: boolean, isSyncing: boolean }}
 */
export function useSyncStatus() {
  const [state, setState] = useState({
    status: syncManager.getStatus(),
    progress: 0,
  });

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((data) => {
      setState(data);
    });
    return unsubscribe;
  }, []);

  return {
    status: state.status,
    progress: state.progress,
    isOnline: state.status === 'online' || state.status === 'syncing',
    isSyncing: state.status === 'syncing',
  };
}

/**
 * Offline-first mutation hook
 * @param {Object} options
 * @param {Function} options.mutationFn - Mutation function
 * @param {string} options.entityType - Entity type for caching
 * @param {Function} options.getEntityId - Extract entity ID from variables
 * @param {Array} options.invalidateQueries - Query keys to invalidate
 * @returns {Object} TanStack Query mutation result
 */
export function useOfflineMutation({
  mutationFn,
  entityType,
  getEntityId,
  invalidateQueries = [],
  ...options
}) {
  const queryClient = useQueryClient();
  const { isOnline } = useSyncStatus();

  return useMutation({
    mutationFn: async (variables) => {
      if (isOnline) {
        // Online — normal mutation
        return await mutationFn(variables);
      } else {
        // Offline — queue operation and return optimistic result
        const entityId = getEntityId ? getEntityId(variables) : null;
        
        // Save optimistic update to IndexedDB
        if (entityType && entityId) {
          const existing = await getEntity(entityType, entityId);
          const optimisticData = { ...existing?.data, ...variables };
          await saveEntity(entityType, entityId, optimisticData, (existing?.version || 0) + 1, true);
        }

        // Queue the operation
        await addOperation({
          method: variables._method || 'POST',
          url: variables._url || '/api/unknown',
          body: variables,
          headers: { 'Content-Type': 'application/json' },
          entityType,
          entityId,
        });

        // Return optimistic result
        return { data: variables, _offline: true };
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate queries
      invalidateQueries.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update if needed
      if (!isOnline && entityType && getEntityId) {
        const entityId = getEntityId(variables);
        // Could implement rollback logic here
      }
      options.onError?.(error, variables, context);
    },
    ...options,
  });
}

/**
 * PWA install prompt hook
 * @returns {{ installState: string, promptInstall: Function, dismissPrompt: Function }}
 */
export function usePWAInstall() {
  const [installState, setInstallState] = useState('not-applicable');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallState('installed');
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallState('available');
    };

    const handleAppInstalled = () => {
      setInstallState('installed');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstallState('installed');
    }

    setDeferredPrompt(null);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setDeferredPrompt(null);
    setInstallState('not-applicable');
  }, []);

  return {
    installState,
    promptInstall,
    dismissPrompt,
  };
}

/**
 * Push notifications hook
 * @returns {{ isSupported: boolean, permission: string, subscribe: Function, unsubscribe: Function }}
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [subscription, setSubscription] = useState(null);

  const isSupported = typeof Notification !== 'undefined' && 'serviceWorker' in navigator;

  useEffect(() => {
    if (!isSupported) return;

    // Get existing subscription
    navigator.serviceWorker.ready.then(async (registration) => {
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    });
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return null;

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') return null;

      // Subscribe to push
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.error('[Push] VAPID public key not configured');
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);

      // Send subscription to backend
      await api.post('/push/subscribe', sub.toJSON());

      return sub;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Notify backend
      await api.post('/push/unsubscribe', subscription.toJSON());
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    isSubscribed: !!subscription,
    subscribe,
    unsubscribe,
  };
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
