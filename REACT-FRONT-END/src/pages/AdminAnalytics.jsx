import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { monthlyTrends, categoryBreakdown, resolutionData } from '../data/mockData';

const TOOLTIP_STYLE = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 10, boxShadow: 'var(--shadow-lg)', fontSize: 12, color: 'var(--text-1)',
};

const SUMMARY = [
  { label: 'Tickets this month', value: '1,284', delta: '+12.5%', color: 'var(--brand)'  },
  { label: 'Resolution rate',    value: '85.6%', delta: '+3.2%',  color: 'var(--green)'  },
  { label: 'Avg. resolution',    value: '14.2h', delta: '−2.1h',  color: '#3b82f6'       },
  { label: 'Satisfaction score', value: '4.2/5', delta: '+0.3',   color: '#f59e0b'       },
];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('monthly');

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {SUMMARY.map((c, i) => (
          <div key={c.label} className="card animate-fade-up" style={{ padding: '20px 22px', animationDelay: `${i * 60}ms` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>{c.label}</p>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>{c.value}</p>
            <span className="badge badge-green" style={{ fontSize: 11 }}>{c.delta} vs last month</span>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['weekly', 'monthly', 'quarterly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="btn"
            style={{
              padding: '6px 16px', fontSize: 12,
              background: period === p ? 'var(--navy)' : 'var(--surface-3)',
              color: period === p ? '#fff' : 'var(--text-3)',
              border: period === p ? 'none' : '1px solid var(--border)',
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Ticket volume — submitted vs resolved</h2>
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
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Tickets by category</h2>
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
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Avg. resolution time by department</h2>
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
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Resolution trend</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>Month-over-month ticket flow</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrends} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: 'var(--text-3)' }} />
              <Line type="monotone" dataKey="tickets"  stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: '#14b8a6', strokeWidth: 0 }} name="Submitted" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} name="Resolved"  />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
