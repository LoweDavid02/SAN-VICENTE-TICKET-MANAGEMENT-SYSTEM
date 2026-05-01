/**
 * AnalyticsDashboard — Admin Portal feature component.
 *
 * Visualizes resolution times, department workloads, and ticket trends.
 * Reads live ticket counts from TicketStore so the charts update when
 * Personnel changes statuses.
 *
 * RBAC: Only ROLES.ADMIN may access this feature.
 * Personnel attempting to access /admin/analytics will be redirected.
 */

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, FileDown, Loader2 } from 'lucide-react';
import { useAnalyticsDashboard } from './useAnalyticsDashboard';
import { useState } from 'react';

const TOOLTIP_STYLE = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 10, boxShadow: 'var(--shadow-lg)', fontSize: 12, color: 'var(--text-1)',
};

export default function AnalyticsDashboard() {
  const {
    summary, period, setPeriod,
    monthlyTrends, categoryBreakdown, resolutionData, deptWorkload,
  } = useAnalyticsDashboard();

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError,   setPdfError]   = useState(null);

  const SUMMARY_CARDS = [
    { label: 'Total Tickets',   value: summary.total,      color: 'var(--brand)',  icon: TrendingUp,   delta: '+12.5%' },
    { label: 'Resolved',        value: summary.resolved,   color: 'var(--green)',  icon: CheckCircle2, delta: `${summary.rate}% rate` },
    { label: 'In Progress',     value: summary.inProgress, color: '#f59e0b',       icon: Clock,        delta: 'Active now' },
    { label: 'Pending Review',  value: summary.pending,    color: 'var(--red)',    icon: AlertTriangle,delta: 'Needs action' },
  ];

  const handleDownloadReport = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      // Lazy-load the PDF library — only downloaded when user clicks the button
      const { generateAnalyticsPDF } = await import('../../../lib/generateAnalyticsPDF');
      await generateAnalyticsPDF({
        summary,
        period,
        monthlyTrends,
        categoryBreakdown,
        resolutionData,
        deptWorkload,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
      setPdfError('PDF generation failed. Please try again.');
      setTimeout(() => setPdfError(null), 4000);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Error toast */}
      {pdfError && (
        <div role="alert" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 12,
          background: '#fef2f2', border: '1px solid #fecaca',
          boxShadow: '0 4px 16px rgba(239,68,68,.2)',
          animation: 'fadeUp .3s ease-out both',
          maxWidth: 360,
        }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>{pdfError}</p>
        </div>
      )}

      {/* Page header with download button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Analytics Dashboard</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: 2 }}>Resolution times, department workloads, and ticket trends</p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={pdfLoading}
          className="btn btn-brand"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', fontSize: 13, fontWeight: 600,
            opacity: pdfLoading ? 0.75 : 1,
            cursor: pdfLoading ? 'not-allowed' : 'pointer',
          }}
          aria-label="Download PDF Report"
          onMouseEnter={(e) => { if (!pdfLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(34,168,58,.35)'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          {pdfLoading
            ? <><Loader2 size={14} style={{ animation: 'spin .65s linear infinite' }} /> Generating PDF…</>
            : <><FileDown size={14} strokeWidth={2.5} /> Download PDF Report</>
          }
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {SUMMARY_CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card animate-fade-up" style={{ padding: '20px 22px', animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <p className="section-label">{c.label}</p>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} style={{ color: c.color }} />
                </div>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>{c.value}</p>
              <span className="badge badge-green" style={{ fontSize: 11 }}>{c.delta}</span>
            </div>
          );
        })}
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>Time Period:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['weekly', 'monthly', 'quarterly'].map((p) => (
            <button 
              key={p} 
              onClick={() => setPeriod(p)} 
              className="btn" 
              style={{ 
                padding: '8px 18px', 
                fontSize: 13, 
                fontWeight: 600,
                background: period === p ? 'var(--navy)' : 'var(--surface-3)', 
                color: period === p ? '#fff' : 'var(--text-3)', 
                border: period === p ? 'none' : '1px solid var(--border)',
                boxShadow: period === p ? '0 2px 8px rgba(20,184,166,.25)' : 'none',
                transform: period === p ? 'translateY(-1px)' : 'none',
                transition: 'all .2s',
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-4)', marginLeft: 'auto' }}>
          Showing data for the last {period === 'weekly' ? '7 days' : period === 'monthly' ? '30 days' : '90 days'}
        </span>
      </div>

      {/* Chart row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Ticket Volume — Submitted vs Resolved</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 20 }}>Monthly comparison over the last 5 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrends} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradSubmit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: 'var(--text-3)' }} />
              <Area type="monotone" dataKey="tickets"  name="Submitted" stroke="#14b8a6" strokeWidth={2} fill="url(#gradSubmit)"  dot={{ r: 4, fill: '#14b8a6', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="resolved" name="Resolved"  stroke="#10b981" strokeWidth={2} fill="url(#gradResolve)" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Tickets by Category</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 12 }}>Percentage distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {categoryBreakdown.map((c) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Avg. Resolution Time by Department</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>Hours to close a ticket</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resolutionData} layout="vertical" barSize={12} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} width={88} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}h`} />
              <Bar dataKey="avg" fill="var(--brand)" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Department Workload (Live)</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>Active tickets per department — updates when Personnel resolves tasks</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {deptWorkload.map((d) => {
              const pct  = d.capacity;
              const fill = pct >= 90 ? 'var(--red)' : pct >= 70 ? '#f59e0b' : 'var(--brand)';
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{d.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 8 }}>{d.liveTickets} active</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: fill }}>{pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
