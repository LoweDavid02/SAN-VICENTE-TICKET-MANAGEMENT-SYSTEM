/**
 * ComplaintMap — Interactive geospatial complaint map for Admin portal.
 *
 * FIXES applied:
 * 1. loadGoogleMaps: robust singleton loader — handles React StrictMode
 *    double-invoke, hot reload, and concurrent callers correctly.
 * 2. Uses legacy google.maps.Marker (NOT AdvancedMarkerElement) — removes
 *    the `libraries=marker` param that caused deprecation conflicts.
 * 3. Map instance cleanup on unmount prevents stale ref issues.
 * 4. Legend rendered outside the overflow:hidden card container.
 * 5. mapType correctly passed to Map constructor on first render.
 * 6. Markers re-rendered when data OR mapReady changes.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Search, RefreshCw, Layers, MapPin, Filter, X } from 'lucide-react';
import { useMapTickets } from '../../../hooks/useTicketApi';
import { useDebounce } from '../../../hooks/useDebounce';

// ── Constants ─────────────────────────────────────────────────────────────
const CENTER       = { lat: 14.9456, lng: 120.7558 }; // Brgy. San Vicente, Apalit
const DEFAULT_ZOOM = 15;

const MARKER_COLOR = {
  'Pending':      '#EF4444',
  'Under Review': '#F59E0B',
  'In Progress':  '#F59E0B',
  'Completed':    '#10B981',
  'Rejected':     '#6B7280',
};

const STATUS_OPTIONS   = ['All', 'Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected'];
const CATEGORY_OPTIONS = ['All', 'streetlight', 'drainage', 'road', 'waste', 'water', 'other'];

const LEGEND_ITEMS = [
  { color: '#EF4444', label: 'Pending' },
  { color: '#F59E0B', label: 'In Progress / Under Review' },
  { color: '#10B981', label: 'Completed' },
  { color: '#6B7280', label: 'Rejected' },
];

// ── SVG pin marker ────────────────────────────────────────────────────────
function pinSvgUrl(color) {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">` +
    `<path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/>` +
    `<circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>` +
    `</svg>`
  );
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

// ── Google Maps loader — robust singleton ─────────────────────────────────
const gmaps = { loaded: false, loading: false, promise: null };

function loadGoogleMaps(apiKey) {
  // Already loaded
  if (gmaps.loaded && window.google?.maps) return Promise.resolve();

  // In-flight — return the same promise
  if (gmaps.loading && gmaps.promise) return gmaps.promise;

  // No key
  if (!apiKey) return Promise.reject(new Error('NO_API_KEY'));

  gmaps.loading = true;
  gmaps.promise = new Promise((resolve, reject) => {
    // Clean up any previous stale callback
    delete window.__gmapsInit;

    window.__gmapsInit = () => {
      gmaps.loaded  = true;
      gmaps.loading = false;
      resolve();
    };

    // Remove any previously injected script to avoid duplicates on HMR
    const existing = document.querySelector('script[data-gmaps]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.setAttribute('data-gmaps', '1');
    // NOTE: no `libraries=marker` — we use the stable legacy Marker API
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapsInit`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      gmaps.loading = false;
      gmaps.promise = null;
      reject(new Error('LOAD_FAILED'));
    };
    document.head.appendChild(script);
  });

  return gmaps.promise;
}

// ── InfoWindow HTML builder ───────────────────────────────────────────────
function buildInfoContent(t) {
  const sc  = MARKER_COLOR[t.status] || '#64748b';
  const cat = (t.category || '').charAt(0).toUpperCase() + (t.category || '').slice(1);
  return `
    <div style="font-family:system-ui,sans-serif;min-width:230px;max-width:290px;padding:2px 0">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px">
        <span style="font-family:monospace;font-size:11px;font-weight:700;color:#22a83a">${t.tracking_id}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;background:${sc}22;color:${sc};border:1px solid ${sc}44">${t.status}</span>
      </div>
      <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 8px;line-height:1.3">${t.title}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:7px">
        <div style="padding:5px 7px;border-radius:5px;background:#f8fafc;border:1px solid #e2e8f0">
          <p style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px">Resident</p>
          <p style="font-size:11px;font-weight:600;color:#0f172a;margin:0">${t.resident_name}</p>
        </div>
        <div style="padding:5px 7px;border-radius:5px;background:#f8fafc;border:1px solid #e2e8f0">
          <p style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px">Category</p>
          <p style="font-size:11px;font-weight:600;color:#0f172a;margin:0">${cat}</p>
        </div>
      </div>
      <div style="padding:5px 7px;border-radius:5px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:7px">
        <p style="font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px">Address</p>
        <p style="font-size:11px;color:#334155;margin:0">${t.location}</p>
      </div>
      <p style="font-size:10px;color:#94a3b8;margin:0">Submitted ${t.submitted}</p>
    </div>`;
}

// ── Fallback when no API key ──────────────────────────────────────────────
function MapFallback({ markers }) {
  return (
    <div style={{
      width: '100%', height: 520, minHeight: 400,
      background: 'linear-gradient(135deg,#e8f4f8 0%,#d1e8f0 50%,#c8e0ec 100%)',
      borderRadius: 12, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      border: '2px dashed #94a3b8', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, opacity:.12,
        backgroundImage:'linear-gradient(#64748b 1px,transparent 1px),linear-gradient(90deg,#64748b 1px,transparent 1px)',
        backgroundSize:'36px 36px' }} />

      {markers.slice(0, 10).map((m, i) => (
        <div key={m.id || i} style={{
          position:'absolute',
          top:`${18 + (i * 41) % 62}%`, left:`${12 + (i * 57) % 72}%`,
          width:13, height:13, borderRadius:'50% 50% 50% 0',
          transform:'rotate(-45deg)',
          background: MARKER_COLOR[m.status] || '#EF4444',
          border:'2px solid white', boxShadow:'0 2px 6px rgba(0,0,0,.3)',
        }} />
      ))}

      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'0 24px' }}>
        <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,.85)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 14px', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}>
          <MapPin size={26} style={{ color:'#3b82f6' }} />
        </div>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1e293b', marginBottom:7 }}>
          Interactive Map Preview
        </h3>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6, maxWidth:300 }}>
          <strong>{markers.length}</strong> complaint{markers.length !== 1 ? 's' : ''} mapped across Barangay San Vicente.
          Add your Google Maps API key to enable the live interactive map.
        </p>
        <div style={{ marginTop:12, padding:'7px 14px', borderRadius:7,
          background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.2)',
          display:'inline-block' }}>
          <code style={{ fontSize:11, color:'#2563eb' }}>VITE_GOOGLE_MAPS_KEY=AIza…</code>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function ComplaintMap() {
  const mapDivRef    = useRef(null);
  const mapRef       = useRef(null);   // google.maps.Map instance
  const markersRef   = useRef([]);     // google.maps.Marker[]
  const infoWinRef   = useRef(null);   // google.maps.InfoWindow

  const [mapReady,    setMapReady]    = useState(false);
  const [mapError,    setMapError]    = useState(null);
  const [mapType,     setMapType]     = useState('satellite');
  const [showFilters, setShowFilters] = useState(false);
  const [status,      setStatus]      = useState('All');
  const [category,    setCategory]    = useState('All');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [search,      setSearch]      = useState('');
  const [selected,    setSelected]    = useState(null);

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

  // ── Load Google Maps script ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    if (!apiKey) {
      setMapError('NO_API_KEY');
      return;
    }

    loadGoogleMaps(apiKey)
      .then(() => { if (!cancelled) setMapReady(true); })
      .catch((err) => { if (!cancelled) setMapError(err.message); });

    return () => { cancelled = true; };
  }, [apiKey]);

  // ── Initialize map instance ──────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapDivRef.current) return;
    if (mapRef.current) return; // already initialized

    mapRef.current = new window.google.maps.Map(mapDivRef.current, {
      center:             CENTER,
      zoom:               DEFAULT_ZOOM,
      mapTypeId:          mapType,          // ← applied on first render
      mapTypeControl:     false,
      streetViewControl:  false,
      fullscreenControl:  true,
      zoomControl:        true,
      gestureHandling:    'greedy',
    });

    infoWinRef.current = new window.google.maps.InfoWindow({ maxWidth: 310 });

    // Close info window when clicking the map background
    mapRef.current.addListener('click', () => {
      infoWinRef.current.close();
      setSelected(null);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // ── Toggle map type ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setMapTypeId(mapType);
  }, [mapType]);

  // ── Render / update markers ──────────────────────────────────────────
  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    // Remove old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    markers.forEach((ticket) => {
      if (ticket.latitude == null || ticket.longitude == null) return;

      const color  = MARKER_COLOR[ticket.status] || '#EF4444';
      const marker = new window.google.maps.Marker({
        position:  { lat: Number(ticket.latitude), lng: Number(ticket.longitude) },
        map:       mapRef.current,
        title:     ticket.title,
        icon: {
          url:        pinSvgUrl(color),
          scaledSize: new window.google.maps.Size(28, 36),
          anchor:     new window.google.maps.Point(14, 36),
        },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        setSelected(ticket);
        infoWinRef.current.setContent(buildInfoContent(ticket));
        infoWinRef.current.open({ map: mapRef.current, anchor: marker });
      });

      markersRef.current.push(marker);
    });
  }, [markers]);

  useEffect(() => {
    if (mapReady) renderMarkers();
  }, [mapReady, renderMarkers]);

  // ── Cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      markers.length,
    pending:    markers.filter(m => m.status === 'Pending').length,
    inProgress: markers.filter(m => ['Under Review', 'In Progress'].includes(m.status)).length,
    resolved:   markers.filter(m => m.status === 'Completed').length,
  }), [markers]);

  const hasActiveFilters = status !== 'All' || category !== 'All' || dateFrom || dateTo || search;

  const clearFilters = () => {
    setStatus('All'); setCategory('All');
    setDateFrom(''); setDateTo(''); setSearch('');
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.02em' }}>
            Complaint Map
          </h1>
          <p style={{ fontSize:12, color:'var(--text-4)', marginTop:2 }}>
            Geospatial view of all service requests — Barangay San Vicente, Apalit, Pampanga
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="btn btn-outline"
            style={{ fontSize:12, gap:6, position:'relative' }}
          >
            <Filter size={13} /> Filters
            {hasActiveFilters && (
              <span style={{ position:'absolute', top:-4, right:-4, width:8, height:8, borderRadius:'50%', background:'var(--brand)' }} />
            )}
          </button>
          <button onClick={() => refetch()} className="btn btn-outline" style={{ fontSize:12, gap:6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          {!mapError && (
            <button
              onClick={() => setMapType(t => t === 'satellite' ? 'roadmap' : 'satellite')}
              className="btn btn-outline"
              style={{ fontSize:12, gap:6 }}
            >
              <Layers size={13} /> {mapType === 'satellite' ? 'Roadmap' : 'Satellite'}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="dash-kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Mapped',  value:stats.total,      color:'var(--brand)' },
          { label:'Pending',       value:stats.pending,    color:'#EF4444' },
          { label:'In Progress',   value:stats.inProgress, color:'#F59E0B' },
          { label:'Resolved',      value:stats.resolved,   color:'#10B981' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'12px 16px' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>{s.label}</p>
            <p style={{ fontSize:'1.5rem', fontWeight:800, color:s.color, lineHeight:1 }}>
              {isLoading ? '…' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="card animate-fade-up" style={{ padding:16 }}>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ position:'relative', flex:'1 1 200px' }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)', pointerEvents:'none' }} />
              <input
                className="input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search resident or address…"
                style={{ paddingLeft:30, fontSize:12 }}
              />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:4 }}>Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize:12, padding:'6px 10px', width:140 }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:4 }}>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ fontSize:12, padding:'6px 10px', width:140 }}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:4 }}>From</label>
              <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize:12, padding:'6px 10px', width:140 }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:4 }}>To</label>
              <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ fontSize:12, padding:'6px 10px', width:140 }} />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-ghost" style={{ fontSize:12, gap:5, color:'var(--red)' }}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Map area ── */}
      {/* NOTE: position:relative on the wrapper, NOT overflow:hidden — legend must not be clipped */}
      <div style={{ position:'relative', borderRadius:14, boxShadow:'var(--shadow-sm)', border:'1px solid var(--border)' }}>

        {/* Loading badge */}
        {isLoading && (
          <div style={{ position:'absolute', top:12, right:12, zIndex:20,
            background:'rgba(255,255,255,.92)', borderRadius:8, padding:'5px 11px',
            display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-3)',
            boxShadow:'0 2px 8px rgba(0,0,0,.1)', backdropFilter:'blur(4px)' }}>
            <div style={{ width:11, height:11, borderRadius:'50%', border:'2px solid #e2e8f0', borderTopColor:'var(--brand)', animation:'spin .65s linear infinite' }} />
            Loading…
          </div>
        )}

        {/* Legend — outside overflow:hidden so it's never clipped */}
        <div style={{
          position:'absolute', bottom:20, left:16, zIndex:20,
          background:'rgba(255,255,255,.96)', backdropFilter:'blur(8px)',
          borderRadius:10, padding:'10px 14px',
          boxShadow:'0 2px 14px rgba(0,0,0,.14)',
          border:'1px solid rgba(226,232,240,.9)',
        }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Legend</p>
          {LEGEND_ITEMS.map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
              <div style={{ width:11, height:11, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:l.color, border:'1.5px solid white', boxShadow:'0 1px 3px rgba(0,0,0,.2)', flexShrink:0 }} />
              <span style={{ fontSize:11, color:'#334155', fontWeight:500 }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Map div or fallback */}
        {mapError === 'NO_API_KEY' ? (
          <MapFallback markers={markers} />
        ) : mapError ? (
          <div style={{ height:520, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, background:'#f8fafc', borderRadius:14 }}>
            <MapPin size={32} style={{ color:'#94a3b8' }} />
            <p style={{ fontSize:14, fontWeight:600, color:'var(--text-2)' }}>Map failed to load</p>
            <p style={{ fontSize:12, color:'var(--text-4)' }}>{mapError}</p>
            <button onClick={() => { setMapError(null); setMapReady(false); gmaps.loaded=false; gmaps.loading=false; gmaps.promise=null; }} className="btn btn-outline" style={{ fontSize:12 }}>
              Retry
            </button>
          </div>
        ) : (
          <div
            ref={mapDivRef}
            style={{ width:'100%', height:520, minHeight:400, borderRadius:14 }}
          />
        )}
      </div>

      {/* ── Selected ticket detail ── */}
      {selected && (
        <div className="card animate-fade-up" style={{ padding:20 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:MARKER_COLOR[selected.status]||'#64748b', flexShrink:0 }} />
              <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'var(--brand)' }}>{selected.tracking_id}</span>
              <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99,
                background:`${MARKER_COLOR[selected.status]||'#64748b'}22`,
                color:MARKER_COLOR[selected.status]||'#64748b',
                border:`1px solid ${MARKER_COLOR[selected.status]||'#64748b'}44` }}>
                {selected.status}
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ width:28, height:28, padding:0, justifyContent:'center' }}>
              <X size={14} />
            </button>
          </div>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:12 }}>{selected.title}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
            {[
              { label:'Resident',  value:selected.resident_name },
              { label:'Category',  value:selected.category },
              { label:'Location',  value:selected.location },
              { label:'Submitted', value:selected.submitted },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding:'10px 12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:10, fontWeight:600, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>{label}</p>
                <p style={{ fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
