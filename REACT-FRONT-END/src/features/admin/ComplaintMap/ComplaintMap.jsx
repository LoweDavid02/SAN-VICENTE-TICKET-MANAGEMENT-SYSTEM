/**
 * ComplaintMap — Interactive geospatial complaint map for Admin portal.
 *
 * Uses Google Maps JavaScript API loaded via script tag.
 * Falls back to a styled placeholder when no API key is configured.
 *
 * Features:
 * - Satellite view default, toggle to roadmap
 * - Colored markers: 🔴 Pending, 🟡 In Progress/Under Review, 🟢 Resolved/Completed
 * - InfoWindow on marker click with full ticket details
 * - Filters: status, category, date range, search
 * - Map legend
 * - Centered on Barangay San Vicente, Apalit, Pampanga
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Search, RefreshCw, Layers, MapPin, Filter, X } from 'lucide-react';
import { useMapTickets } from '../../../hooks/useTicketApi';
import { useDebounce } from '../../../hooks/useDebounce';

// Barangay San Vicente, Apalit, Pampanga
const CENTER = { lat: 14.9456, lng: 120.7558 };
const DEFAULT_ZOOM = 15;

// Marker colors by status
const MARKER_COLOR = {
  'Pending':      '#EF4444', // red
  'Under Review': '#F59E0B', // amber
  'In Progress':  '#F59E0B', // amber
  'Completed':    '#10B981', // green
  'Rejected':     '#6B7280', // gray
};

const STATUS_OPTIONS   = ['All', 'Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected'];
const CATEGORY_OPTIONS = ['All', 'streetlight', 'drainage', 'road', 'waste', 'water', 'other'];

// ── SVG marker icon factory ───────────────────────────────────────────────
function markerSvg(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// ── Load Google Maps script once ──────────────────────────────────────────
let gmapsLoaded = false;
let gmapsLoading = false;
const gmapsCallbacks = [];

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (gmapsLoaded && window.google?.maps) { resolve(); return; }
    gmapsCallbacks.push({ resolve, reject });
    if (gmapsLoading) return;
    gmapsLoading = true;

    if (!apiKey) {
      gmapsCallbacks.forEach(cb => cb.reject(new Error('NO_API_KEY')));
      gmapsCallbacks.length = 0;
      return;
    }

    window.__gmapsInit = () => {
      gmapsLoaded = true;
      gmapsLoading = false;
      gmapsCallbacks.forEach(cb => cb.resolve());
      gmapsCallbacks.length = 0;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapsInit&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      gmapsLoading = false;
      gmapsCallbacks.forEach(cb => cb.reject(new Error('LOAD_FAILED')));
      gmapsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// ── Fallback map (no API key) ─────────────────────────────────────────────
function MapFallback({ markers }) {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 480,
      background: 'linear-gradient(135deg, #e8f4f8 0%, #d1e8f0 50%, #c8e0ec 100%)',
      borderRadius: 12, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      border: '2px dashed #94a3b8', position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.15,
        backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Scatter mock markers */}
      {markers.slice(0, 8).map((m, i) => (
        <div key={m.id} style={{
          position: 'absolute',
          top:  `${20 + (i * 37) % 60}%`,
          left: `${15 + (i * 53) % 70}%`,
          width: 14, height: 14, borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          background: MARKER_COLOR[m.status] || '#EF4444',
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,.3)',
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
          <MapPin size={28} style={{ color: '#3b82f6' }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
          Interactive Map Preview
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, maxWidth: 320 }}>
          {markers.length} complaint{markers.length !== 1 ? 's' : ''} mapped across Barangay San Vicente.
          Add your <strong>Google Maps API key</strong> to enable the interactive map.
        </p>
        <div style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', display: 'inline-block' }}>
          <code style={{ fontSize: 11, color: '#2563eb' }}>VITE_GOOGLE_MAPS_KEY=your_key_here</code>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function ComplaintMap() {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markersRef   = useRef([]);
  const infoWindowRef = useRef(null);

  const [mapType,    setMapType]    = useState('satellite');
  const [mapReady,   setMapReady]   = useState(false);
  const [mapError,   setMapError]   = useState(null);
  const [status,     setStatus]     = useState('All');
  const [category,   setCategory]   = useState('All');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [search,     setSearch]     = useState('');
  const [showFilters,setShowFilters]= useState(false);
  const [selected,   setSelected]   = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(() => ({
    status:    status   !== 'All' ? status   : undefined,
    category:  category !== 'All' ? category : undefined,
    date_from: dateFrom || undefined,
    date_to:   dateTo   || undefined,
    search:    debouncedSearch || undefined,
  }), [status, category, dateFrom, dateTo, debouncedSearch]);

  const { data, isLoading, refetch } = useMapTickets(filters);
  const markers = data?.markers || [];

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  // ── Initialize Google Map ──────────────────────────────────────────────
  useEffect(() => {
    if (!apiKey) { setMapError('NO_API_KEY'); return; }

    loadGoogleMaps(apiKey)
      .then(() => setMapReady(true))
      .catch((err) => setMapError(err.message));
  }, [apiKey]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center:    CENTER,
      zoom:      DEFAULT_ZOOM,
      mapTypeId: mapType,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: mapType === 'roadmap' ? ROADMAP_STYLES : [],
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, [mapReady]);

  // ── Toggle map type ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setMapTypeId(mapType);
  }, [mapType]);

  // ── Render markers ─────────────────────────────────────────────────────
  const renderMarkers = useCallback(() => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    markers.forEach((ticket) => {
      if (!ticket.latitude || !ticket.longitude) return;

      const color = MARKER_COLOR[ticket.status] || '#EF4444';

      const marker = new window.google.maps.Marker({
        position: { lat: ticket.latitude, lng: ticket.longitude },
        map:      mapInstance.current,
        title:    ticket.title,
        icon: {
          url:        markerSvg(color),
          scaledSize: new window.google.maps.Size(28, 35),
          anchor:     new window.google.maps.Point(14, 35),
        },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        setSelected(ticket);
        const content = buildInfoWindowContent(ticket);
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [markers]);

  useEffect(() => {
    if (mapReady) renderMarkers();
  }, [mapReady, renderMarkers]);

  // ── Build InfoWindow HTML ──────────────────────────────────────────────
  function buildInfoWindowContent(t) {
    const statusColor = MARKER_COLOR[t.status] || '#64748b';
    const catLabel = t.category.charAt(0).toUpperCase() + t.category.slice(1);
    return `
      <div style="font-family:system-ui,sans-serif;min-width:240px;max-width:300px;padding:4px 0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <span style="font-family:monospace;font-size:11px;font-weight:700;color:#22a83a">${t.tracking_id}</span>
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${statusColor}20;color:${statusColor};border:1px solid ${statusColor}40">${t.status}</span>
        </div>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 8px;line-height:1.35">${t.title}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
          <div style="padding:6px 8px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0">
            <p style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin:0 0 2px">Resident</p>
            <p style="font-size:11px;font-weight:600;color:#0f172a;margin:0">${t.resident_name}</p>
          </div>
          <div style="padding:6px 8px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0">
            <p style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin:0 0 2px">Category</p>
            <p style="font-size:11px;font-weight:600;color:#0f172a;margin:0">${catLabel}</p>
          </div>
        </div>
        <div style="padding:6px 8px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:8px">
          <p style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin:0 0 2px">Address</p>
          <p style="font-size:11px;color:#334155;margin:0">${t.location}</p>
        </div>
        <p style="font-size:10px;color:#94a3b8;margin:0">Submitted ${t.submitted}</p>
      </div>`;
  }

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      markers.length,
    pending:    markers.filter(m => m.status === 'Pending').length,
    inProgress: markers.filter(m => ['Under Review','In Progress'].includes(m.status)).length,
    resolved:   markers.filter(m => ['Completed'].includes(m.status)).length,
  }), [markers]);

  const hasActiveFilters = status !== 'All' || category !== 'All' || dateFrom || dateTo || search;

  const clearFilters = () => {
    setStatus('All'); setCategory('All');
    setDateFrom(''); setDateTo(''); setSearch('');
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            Complaint Map
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>
            Geospatial view of all service requests — Barangay San Vicente, Apalit, Pampanga
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="btn btn-outline"
            style={{ fontSize: 12, gap: 6, position: 'relative' }}
          >
            <Filter size={13} /> Filters
            {hasActiveFilters && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)' }} />
            )}
          </button>
          <button onClick={() => refetch()} className="btn btn-outline" style={{ fontSize: 12, gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => setMapType(t => t === 'satellite' ? 'roadmap' : 'satellite')}
            className="btn btn-outline"
            style={{ fontSize: 12, gap: 6 }}
          >
            <Layers size={13} /> {mapType === 'satellite' ? 'Roadmap' : 'Satellite'}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Mapped',  value: stats.total,      color: 'var(--brand)' },
          { label: 'Pending',       value: stats.pending,    color: '#EF4444' },
          { label: 'In Progress',   value: stats.inProgress, color: '#F59E0B' },
          { label: 'Resolved',      value: stats.resolved,   color: '#10B981' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '12px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{isLoading ? '…' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card animate-fade-up" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
              <input
                className="input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search resident or address…"
                style={{ paddingLeft: 30, fontSize: 12 }}
              />
            </div>
            {/* Status */}
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize: 12, padding: '6px 10px', width: 140 }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Category */}
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ fontSize: 12, padding: '6px 10px', width: 140 }}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            {/* Date from */}
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>From</label>
              <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize: 12, padding: '6px 10px', width: 140 }} />
            </div>
            {/* Date to */}
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>To</label>
              <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ fontSize: 12, padding: '6px 10px', width: 140 }} />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-ghost" style={{ fontSize: 12, gap: 5, color: 'var(--red)' }}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map container */}
      <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Map legend */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 10,
          background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(8px)',
          borderRadius: 10, padding: '10px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,.15)',
          border: '1px solid rgba(226,232,240,.8)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Legend</p>
          {[
            { color: '#EF4444', label: 'Pending' },
            { color: '#F59E0B', label: 'In Progress / Under Review' },
            { color: '#10B981', label: 'Completed' },
            { color: '#6B7280', label: 'Rejected' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: l.color, border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,.2)', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#334155', fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(255,255,255,.9)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: 'var(--brand)', animation: 'spin .65s linear infinite' }} />
            Loading…
          </div>
        )}

        {/* Map or fallback */}
        {mapError === 'NO_API_KEY' ? (
          <div style={{ padding: 16 }}>
            <MapFallback markers={markers} />
          </div>
        ) : (
          <div
            ref={mapRef}
            style={{ width: '100%', height: 520, minHeight: 400 }}
          />
        )}
      </div>

      {/* Selected ticket detail */}
      {selected && (
        <div className="card animate-fade-up" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: MARKER_COLOR[selected.status] || '#64748b', flexShrink: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>{selected.tracking_id}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: `${MARKER_COLOR[selected.status]}20`, color: MARKER_COLOR[selected.status], border: `1px solid ${MARKER_COLOR[selected.status]}40` }}>{selected.status}</span>
            </div>
            <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ width: 28, height: 28, padding: 0, justifyContent: 'center' }}>
              <X size={14} />
            </button>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>{selected.title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { label: 'Resident',  value: selected.resident_name },
              { label: 'Category',  value: selected.category },
              { label: 'Location',  value: selected.location },
              { label: 'Submitted', value: selected.submitted },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Roadmap custom styles ─────────────────────────────────────────────────
const ROADMAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d8e8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5f5e0' }] },
];
