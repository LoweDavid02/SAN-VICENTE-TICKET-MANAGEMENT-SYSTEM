/**
 * ComplaintMap — Real interactive map using Leaflet + OpenStreetMap.
 *
 * NO API KEY REQUIRED — works immediately in production.
 * Uses react-leaflet for React integration.
 *
 * Features:
 * - Real OpenStreetMap tiles (satellite via Esri World Imagery)
 * - Toggle: Street view ↔ Satellite view
 * - Colored SVG markers: 🔴 Pending, 🟡 In Progress, 🟢 Completed
 * - Click marker → popup with full ticket details
 * - Filters: status, category, date range, search (debounced)
 * - Stats strip, legend, refresh
 * - Centered on Barangay San Vicente, Apalit, Pampanga
 * - Smooth zoom, pan, scroll wheel — fully interactive
 */

import { useState, useMemo, useEffect } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
  useMap, LayersControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, RefreshCw, Layers, Filter, X, MapPin, Navigation } from 'lucide-react';
import { useMapTickets } from '../../../hooks/useTicketApi';
import { useDebounce } from '../../../hooks/useDebounce';

// ── Fix Leaflet default icon path broken by Vite bundling ────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Constants ─────────────────────────────────────────────────────────────
const CENTER = [14.9456, 120.7558]; // Brgy. San Vicente, Apalit, Pampanga
const ZOOM   = 15;

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

// ── Tile layer URLs ───────────────────────────────────────────────────────
const TILES = {
  street: {
    url:         'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:     19,
  },
  satellite: {
    url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom:     19,
  },
};

// ── Custom SVG marker icon factory ────────────────────────────────────────
function createMarkerIcon(color, isSelected = false) {
  const size   = isSelected ? 36 : 30;
  const shadow = isSelected ? '0 4px 12px rgba(0,0,0,.4)' : '0 2px 6px rgba(0,0,0,.3)';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 30 39">
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 24 15 24S30 25.5 30 15C30 6.716 23.284 0 15 0z"
            fill="${color}" stroke="white" stroke-width="2" filter="url(#s)"/>
      <circle cx="15" cy="15" r="6" fill="white" opacity="0.95"/>
      <circle cx="15" cy="15" r="3" fill="${color}" opacity="0.7"/>
    </svg>`;

  return L.divIcon({
    html:        `<div style="filter:drop-shadow(${shadow})">${svg}</div>`,
    className:   '',
    iconSize:    [size, Math.round(size * 1.3)],
    iconAnchor:  [size / 2, Math.round(size * 1.3)],
    popupAnchor: [0, -Math.round(size * 1.3)],
  });
}

// ── Recenter map button ───────────────────────────────────────────────────
function RecenterButton() {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(CENTER, ZOOM)}
      title="Recenter to Barangay San Vicente"
      style={{
        position: 'absolute', bottom: 90, right: 12, zIndex: 1000,
        width: 36, height: 36, borderRadius: 8,
        background: 'white', border: '2px solid rgba(0,0,0,.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,.15)',
        transition: 'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
      onMouseLeave={e => e.currentTarget.style.background = 'white'}
    >
      <Navigation size={16} style={{ color: '#334155' }} />
    </button>
  );
}

// ── Popup content component ───────────────────────────────────────────────
function TicketPopup({ ticket }) {
  const sc  = MARKER_COLOR[ticket.status] || '#64748b';
  const cat = (ticket.category || '').charAt(0).toUpperCase() + (ticket.category || '').slice(1);

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', minWidth: 220, maxWidth: 280 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#22a83a' }}>
          {ticket.tracking_id}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
          background: `${sc}22`, color: sc, border: `1px solid ${sc}44`,
        }}>
          {ticket.status}
        </span>
      </div>

      {/* Title */}
      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.35 }}>
        {ticket.title}
      </p>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
        {[
          { label: 'Resident', value: ticket.resident_name },
          { label: 'Category', value: cat },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: '5px 7px', borderRadius: 5, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 2px' }}>{label}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', margin: 0 }}>{value || '—'}</p>
          </div>
        ))}
      </div>

      {/* Address */}
      <div style={{ padding: '5px 7px', borderRadius: 5, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 2px' }}>Address</p>
        <p style={{ fontSize: 11, color: '#334155', margin: 0 }}>{ticket.location}</p>
      </div>

      {/* Severity + Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
          background: ticket.severity === 'High' ? '#fef2f2' : ticket.severity === 'Medium' ? '#fffbeb' : '#ecfdf5',
          color: ticket.severity === 'High' ? '#dc2626' : ticket.severity === 'Medium' ? '#d97706' : '#059669',
        }}>
          {ticket.severity || 'Medium'} severity
        </span>
        <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>
          {ticket.submitted}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function ComplaintMap() {
  const [tileType,    setTileType]    = useState('satellite');
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

  const tile = TILES[tileType];

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            Complaint Map
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>
            Live geospatial view — Barangay San Vicente, Apalit, Pampanga
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
            onClick={() => setTileType(t => t === 'satellite' ? 'street' : 'satellite')}
            className="btn btn-outline"
            style={{ fontSize: 12, gap: 6 }}
          >
            <Layers size={13} />
            {tileType === 'satellite' ? 'Street View' : 'Satellite'}
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="dash-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Mapped',  value: stats.total,      color: 'var(--brand)' },
          { label: 'Pending',       value: stats.pending,    color: '#EF4444' },
          { label: 'In Progress',   value: stats.inProgress, color: '#F59E0B' },
          { label: 'Resolved',      value: stats.resolved,   color: '#10B981' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '12px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {isLoading ? '…' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="card animate-fade-up" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize: 12, padding: '6px 10px', width: 150 }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ fontSize: 12, padding: '6px 10px', width: 150 }}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>From</label>
              <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize: 12, padding: '6px 10px', width: 140 }} />
            </div>
            <div>
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

      {/* ── Map ── */}
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.12)', border: '1px solid var(--border)' }}>

        {/* Loading overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute', top: 12, right: 56, zIndex: 1000,
            background: 'rgba(255,255,255,.95)', borderRadius: 8, padding: '5px 12px',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155',
            boxShadow: '0 2px 8px rgba(0,0,0,.12)', backdropFilter: 'blur(4px)',
          }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: 'var(--brand)', animation: 'spin .65s linear infinite' }} />
            Updating…
          </div>
        )}

        {/* Legend overlay */}
        <div style={{
          position: 'absolute', bottom: 28, left: 12, zIndex: 1000,
          background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(8px)',
          borderRadius: 10, padding: '10px 14px',
          boxShadow: '0 2px 16px rgba(0,0,0,.15)',
          border: '1px solid rgba(226,232,240,.9)',
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Legend</p>
          {LEGEND_ITEMS.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{
                width: 11, height: 11, borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)', background: l.color,
                border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,.2)', flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: '#334155', fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Marker count badge */}
        {markers.length > 0 && (
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 1000,
            background: 'rgba(255,255,255,.95)', borderRadius: 8, padding: '5px 12px',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#334155',
            boxShadow: '0 2px 8px rgba(0,0,0,.12)',
          }}>
            <MapPin size={13} style={{ color: 'var(--brand)' }} />
            {markers.length} complaint{markers.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* THE REAL MAP */}
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          style={{ height: 560, width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
          attributionControl={true}
        >
          {/* Tile layer — switches between satellite and street */}
          <TileLayer
            key={tileType}
            url={tile.url}
            attribution={tile.attribution}
            maxZoom={tile.maxZoom}
          />

          {/* Recenter button */}
          <RecenterButton />

          {/* Complaint markers */}
          {markers.map((ticket) => {
            if (ticket.latitude == null || ticket.longitude == null) return null;
            const isSelected = selected?.id === ticket.id;
            const icon = createMarkerIcon(
              MARKER_COLOR[ticket.status] || '#EF4444',
              isSelected
            );

            return (
              <Marker
                key={ticket.id}
                position={[Number(ticket.latitude), Number(ticket.longitude)]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelected(ticket),
                  popupclose: () => setSelected(null),
                }}
              >
                <Popup
                  maxWidth={290}
                  className="complaint-popup"
                  closeButton={true}
                >
                  <TicketPopup ticket={ticket} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* ── Selected ticket detail card ── */}
      {selected && (
        <div className="card animate-fade-up" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: MARKER_COLOR[selected.status] || '#64748b', flexShrink: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>{selected.tracking_id}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                background: `${MARKER_COLOR[selected.status] || '#64748b'}22`,
                color: MARKER_COLOR[selected.status] || '#64748b',
                border: `1px solid ${MARKER_COLOR[selected.status] || '#64748b'}44`,
              }}>
                {selected.status}
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ width: 28, height: 28, padding: 0, justifyContent: 'center' }}>
              <X size={14} />
            </button>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>{selected.title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
            {[
              { label: 'Resident',  value: selected.resident_name },
              { label: 'Category',  value: selected.category },
              { label: 'Location',  value: selected.location },
              { label: 'Submitted', value: selected.submitted },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaflet popup custom styles */}
      <style>{`
        .complaint-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,.15) !important;
          border: 1px solid #e2e8f0 !important;
          padding: 0 !important;
        }
        .complaint-popup .leaflet-popup-content {
          margin: 14px 16px !important;
        }
        .complaint-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,.15) !important;
        }
        .leaflet-control-zoom a {
          border-radius: 6px !important;
          border: none !important;
          color: #334155 !important;
          font-size: 16px !important;
          line-height: 30px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,.7) !important;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}
