import { useState } from 'react';
import { MapPin, Clock, CheckCircle, Phone, Camera } from 'lucide-react';
import Header from '../components/Header';

const PRIORITY_STYLE = {
  HIGH:   { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#dc2626' },
  MEDIUM: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' },
  LOW:    { bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981' },
};

const INITIAL_TASKS = [
  { id:1, title:'Fix Streetlight — Main Street',    location:'Main Street',    area:'Zone A', priority:'HIGH',   status:'In Progress', assignee:'Juan Dela Cruz', phone:'09123456789', dueTime:'2:30 PM', est:'45 min', done:false },
  { id:2, title:'Assess Road Damage — Residential B',location:'Residential B', area:'Zone B', priority:'MEDIUM', status:'Assigned',    assignee:'Maria Santos',   phone:'09198765432', dueTime:'3:45 PM', est:'30 min', done:false },
  { id:3, title:'Clean Drainage System',             location:'Market Area',   area:'Zone C', priority:'MEDIUM', status:'Pending',     assignee:'Pedro Reyes',    phone:'09156789012', dueTime:'1:15 PM', est:'60 min', done:false },
  { id:4, title:'Water Line Inspection',             location:'School Zone',   area:'Zone A', priority:'LOW',    status:'Assigned',    assignee:'Ana Garcia',     phone:'09187654321', dueTime:'12:00 PM',est:'50 min', done:true  },
];

export default function PersonnelTasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggle = (id) => setTasks((t) => t.map((x) => x.id === id ? { ...x, done: !x.done } : x));

  const done  = tasks.filter((t) => t.done).length;
  const pct   = Math.round((done / tasks.length) * 100);

  return (
    <div className="animate-fade-up space-y-6">
      <Header title="Field Tasks" subtitle="Assigned service requests for today" />

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Today's Progress</p>
          <p className="text-sm font-bold text-slate-900">{done}/{tasks.length} completed</p>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
               style={{ width: `${pct}%`, background: 'var(--brand)' }} />
        </div>
        <p className="text-xs text-slate-500 mt-2">{pct}% complete</p>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const p = PRIORITY_STYLE[task.priority];
          return (
            <div key={task.id} className="card overflow-hidden">
              {/* Priority bar */}
              <div className="h-1" style={{ background: p.dot }} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                            style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}` }}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-slate-400">{task.area}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                  </div>
                  {task.done && <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><MapPin size={12} />{task.location}</span>
                  <span className="flex items-center gap-1.5"><Clock  size={12} />{task.dueTime} · {task.est}</span>
                </div>

                <div className="flex items-center justify-between mb-4 p-3 rounded-lg"
                     style={{ background: 'var(--surface-3)' }}>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{task.assignee}</p>
                    <a href={`tel:${task.phone}`} className="text-xs font-medium"
                       style={{ color: 'var(--brand)' }}>{task.phone}</a>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg transition-colors hover:bg-slate-200"
                            style={{ background: 'var(--border)' }}>
                      <Camera size={13} className="text-slate-500" />
                    </button>
                    <a href={`tel:${task.phone}`}
                       className="p-2 rounded-lg transition-colors hover:bg-teal-100"
                       style={{ background: '#f0fdfa' }}>
                      <Phone size={13} style={{ color: 'var(--brand)' }} />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => toggle(task.id)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={task.done
                    ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                    : { background: 'var(--navy)', color: '#fff' }}
                >
                  {task.done ? '✓ Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
