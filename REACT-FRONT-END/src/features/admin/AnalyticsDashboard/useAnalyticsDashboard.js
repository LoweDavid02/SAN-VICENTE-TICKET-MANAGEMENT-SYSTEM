/**
 * useAnalyticsDashboard — custom hook for the Admin AnalyticsDashboard feature.
 * Now uses the real API via useAdminDashboard hook.
 * Filters data based on selected period (weekly, monthly, quarterly).
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

  // Filter tickets based on selected period
  const filteredTickets = useMemo(() => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return tickets.filter((t) => {
      const ticketDate = new Date(t.created_at || t.submitted_at);
      return ticketDate >= startDate;
    });
  }, [tickets, period]);

  const summary = useMemo(() => {
    const total      = filteredTickets.length;
    const resolved   = filteredTickets.filter((t) => t.status === TICKET_STATUS.COMPLETED).length;
    const inProgress = filteredTickets.filter((t) => t.status === TICKET_STATUS.IN_PROGRESS).length;
    const pending    = filteredTickets.filter((t) => t.status === TICKET_STATUS.PENDING).length;
    const rate       = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';
    return { total, resolved, inProgress, pending, rate };
  }, [filteredTickets]);

  // Generate monthly trends based on filtered tickets
  const dynamicMonthlyTrends = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const trends = months.map((month) => ({
      month,
      tickets: 0,
      resolved: 0,
    }));

    filteredTickets.forEach((t) => {
      const date = new Date(t.created_at || t.submitted_at);
      const monthIndex = date.getMonth();
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex];
      
      const trendIndex = trends.findIndex((tr) => tr.month === monthName);
      if (trendIndex !== -1) {
        trends[trendIndex].tickets++;
        if (t.status === TICKET_STATUS.COMPLETED) {
          trends[trendIndex].resolved++;
        }
      }
    });

    return trends.length > 0 && trends.some(t => t.tickets > 0) ? trends : monthlyTrends;
  }, [filteredTickets]);

  // Generate category breakdown based on filtered tickets
  const dynamicCategoryBreakdown = useMemo(() => {
    const categories = {};
    filteredTickets.forEach((t) => {
      const cat = t.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const total = filteredTickets.length || 1;
    const breakdown = Object.entries(categories).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: name === 'Infrastructure' ? '#14b8a6' 
           : name === 'Social Services' ? '#2563eb'
           : name === 'Waste Mgmt' ? '#f59e0b'
           : name === 'Public Safety' ? '#ef4444'
           : '#94a3b8',
    }));

    return breakdown.length > 0 ? breakdown : categoryBreakdown;
  }, [filteredTickets]);

  const deptWorkload = useMemo(() => {
    const counts = {};
    filteredTickets.forEach((t) => {
      if (!counts[t.category]) counts[t.category] = 0;
      if (t.status !== TICKET_STATUS.COMPLETED) counts[t.category]++;
    });
    return departments.map((d) => ({
      ...d,
      liveTickets: counts[d.name] ?? d.tickets,
    }));
  }, [filteredTickets]);

  return {
    summary,
    period, setPeriod,
    monthlyTrends: dynamicMonthlyTrends,
    categoryBreakdown: dynamicCategoryBreakdown,
    resolutionData,
    deptWorkload,
  };
}
