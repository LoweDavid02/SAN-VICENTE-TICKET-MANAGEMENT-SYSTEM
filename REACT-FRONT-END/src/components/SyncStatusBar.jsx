/**
 * Sync Status Bar Component
 * 
 * Displays current connection status with color-coded pill badge
 */

import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useSyncStatus } from '../hooks/usePWA';

const STATUS_CONFIG = {
  online: {
    label: 'Online',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: Wifi,
  },
  offline: {
    label: 'Offline',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: WifiOff,
  },
  syncing: {
    label: 'Syncing',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: RefreshCw,
  },
  error: {
    label: 'Connection Error',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: AlertCircle,
  },
};

export default function SyncStatusBar() {
  const { status, progress } = useSyncStatus();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error;
  const Icon = config.icon;

  // Don't show when online and not syncing
  if (status === 'online') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${config.label}${status === 'syncing' ? ` ${progress}%` : ''}`}
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontSize: '0.875rem',
        fontWeight: 600,
        animation: 'slideInUp 0.3s ease-out',
      }}
      className={config.bgColor}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          flexShrink: 0,
        }}
        className={config.color}
      />
      <Icon
        size={14}
        className={config.textColor}
        style={{
          animation: status === 'syncing' ? 'spin 1s linear infinite' : 'none',
        }}
      />
      <span className={config.textColor}>
        {config.label}
        {status === 'syncing' && ` ${progress}%`}
      </span>
    </div>
  );
}
