/**
 * Sync Manager — WebSocket connection + offline queue replay
 * 
 * Singleton that manages:
 * - WebSocket lifecycle with exponential backoff reconnection
 * - Replaying queued operations from IndexedDB
 * - Real-time entity updates with Last-Write-Wins conflict resolution
 * - Broadcasting sync status to React components
 */

import {
  getPendingOperations,
  updateOperationStatus,
  deleteOperation,
  incrementRetryCount,
  saveEntity,
  getEntity,
  OperationStatus,
} from './db';
import api from './axios';

class SyncManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.maxReconnectDelay = 30000; // 30 seconds
    this.baseReconnectDelay = 1000; // 1 second
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.syncProgress = 0;
    this.listeners = new Set();
    this.pingInterval = null;

    // Listen to online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Auto-connect if online
    if (this.isOnline) {
      this.connect();
    }
  }

  /**
   * Get current connection status
   * @returns {'online'|'offline'|'syncing'|'error'}
   */
  getStatus() {
    if (this.isSyncing) return 'syncing';
    if (!this.isOnline) return 'offline';
    if (this.ws?.readyState === WebSocket.OPEN) return 'online';
    return 'error';
  }

  /**
   * Subscribe to status changes
   * @param {Function} callback - Called with { status, progress }
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Immediately call with current status
    callback({ status: this.getStatus(), progress: this.syncProgress });
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers
   */
  notify() {
    const status = this.getStatus();
    const data = { status, progress: this.syncProgress };
    this.listeners.forEach(cb => cb(data));
  }

  /**
   * Connect to WebSocket
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[SyncManager] No auth token, skipping WebSocket connection');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    const url = `${wsUrl}?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[SyncManager] WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPing();
        this.notify();
        this.replayQueue();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onerror = (error) => {
        console.error('[SyncManager] WebSocket error:', error);
        this.notify();
      };

      this.ws.onclose = () => {
        console.log('[SyncManager] WebSocket closed');
        this.stopPing();
        this.scheduleReconnect();
        this.notify();
      };
    } catch (error) {
      console.error('[SyncManager] Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectTimer) return;

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`[SyncManager] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Start ping/pong keepalive
   */
  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000); // 25 seconds
  }

  /**
   * Stop ping/pong keepalive
   */
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  async handleMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'pong':
        // Keepalive response
        break;

      case 'bulk_sync':
        // Initial sync on connection
        await this.handleBulkSync(data);
        break;

      case 'entity_updated':
        // Real-time entity update
        await this.handleEntityUpdate(data);
        break;

      case 'auth_error':
        console.error('[SyncManager] Auth error, disconnecting');
        this.disconnect();
        break;

      default:
        console.warn('[SyncManager] Unknown message type:', type);
    }
  }

  /**
   * Handle bulk sync on initial connection
   */
  async handleBulkSync(entities) {
    console.log(`[SyncManager] Bulk sync: ${entities.length} entities`);
    for (const entity of entities) {
      await saveEntity(
        entity.entityType,
        entity.id,
        entity.data,
        entity.version || 1,
        false
      );
    }
    this.dispatchEntityEvent('bulk_sync', entities);
  }

  /**
   * Handle real-time entity update with Last-Write-Wins
   */
  async handleEntityUpdate(update) {
    const { entityType, entityId, data, version } = update;

    // Get local version
    const local = await getEntity(entityType, entityId);

    // Last-Write-Wins: server version >= local version
    if (!local || version >= (local.version || 0)) {
      await saveEntity(entityType, entityId, data, version, false);
      this.dispatchEntityEvent('entity_updated', { entityType, entityId, data, version });
    } else {
      console.log(`[SyncManager] Ignoring stale update for ${entityType}:${entityId}`);
    }
  }

  /**
   * Dispatch custom DOM event for entity changes
   */
  dispatchEntityEvent(type, detail) {
    window.dispatchEvent(new CustomEvent('pwa:entity-updated', { detail: { type, ...detail } }));
  }

  /**
   * Replay queued operations
   */
  async replayQueue() {
    if (this.isSyncing) return;

    const operations = await getPendingOperations();
    if (operations.length === 0) return;

    console.log(`[SyncManager] Replaying ${operations.length} queued operations`);
    this.isSyncing = true;
    this.syncProgress = 0;
    this.notify();

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      this.syncProgress = Math.round(((i + 1) / operations.length) * 100);
      this.notify();

      try {
        await updateOperationStatus(op.id, OperationStatus.SYNCING);

        // Replay the request
        await api.request({
          method: op.method,
          url: op.url,
          data: op.body,
          headers: op.headers,
        });

        // Success — delete from queue
        await deleteOperation(op.id);
        console.log(`[SyncManager] Replayed: ${op.method} ${op.url}`);
      } catch (error) {
        console.error(`[SyncManager] Replay failed: ${op.method} ${op.url}`, error);
        await incrementRetryCount(op.id);
        await updateOperationStatus(op.id, OperationStatus.FAILED);
      }
    }

    this.isSyncing = false;
    this.syncProgress = 0;
    this.notify();
    console.log('[SyncManager] Queue replay complete');
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('[SyncManager] Device is online');
    this.isOnline = true;
    this.notify();
    this.connect();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('[SyncManager] Device is offline');
    this.isOnline = false;
    this.notify();
  }
}

// Singleton instance
const syncManager = new SyncManager();

export default syncManager;
