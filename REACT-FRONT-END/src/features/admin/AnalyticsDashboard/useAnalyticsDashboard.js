/**
 * useAnalyticsDashboard — custom hook for the Admin AnalyticsDashboard feature.
 * Now uses the real API via useAdminDashboard hook.
 */

import { useMemo, useState } from 'react';
import { TICKET_STATUS } from '../../../constants/tickets';
import { useAdminDashboard } from '../../../hooks/useTicketApi';
import {
  monthlyTrends, categoryBreakdown, resolutionData, departments,
} from '../../../data/mockData';

export function useAnalyticsDashboard() {
  const { data } = useAdminDashboard();
  const [period, setPeriod] = useState('monthly');

  const tickets = data?.tickets || [];

  const summary = useMemo(() => {
    const total      = tickets.length;
    const resolved   = tickets.filter((t) => t.status === TICKET_STATUS.COMPLETED).length;
    const inProgress = tickets.filter((t) => t.status === TICKET_STATUS.IN_PROGRESS).length;
    const pending    = tickets.filter((t) => t.status === TICKET_STATUS.PENDING).length;
    const rate       = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';
    return { total, resolved, inProgress, pending, rate };
  }, [tickets]);

  const deptWorkload = useMemo(() => {
    const counts = {};
    tickets.forEach((t) => {
      if (!counts[t.category]) counts[t.category] = 0;
      if (t.status !== TICKET_STATUS.COMPLETED) counts[t.category]++;
    });
    return departments.map((d) => ({
      ...d,
      liveTickets: counts[d.name] ?? d.tickets,
    }));
  }, [tickets]);

  return {
    summary,
    period, setPeriod,
    monthlyTrends,
    categoryBreakdown,
    resolutionData,
    deptWorkload,
  };
}
