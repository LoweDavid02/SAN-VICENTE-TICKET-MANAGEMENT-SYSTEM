import { useState, useEffect, useRef } from 'react';
import { Lightbulb, X, MapPin, Clock, User, Tag, RefreshCw } from 'lucide-react';
import { StatCard, WorkloadBar, IncidentRow, SectionHeader } from '../components/ui/Components';
import { StatusBadge, SeverityBadge } from '../components/ui/Components';
import { useAdminDashboard, useMapTickets } from '../hooks/useTicketApi';
import { kpiData, departments } from '../data/mockData';
import { useT } from '../stores/langStore';
import Portal from '../components/Portal';
import { useNavigate } from 'react-router-dom';

const HEAT_BG = [
  'rgba(20,184,166,.12)', 'rgba(20,184,166,.28)',
  'rgba(20,184,166,.48)', 'rgba(20,184,166,.68)', 'rgba(20,184,166,.88)',
];
const HEAT_FG = ['#0d9488', '#0f766e', '#fff', '#fff', '#fff'];

const SEV_BG = {
  High:   'rgba(239,68,68,.1)',
  Medium: 'rgba(245,158,11,.1)',
  Low:    'rgba(16,185,129,.1)',
};

// Barangay San Vicente — precise center and tight bounds
const BRGY_CENTER = [14.9456, 120.7558];
const BRGY_ZOOM   = 16;   // zoom 16 = street-level, fills the card with just the barangay

// Tight bounds — only Barangay San Vicente, no surrounding municipalities
const BRGY_BOUNDS = [
  [14.932, 120.742],   // SW corner
  [14.960, 120.770],   // NE corner
];

const MARKER_COLOR = {
  'Pending':      '#EF4444',
  'Under Review': '#F59E0B',
  'In Progress':  '#F59E0B',
  'Completed':    '#10B981',
  'Rejected':     '#6B7280',
};

/**
 * LiveComplaintMap — real Leaflet map embedded in the dashboard card.
 * Lazy-loads Leaflet only when this component mounts.
 */
function LiveComplaintMap() {
  const mapRef      = useRef(null);
  const leafletRef  = useRef(null);
  const mapObjRef   = useRef(null);
  const markersRef  = useRef([]);
  const [ready, setReady] = useState(false);

  const { data } = useMapTickets({});
  const markers = data?.markers || [];

  // Bootstrap Leaflet once
  useEffect(() => {
    let cancelled = false;
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');
      if (cancelled || !mapRef.current || mapObjRef.current) return;

      // Fix broken default icons in Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        center:             BRGY_CENTER,
        zoom:               BRGY_ZOOM,
        minZoom:            15,          // can't zoom out past street level
        maxZoom:            19,
        zoomControl:        true,
        scrollWheelZoom:    false,       // prevent accidental zoom while scrolling dashboard
        doubleClickZoom:    true,
        attributionControl: true,
        // Hard lock — user cannot pan outside Barangay San Vicente
        maxBounds:          BRGY_BOUNDS,
        maxBoundsViscosity: 1.0,         // 1.0 = hard wall, cannot drag outside at all
      });

      // Fit the view exactly to the barangay bounds on load
      map.fitBounds(BRGY_BOUNDS, { padding: [8, 8] });

      // ── Layer 1: Esri World Imagery (satellite) ──
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN',
          maxZoom: 19,
        }
      ).addTo(map);

      // ── Layer 2: OSM labels on top of satellite (roads, street names, landmarks) ──
      L.tileLayer(
        'https://stamen-tiles.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png',
        {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
          maxZoom: 19,
          opacity: 0.55,
        }
      ).addTo(map);

      // Barangay boundary polygon
      L.geoJSON({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [120.7480, 14.9380],[120.7510, 14.9370],[120.7545, 14.9375],
              [120.7580, 14.9385],[120.7615, 14.9400],[120.7640, 14.9420],
              [120.7650, 14.9445],[120.7645, 14.9475],[120.7635, 14.9510],
              [120.7620, 14.9540],[120.7600, 14.9560],[120.7575, 14.9570],
              [120.7545, 14.9568],[120.7515, 14.9560],[120.7490, 14.9545],
              [120.7468, 14.9525],[120.7455, 14.9500],[120.7448, 14.9470],
              [120.7450, 14.9440],[120.7458, 14.9415],[120.7468, 14.9398],
              [120.7480, 14.9380],
            ]],
          },
        }],
      }, {
        style: { color: '#22a83a', weight: 2.5, opacity: 0.8, fillColor: '#22a83a', fillOpacity: 0.05, dashArray: '6 4' },
      }).addTo(map);

      mapObjRef.current = map;
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Add/update markers when data arrives
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapObjRef.current;
    if (!L || !map || !ready) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    markers.forEach((ticket) => {
      if (ticket.latitude == null || ticket.longitude == null) return;
      const color = MARKER_COLOR[ticket.status] || '#EF4444';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 32 43">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 27 16 27S32 27.2 32 16C32 7.163 24.837 0 16 0z"
              fill="${color}" stroke="white" stroke-width="2.5"/>
        <circle cx="16" cy="16" r="6" fill="white" opacity="0.95"/>
        <circle cx="16" cy="16" r="3.5" fill="${color}"/>
      </svg>`;
      const icon = L.divIcon({
        html: svg, className: '',
        iconSize: [28, 38], iconAnchor: [14, 38], popupAnchor: [0, -38],
      });
      const statusColor = MARKER_COLOR[ticket.status] || '#64748b';
      const m = L.marker([Number(ticket.latitude), Number(ticket.longitude)], { icon })
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;padding:2px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="font-family:monospace;font-size:11px;font-weight:700;color:#22a83a">${ticket.tracking_id}</span>
              <span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:99px;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44">${ticket.status}</span>
            </div>
            <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 6px;line-height:1.3">${ticket.title}</p>
            <p style="font-size:11px;color:#64748b;margin:0 0 3px">📍 ${ticket.location || '—'}</p>
            <p style="font-size:11px;color:#64748b;margin:0">👤 ${ticket.resident_name || '—'}</p>
          </div>
        `, { maxWidth: 260 })
        .addTo(map);
      markersRef.current.push(m);
    });
  }, [markers, ready]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.2)', borderTopColor: '#14b8a6', animation: 'spin .65s linear infinite' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>Loading satellite view…</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [incident, setIncident] = useState(null);
  const { t } = useT();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useAdminDashboard();

  const stats   = data?.stats   || {};
  const tickets = data?.tickets || [];

  // Build KPI cards from real data
  const kpis = [
    { label: t('totalTickets'),    value: stats.total_tickets    ?? kpiData.totalTickets.value,    change: '+12.5%', trend: 'up',   note: 'vs last month',  delay: 0   },
    { label: t('pendingUrgent'),   value: stats.urgent_tickets   ?? kpiData.pendingUrgent.value,   note: 'Requires immediate attention', accent: 'var(--red)', delay: 75  },
    { label: t('inProgress'),      value: stats.in_progress      ?? 0,                             change: '',       trend: 'up',   note: 'active now',     delay: 150 },
    { label: t('activePersonnel'), value: stats.total_personnel  ?? kpiData.activePersonnel.value, change: '',       trend: 'up',   note: 'registered',     delay: 225 },
  ];

  // Use real tickets as incidents, fall back to mock
  const incidents = tickets.slice(0, 6).map(tk => ({
    id:         tk.tracking_id,
    title:      tk.title,
    time:       tk.updated,
    severity:   tk.severity,
    status:     tk.status,
    assignedTo: tk.assigned_to?.full_name || 'Unassigned',
    category:   tk.category,
    icon:       tk.severity === 'High' ? '🚨' : tk.severity === 'Medium' ? '⚠️' : '📋',
    ...tk,
  }));

  if (isLoading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#14b8a6', animation: 'spin .65s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16, gap: 8 }}>
        <button onClick={() => refetch()} className="btn btn-ghost" style={{ fontSize: 11, gap: 5, padding: '4px 10px' }}>
          <RefreshCw size={11} /> {t('refresh')}
        </button>
      </div>

      {/* KPIs */}
      <div className="dash-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} change={k.change} trend={k.trend} note={k.note} accent={k.accent} delay={k.delay} />
        ))}
      </div>

      {/* Map + Workload */}
      <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Live Complaint Map card */}
        <div className="card animate-fade-up" style={{ padding: 0, animationDelay: '100ms', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Card header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Complaint Map</h2>
              <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>Barangay San Vicente, Apalit, Pampanga · Satellite View</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {[['#EF4444','Pending'],['#F59E0B','In Progress'],['#10B981','Resolved']].map(([c,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Real map — flex: 1 fills remaining card height */}
          <div style={{ flex: 1, minHeight: 340, position: 'relative' }}>
            <LiveComplaintMap />
          </div>
        </div>

        <div className="card animate-fade-up" style={{ padding: 24, animationDelay: '175ms' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{t('deptWorkload')}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 22 }}>Active task distribution by sector</p>
          {departments.map((d) => <WorkloadBar key={d.name} dept={d} />)}
          <div style={{ marginTop: 8, padding: '12px 14px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 'var(--radius)', display: 'flex', gap: 10 }}>
            <Lightbulb size={15} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--amber)' }}>Optimization Alert:</strong> Social Services is at near-full capacity.
            </p>
          </div>
        </div>
      </div>

      {/* Incident Log — real tickets */}
      <div className="card animate-fade-up" style={{ padding: 24, animationDelay: '250ms' }}>
        <SectionHeader
          title={t('incidentLog')}
          sub={`Live feed of service requests — ${tickets.length} total`}
          action={t('export')}
          onAction={() => {}}
        />
        {incidents.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-4)', padding: '24px 0', fontSize: 13 }}>{t('noTickets')} Residents can submit requests from their portal.</p>
        ) : (
          incidents.map((inc) => (
            <IncidentRow key={inc.id} incident={inc} onClick={() => setIncident(inc)} />
          ))
        )}
      </div>

      {/* Incident Detail Modal */}
      {incident && (
        <Portal>
          <div onClick={() => setIncident(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(9,18,32,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn .2s ease-out both' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 4px 8px rgba(15,23,42,.06), 0 24px 56px rgba(15,23,42,.2)', overflow: 'hidden', animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: SEV_BG[incident.severity] || SEV_BG.Low, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {incident.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: 'var(--brand)' }}>{incident.id}</span>
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>{incident.title}</h2>
                </div>
              </div>
              <button onClick={() => setIncident(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-3)', color: 'var(--text-3)', flexShrink: 0 }}><X size={15} /></button>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: Tag,   label: 'Category',   value: incident.category   },
                  { icon: Clock, label: 'Reported',    value: incident.time       },
                  { icon: User,  label: 'Assigned To', value: incident.assignedTo },
                  { icon: MapPin,label: 'Location',    value: incident.location || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon size={12} style={{ color: 'var(--text-4)' }} />
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setIncident(null)} style={{ padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)', transition: 'all .15s' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
