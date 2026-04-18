/**
 * useFieldWorkTask — wired to real Laravel API.
 * Reads tasks from GET /personnel/tasks.
 * Updates via PATCH /personnel/tasks/{id}/status.
 * Optimistic updates via TicketStore for instant UI feedback.
 */

import { useState, useCallback } from 'react';
import { TICKET_STATUS, STATUS_FLOW } from '../../../constants/tickets';
import { usePersonnelTasks, useUpdateTaskStatus } from '../../../hooks/useTicketApi';
import { useTickets } from '../../../store/TicketStore';

export function useFieldWorkTask() {
  const [filter,      setFilter]      = useState('All');
  const [selected,    setSelected]    = useState(null);
  const [updateModal, setUpdateModal] = useState(null);

  const { applyOptimisticUpdate, mergeOptimistic } = useTickets();
  const { data: rawTasks = [], isLoading, refetch } = usePersonnelTasks();
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateTaskStatus();

  const FILTERS = ['All', TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.UNDER_REVIEW, TICKET_STATUS.COMPLETED];

  // Merge optimistic updates into tasks
  const tasks = mergeOptimistic(rawTasks);

  const visibleTasks = filter === 'All'
    ? tasks
    : tasks.filter((t) => t.status === filter);

  const getAvailableStatuses = useCallback((currentStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx === -1) return STATUS_FLOW;
    return STATUS_FLOW.filter((_, i) => i >= idx);
  }, []);

  const handleStatusUpdate = useCallback(async (ticketId, newStatus, note) => {
    // Optimistic update immediately
    applyOptimisticUpdate(ticketId, newStatus, note);

    // Update selected panel
    setSelected((prev) => prev?.id === ticketId ? { ...prev, status: newStatus } : prev);

    try {
      await updateStatus({ id: ticketId, status: newStatus, field_note: note });
    } catch (err) {
      console.error('Failed to update status:', err);
      // React Query will refetch and correct the state
      refetch();
    }
  }, [applyOptimisticUpdate, updateStatus, refetch]);

  const openUpdateModal  = useCallback((task) => setUpdateModal(task), []);
  const closeUpdateModal = useCallback(() => setUpdateModal(null), []);

  const selectTask = useCallback((task) => {
    setSelected((prev) => prev?.id === task.id ? null : task);
  }, []);

  const stats = {
    assigned:  tasks.filter((t) => t.status !== TICKET_STATUS.COMPLETED).length,
    completed: tasks.filter((t) => t.status === TICKET_STATUS.COMPLETED).length,
    urgent:    tasks.filter((t) => t.severity === 'High' && t.status !== TICKET_STATUS.COMPLETED).length,
  };

  return {
    visibleTasks, filter, setFilter, FILTERS,
    selected, selectTask,
    updateModal, openUpdateModal, closeUpdateModal,
    handleStatusUpdate, getAvailableStatuses,
    stats, isLoading, isUpdating,
  };
}
