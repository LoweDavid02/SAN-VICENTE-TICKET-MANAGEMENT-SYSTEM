/**
 * TicketStore — Centralized ticket state shared across all three portals.
 *
 * Now backed by the real Laravel API via React Query.
 * Optimistic updates keep the UI snappy while API calls complete.
 * Cross-portal notifications fire on every status change.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { TICKET_STATUS, STATUS_FLOW } from '../constants/tickets';

/* ── Context ── */
const TicketContext = createContext(null);

/* ── Progress map per status ── */
export const STATUS_PROGRESS = {
  [TICKET_STATUS.PENDING]:      10,
  [TICKET_STATUS.UNDER_REVIEW]: 30,
  [TICKET_STATUS.IN_PROGRESS]:  65,
  [TICKET_STATUS.COMPLETED]:    100,
  [TICKET_STATUS.REJECTED]:     0,
};

export function TicketProvider({ children, addNotification }) {
  // Local optimistic state — gets overwritten by React Query on next poll
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  /**
   * Apply an optimistic status update locally.
   * React Query will confirm/overwrite on next refetch.
   */
  const applyOptimisticUpdate = useCallback((ticketId, newStatus, note = '') => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    setOptimisticUpdates((prev) => ({
      ...prev,
      [ticketId]: {
        status:   newStatus,
        progress: STATUS_PROGRESS[newStatus] ?? 10,
        updated:  `${today} · ${now}`,
        fieldNote: note,
      },
    }));

    // Fire cross-portal notification
    if (addNotification) {
      const notifType =
        newStatus === TICKET_STATUS.COMPLETED ? 'success' :
        newStatus === TICKET_STATUS.IN_PROGRESS ? 'info' : 'warning';

      addNotification({
        id:    Date.now(),
        title: `Ticket ${ticketId} — ${newStatus}`,
        body:  note
          ? `Status updated: ${note}`
          : `Status updated to "${newStatus}" by field personnel.`,
        time:  'Just now',
        read:  false,
        type:  notifType,
        ticketId,
      });
    }
  }, [addNotification]);

  /**
   * Fire a notification when a new ticket is submitted.
   */
  const notifyNewTicket = useCallback((trackingId, title) => {
    if (addNotification) {
      addNotification({
        id:    Date.now(),
        title: `New ticket submitted: ${trackingId}`,
        body:  `${title} — awaiting review.`,
        time:  'Just now',
        read:  false,
        type:  'info',
        ticketId: trackingId,
      });
    }
  }, [addNotification]);

  /**
   * Get optimistic override for a ticket if one exists.
   */
  const getOptimistic = useCallback((ticketId) => {
    return optimisticUpdates[ticketId] || null;
  }, [optimisticUpdates]);

  /**
   * Merge optimistic updates into a ticket array.
   */
  const mergeOptimistic = useCallback((tickets) => {
    if (!tickets) return [];
    return tickets.map((t) => {
      const opt = optimisticUpdates[t.id] || optimisticUpdates[t.tracking_id];
      return opt ? { ...t, ...opt } : t;
    });
  }, [optimisticUpdates]);

  return (
    <TicketContext.Provider value={{
      applyOptimisticUpdate,
      notifyNewTicket,
      getOptimistic,
      mergeOptimistic,
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export const useTickets = () => {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used inside TicketProvider');
  return ctx;
};
