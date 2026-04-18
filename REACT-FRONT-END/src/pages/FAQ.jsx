import { useState } from 'react';
import { ChevronDown, HelpCircle, Search, Shield, FileText, Clock, Users, AlertTriangle, MessageCircle } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'Getting Started',
    icon: Shield,
    color: '#14b8a6',
    bg: '#f0fdfa',
    items: [
      {
        q: 'What is Barangay Connect?',
        a: 'Barangay Connect is a unified digital platform for Barangay San Vicente that connects residents, field personnel, and administrators. It enables real-time incident tracking, service request management, and transparent community governance.',
      },
      {
        q: 'Who can use this system?',
        a: 'The system has three portals: (1) Resident Portal — for community members to submit and track service requests; (2) Personnel Portal — for barangay field staff to manage and update assigned tasks; (3) Admin Portal — for administrators to oversee operations, analytics, and personnel.',
      },
      {
        q: 'How do I create an account?',
        a: 'Contact the Barangay San Vicente office to register. Residents can self-register using their barangay ID. Personnel and Admin accounts are created by the system administrator.',
      },
    ],
  },
  {
    category: 'Submitting Requests',
    icon: FileText,
    color: '#2563eb',
    bg: '#eff6ff',
    items: [
      {
        q: 'How do I submit a service request?',
        a: 'Log in to the Resident Portal, click "Submit Request" in the navigation, and follow the 4-step wizard: (1) Select category, (2) Describe the issue with optional photo evidence, (3) Provide location and severity, (4) Review and submit. You\'ll receive a tracking number immediately.',
      },
      {
        q: 'What types of issues can I report?',
        a: 'You can report: Streetlight Outages, Drainage/Flood issues, Road Damage, Waste Management concerns, Water Supply problems, and Other General Issues. Each is routed to the appropriate department automatically.',
      },
      {
        q: 'Can I attach photos to my request?',
        a: 'Yes. In Step 2 of the request wizard, you can upload up to 5 photos or PDF files (max 10MB each) as evidence. Drag and drop or click to upload. Images help field personnel locate and understand the problem faster.',
      },
      {
        q: 'What happens after I submit a request?',
        a: 'Your request enters the workflow: Submitted → Under Review → In Progress → Completed. You\'ll receive notifications at each stage. The Admin reviews and assigns it to the appropriate department personnel, who then performs the fieldwork and updates the status.',
      },
    ],
  },
  {
    category: 'Tracking & Status',
    icon: Clock,
    color: '#d97706',
    bg: '#fffbeb',
    items: [
      {
        q: 'How do I track my request?',
        a: 'Go to "My Dashboard" in the Resident Portal. All your active requests are listed with real-time status, progress bars, and a stage tracker showing exactly where your request is in the resolution process.',
      },
      {
        q: 'What do the status labels mean?',
        a: 'Pending — received, awaiting review. Under Review — being assessed by admin. In Progress — field personnel are actively working on it. Completed — issue has been resolved. Rejected — request could not be processed (reason provided).',
      },
      {
        q: 'How long does resolution take?',
        a: 'Average resolution time is 14.2 hours for standard requests. High-severity issues (floods, safety hazards) are escalated immediately and typically addressed within 2–4 hours. Low-severity issues may take 24–48 hours.',
      },
      {
        q: 'Can I view my past resolved requests?',
        a: 'Yes. Click "My History" in the sidebar to see all your past requests with their final statuses, resolution dates, and any notes from field personnel.',
      },
    ],
  },
  {
    category: 'For Personnel',
    icon: Users,
    color: '#f59e0b',
    bg: '#fffbeb',
    items: [
      {
        q: 'How do I receive assigned tasks?',
        a: 'Log in to the Personnel Portal. Your "My Tasks" page shows all tickets assigned to you by the Admin. Tasks are sorted by severity and due time. You\'ll also receive a notification when a new ticket is assigned.',
      },
      {
        q: 'How do I update a ticket status?',
        a: 'In the Personnel Portal, go to "My Tasks", click on a task to open the detail panel, then click "Update Status". Select the new status (Under Review → In Progress → Completed), add a field note describing what was done, and confirm. The resident is automatically notified.',
      },
      {
        q: 'What if I encounter connectivity issues in the field?',
        a: 'The system is web-based and requires internet. If you\'re in a low-connectivity area, note your updates and submit them when you regain connection. The system timestamps all updates accurately.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    icon: Shield,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    items: [
      {
        q: 'Is my personal information secure?',
        a: 'Yes. All data is encrypted in transit and at rest. Personal information is only accessible to authorized barangay personnel. Photos and location data are used solely for service resolution purposes.',
      },
      {
        q: 'Who can see my submitted requests?',
        a: 'Your requests are visible to: (1) You — in your Resident Dashboard; (2) Admin — for oversight and assignment; (3) Assigned Personnel — to perform the fieldwork. Other residents cannot see your requests.',
      },
      {
        q: 'How do I report a false or abusive report?',
        a: 'Contact the Barangay San Vicente office directly or use the emergency hotline. Submitting false reports may result in account suspension per barangay regulations.',
      },
    ],
  },
  {
    category: 'Emergency',
    icon: AlertTriangle,
    color: '#ef4444',
    bg: '#fef2f2',
    items: [
      {
        q: 'What should I do in an emergency?',
        a: 'For life-threatening emergencies, call 911 immediately. For barangay-level emergencies (flooding, fire, accidents), use the Emergency button in the Resident Dashboard to access hotlines: Barangay Emergency (911), Health Center (+63 2 8123-4567), Fire Station (+63 2 8765-4321).',
      },
      {
        q: 'How are high-severity requests handled?',
        a: 'Requests marked "High" severity are immediately escalated to the Disaster Response Team and flagged in the Admin Dashboard as urgent. Field personnel are dispatched as a priority.',
      },
    ],
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        transition: 'background .15s',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 12, fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4 }}>
          {item.q}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-4)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
          }}
        />
      </button>
      {open && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0 20px 16px',
            fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7,
          }}
        >
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...FAQ_DATA.map((c) => c.category)];

  const filtered = FAQ_DATA
    .filter((cat) => activeCategory === 'All' || cat.category === activeCategory)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          !search ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const totalItems = FAQ_DATA.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={20} style={{ color: 'var(--brand)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-4)', marginTop: 2 }}>
              {totalItems} answers across {FAQ_DATA.length} categories
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          style={{
            width: '100%', height: 44, paddingLeft: 42, paddingRight: 16,
            borderRadius: 12, fontSize: '0.9375rem',
            color: 'var(--text-1)', background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            outline: 'none', fontFamily: 'inherit', transition: 'all .18s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-muted)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = ''; }}
        />
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 14px', borderRadius: 99, fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              background: activeCategory === cat ? 'var(--brand)' : 'var(--surface)',
              color: activeCategory === cat ? '#fff' : 'var(--text-3)',
              border: activeCategory === cat ? 'none' : '1px solid var(--border)',
              boxShadow: activeCategory === cat ? '0 2px 8px rgba(20,184,166,.3)' : 'none',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ sections */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <MessageCircle size={32} style={{ color: 'var(--text-4)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-4)' }}>No results found for &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        filtered.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <div
              key={cat.category}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15,23,42,.06)',
              }}
            >
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 20px',
                background: 'var(--surface-2)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CatIcon size={15} style={{ color: cat.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>{cat.category}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: 1 }}>{cat.items.length} question{cat.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Items */}
              {cat.items.map((item, idx) => (
                <FAQItem key={idx} item={item} />
              ))}
            </div>
          );
        })
      )}

      {/* Contact footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderRadius: 14,
        background: 'var(--brand-muted)',
        border: '1px solid rgba(20,184,166,.2)',
      }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>Still have questions?</p>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 2 }}>
            Contact the Barangay San Vicente office directly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: 8, background: 'var(--brand)', color: '#fff' }}>
            📞 (02) 8123-4567
          </span>
        </div>
      </div>

    </div>
  );
}
