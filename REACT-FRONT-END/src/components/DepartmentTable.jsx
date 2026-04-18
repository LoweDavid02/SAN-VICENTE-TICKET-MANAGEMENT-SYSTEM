import { useState } from 'react';
import { TrendingUp, TrendingDown, X, AlertTriangle } from 'lucide-react';

const DEPARTMENTS = [
  { name: 'Social Services',  capacity: 95, staff: 19, max: 20, trend: 'up'   },
  { name: 'Public Safety',    capacity: 88, staff: 22, max: 25, trend: 'up'   },
  { name: 'Waste Management', capacity: 82, staff: 18, max: 22, trend: 'up'   },
  { name: 'Infrastructure',   capacity: 78, staff: 14, max: 18, trend: 'down' },
  { name: 'Health & Wellness',capacity: 72, staff: 13, max: 18, trend: 'down' },
];

function capacityStyle(pct) {
  if (pct >= 90) return { bar: '#dc2626', badge: '#fef2f2', badgeText: '#b91c1c', label: 'Critical' };
  if (pct >= 80) return { bar: '#f59e0b', badge: '#fffbeb', badgeText: '#b45309', label: 'High'     };
  if (pct >= 70) return { bar: '#f59e0b', badge: '#fffbeb', badgeText: '#b45309', label: 'Moderate' };
  return              { bar: '#10b981', badge: '#f0fdf4', badgeText: '#065f46', label: 'Normal'   };
}

export default function DepartmentTable() {
  const [dismissed, setDismissed] = useState([]);

  const alerts = DEPARTMENTS.filter((d) => d.capacity >= 90 && !dismissed.includes(d.name));

  return (
    <div className="card">
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-base font-semibold text-slate-900">Department Workload</h2>
        <p className="text-xs text-slate-500 mt-0.5">Capacity utilization across all units</p>
      </div>

      {/* Alerts */}
      {alerts.map((d) => (
        <div key={d.name}
             className="flex items-start gap-3 mx-4 mt-4 p-3 rounded-lg animate-scale-in"
             style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-800">{d.name} at {d.capacity}% capacity</p>
            <p className="text-xs text-red-600 mt-0.5">Recommend personnel reallocation immediately.</p>
          </div>
          <button onClick={() => setDismissed((p) => [...p, d.name])}
                  className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}

      {/* Table */}
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Department', 'Utilization', 'Staff', 'Trend'].map((h) => (
                <th key={h} className="text-left pb-3 px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map((d) => {
              const s = capacityStyle(d.capacity);
              return (
                <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 text-sm font-medium text-slate-800">{d.name}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden" style={{ minWidth: '80px' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{ width: `${d.capacity}%`, background: s.bar }} />
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: s.badge, color: s.badgeText }}>
                        {d.capacity}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-600">{d.staff}/{d.max}</td>
                  <td className="py-3 px-2">
                    {d.trend === 'up'
                      ? <TrendingUp size={14} className="text-red-400" />
                      : <TrendingDown size={14} className="text-emerald-500" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
