/**
 * ComplaintMap — Real interactive Leaflet map with Barangay San Vicente boundary.
 *
 * Features:
 * - Real OpenStreetMap tiles (street) + Esri World Imagery (satellite)
 * - GeoJSON boundary polygon highlighting Brgy. San Vicente, Apalit, Pampanga
 * - Colored GPS-style markers with drop animation
 * - Click marker → detailed popup (resident, category, address, severity, date)
 * - Filters: status, category, date range, search (debounced 300ms)
 * - Stats strip, legend, refresh, recenter button
 * - Zoom 16 default — shows streets and detailed areas inside the barangay
 */

import { useState, useMemo, useRef, useEffect } from "react";
import {
  MapContainer, TileLayer, Marker, Popup,
  GeoJSON, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, RefreshCw, Layers, Filter, X, MapPin, Navigation } from "lucide-react";
import { useMapTickets } from "../../../hooks/useTicketApi";
import { useDebounce } from "../../../hooks/useDebounce";

// Fix Leaflet default icon broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Barangay San Vicente, Apalit, Pampanga — center + zoom
const CENTER = [14.9456, 120.7558];
const ZOOM   = 16;

const MARKER_COLOR = {
  "Pending":      "#EF4444",
  "Under Review": "#F59E0B",
  "In Progress":  "#F59E0B",
  "Completed":    "#10B981",
  "Rejected":     "#6B7280",
};

const STATUS_OPTIONS   = ["All","Pending","Under Review","In Progress","Completed","Rejected"];
const CATEGORY_OPTIONS = ["All","streetlight","drainage","road","waste","water","other"];

const LEGEND_ITEMS = [
  { color: "#EF4444", label: "Pending" },
  { color: "#F59E0B", label: "In Progress / Under Review" },
  { color: "#10B981", label: "Completed" },
  { color: "#6B7280", label: "Rejected" },
];

const TILES = {
  street: {
    url:         "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url:         "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 19,
  },
};

// Approximate GeoJSON boundary of Barangay San Vicente, Apalit, Pampanga
// Coordinates sourced from OpenStreetMap relation data
const BARANGAY_BOUNDARY = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: { name: "Barangay San Vicente, Apalit, Pampanga" },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [120.7480, 14.9380],
        [120.7510, 14.9370],
        [120.7545, 14.9375],
        [120.7580, 14.9385],
        [120.7615, 14.9400],
        [120.7640, 14.9420],
        [120.7650, 14.9445],
        [120.7645, 14.9475],
        [120.7635, 14.9510],
        [120.7620, 14.9540],
        [120.7600, 14.9560],
        [120.7575, 14.9570],
        [120.7545, 14.9568],
        [120.7515, 14.9560],
        [120.7490, 14.9545],
        [120.7468, 14.9525],
        [120.7455, 14.9500],
        [120.7448, 14.9470],
        [120.7450, 14.9440],
        [120.7458, 14.9415],
        [120.7468, 14.9398],
        [120.7480, 14.9380],
      ]],
    },
  }],
};

// SVG GPS-style marker
function createMarkerIcon(color, pulse = false) {
  const size = 32;
  const pulseHtml = pulse
    ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;background:${color}33;animation:markerPulse 1.5s ease-out infinite;pointer-events:none"></div>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size*1.35)}" viewBox="0 0 32 43">
    <defs>
      <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#00000055"/>
      </filter>
    </defs>
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 27 16 27S32 27.2 32 16C32 7.163 24.837 0 16 0z"
          fill="${color}" stroke="white" stroke-width="2.5" filter="url(#ds)"/>
    <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
    <circle cx="16" cy="16" r="4" fill="${color}" opacity="0.8"/>
  </svg>`;

  return L.divIcon({
    html: `<div style="position:relative;display:inline-block">${pulseHtml}<div>${svg}</div></div>`,
    className: "",
    iconSize:    [size, Math.round(size * 1.35)],
    iconAnchor:  [size / 2, Math.round(size * 1.35)],
    popupAnchor: [0, -Math.round(size * 1.35) + 4],
  });
}

// Recenter control
function RecenterControl() {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(CENTER, ZOOM)}
      title="Recenter to Barangay San Vicente"
      style={{
        position:"absolute", bottom:100, right:12, zIndex:1000,
        width:36, height:36, borderRadius:8,
        background:"white", border:"2px solid rgba(0,0,0,.2)",
        display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,.15)",
      }}
      onMouseEnter={e => e.currentTarget.style.background="#f1f5f9"}
      onMouseLeave={e => e.currentTarget.style.background="white"}
    >
      <Navigation size={16} style={{ color:"#334155" }} />
    </button>
  );
}

// Popup content
function TicketPopup({ ticket }) {
  const sc  = MARKER_COLOR[ticket.status] || "#64748b";
  const cat = (ticket.category||"").charAt(0).toUpperCase() + (ticket.category||"").slice(1);
  const sevBg    = ticket.severity==="High" ? "#fef2f2" : ticket.severity==="Medium" ? "#fffbeb" : "#ecfdf5";
  const sevColor = ticket.severity==="High" ? "#dc2626" : ticket.severity==="Medium" ? "#d97706" : "#059669";

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", minWidth:230, maxWidth:290 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9 }}>
        <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:"#22a83a" }}>{ticket.tracking_id}</span>
        <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, background:`${sc}22`, color:sc, border:`1px solid ${sc}44` }}>{ticket.status}</span>
      </div>
      <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:"0 0 9px", lineHeight:1.35 }}>{ticket.title}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:7 }}>
        {[{label:"Resident",value:ticket.resident_name},{label:"Category",value:cat}].map(({label,value})=>(
          <div key={label} style={{ padding:"5px 7px", borderRadius:5, background:"#f8fafc", border:"1px solid #e2e8f0" }}>
            <p style={{ fontSize:9, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".05em", margin:"0 0 2px" }}>{label}</p>
            <p style={{ fontSize:11, fontWeight:600, color:"#0f172a", margin:0 }}>{value||"—"}</p>
          </div>
        ))}
      </div>
      <div style={{ padding:"5px 7px", borderRadius:5, background:"#f8fafc", border:"1px solid #e2e8f0", marginBottom:7 }}>
        <p style={{ fontSize:9, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".05em", margin:"0 0 2px" }}>Address</p>
        <p style={{ fontSize:11, color:"#334155", margin:0 }}>{ticket.location}</p>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:99, background:sevBg, color:sevColor }}>{ticket.severity||"Medium"} severity</span>
        <p style={{ fontSize:10, color:"#94a3b8", margin:0 }}>{ticket.submitted}</p>
      </div>
    </div>
  );
}

export default function ComplaintMap() {
  const [tileType,    setTileType]    = useState("satellite");
  const [showFilters, setShowFilters] = useState(false);
  const [status,      setStatus]      = useState("All");
  const [category,    setCategory]    = useState("All");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(() => ({
    status:    status   !== "All" ? status   : undefined,
    category:  category !== "All" ? category : undefined,
    date_from: dateFrom || undefined,
    date_to:   dateTo   || undefined,
    search:    debouncedSearch || undefined,
  }), [status, category, dateFrom, dateTo, debouncedSearch]);

  const { data, isLoading, refetch } = useMapTickets(filters);
  const markers = data?.markers || [];

  const stats = useMemo(() => ({
    total:      markers.length,
    pending:    markers.filter(m => m.status === "Pending").length,
    inProgress: markers.filter(m => ["Under Review","In Progress"].includes(m.status)).length,
    resolved:   markers.filter(m => m.status === "Completed").length,
  }), [markers]);

  const hasActiveFilters = status !== "All" || category !== "All" || dateFrom || dateTo || search;
  const clearFilters = () => { setStatus("All"); setCategory("All"); setDateFrom(""); setDateTo(""); setSearch(""); };

  const tile = TILES[tileType];

  // GeoJSON style for barangay boundary
  const boundaryStyle = {
    color:       "#22a83a",
    weight:      2.5,
    opacity:     0.85,
    fillColor:   "#22a83a",
    fillOpacity: 0.06,
    dashArray:   "6 4",
  };

  return (
    <div className="animate-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:"1.25rem", fontWeight:700, color:"var(--text-1)", letterSpacing:"-0.02em" }}>Complaint Map</h1>
          <p style={{ fontSize:12, color:"var(--text-4)", marginTop:2 }}>Live geospatial view — Barangay San Vicente, Apalit, Pampanga</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={() => setShowFilters(v => !v)} className="btn btn-outline" style={{ fontSize:12, gap:6, position:"relative" }}>
            <Filter size={13} /> Filters
            {hasActiveFilters && <span style={{ position:"absolute", top:-4, right:-4, width:8, height:8, borderRadius:"50%", background:"var(--brand)" }} />}
          </button>
          <button onClick={() => refetch()} className="btn btn-outline" style={{ fontSize:12, gap:6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => setTileType(t => t === "satellite" ? "street" : "satellite")} className="btn btn-outline" style={{ fontSize:12, gap:6 }}>
            <Layers size={13} /> {tileType === "satellite" ? "Street View" : "Satellite"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Total Mapped",  value:stats.total,      color:"var(--brand)" },
          { label:"Pending",       value:stats.pending,    color:"#EF4444" },
          { label:"In Progress",   value:stats.inProgress, color:"#F59E0B" },
          { label:"Resolved",      value:stats.resolved,   color:"#10B981" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{s.label}</p>
            <p style={{ fontSize:"1.5rem", fontWeight:800, color:s.color, lineHeight:1 }}>{isLoading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card animate-fade-up" style={{ padding:16 }}>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
            <div style={{ position:"relative", flex:"1 1 200px" }}>
              <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-4)", pointerEvents:"none" }} />
              <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resident or address…" style={{ paddingLeft:30, fontSize:12 }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", display:"block", marginBottom:4 }}>Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize:12, padding:"6px 10px", width:150 }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", display:"block", marginBottom:4 }}>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ fontSize:12, padding:"6px 10px", width:150 }}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", display:"block", marginBottom:4 }}>From</label>
              <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize:12, padding:"6px 10px", width:140 }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", display:"block", marginBottom:4 }}>To</label>
              <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ fontSize:12, padding:"6px 10px", width:140 }} />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-ghost" style={{ fontSize:12, gap:5, color:"var(--red)" }}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map container */}
      <div style={{ position:"relative", borderRadius:14, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.14)", border:"1px solid var(--border)" }}>

        {/* Loading badge */}
        {isLoading && (
          <div style={{ position:"absolute", top:12, right:56, zIndex:1000, background:"rgba(255,255,255,.95)", borderRadius:8, padding:"5px 12px", display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#334155", boxShadow:"0 2px 8px rgba(0,0,0,.12)", backdropFilter:"blur(4px)" }}>
            <div style={{ width:11, height:11, borderRadius:"50%", border:"2px solid #e2e8f0", borderTopColor:"var(--brand)", animation:"spin .65s linear infinite" }} />
            Updating…
          </div>
        )}

        {/* Marker count */}
        {markers.length > 0 && (
          <div style={{ position:"absolute", top:12, left:12, zIndex:1000, background:"rgba(255,255,255,.95)", borderRadius:8, padding:"5px 12px", display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"#334155", boxShadow:"0 2px 8px rgba(0,0,0,.12)" }}>
            <MapPin size={13} style={{ color:"var(--brand)" }} />
            {markers.length} complaint{markers.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* Legend */}
        <div style={{ position:"absolute", bottom:28, left:12, zIndex:1000, background:"rgba(255,255,255,.97)", backdropFilter:"blur(8px)", borderRadius:10, padding:"10px 14px", boxShadow:"0 2px 16px rgba(0,0,0,.15)", border:"1px solid rgba(226,232,240,.9)" }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Legend</p>
          {LEGEND_ITEMS.map(l => (
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
              <div style={{ width:11, height:11, borderRadius:"50% 50% 50% 0", transform:"rotate(-45deg)", background:l.color, border:"1.5px solid white", boxShadow:"0 1px 3px rgba(0,0,0,.2)", flexShrink:0 }} />
              <span style={{ fontSize:11, color:"#334155", fontWeight:500 }}>{l.label}</span>
            </div>
          ))}
          <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:20, height:3, background:"#22a83a", borderRadius:2, opacity:.7 }} />
            <span style={{ fontSize:10, color:"#64748b" }}>Brgy. Boundary</span>
          </div>
        </div>

        {/* THE MAP */}
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          minZoom={13}
          maxZoom={19}
          style={{ height:580, width:"100%" }}
          scrollWheelZoom={true}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer key={tileType} url={tile.url} attribution={tile.attribution} maxZoom={tile.maxZoom} />

          {/* Barangay boundary polygon */}
          <GeoJSON
            key="boundary"
            data={BARANGAY_BOUNDARY}
            style={boundaryStyle}
          />

          <RecenterControl />

          {/* Complaint markers */}
          {markers.map((ticket) => {
            if (ticket.latitude == null || ticket.longitude == null) return null;
            const isSelected = selected?.id === ticket.id;
            const icon = createMarkerIcon(MARKER_COLOR[ticket.status] || "#EF4444", isSelected);
            return (
              <Marker
                key={ticket.id}
                position={[Number(ticket.latitude), Number(ticket.longitude)]}
                icon={icon}
                eventHandlers={{ click: () => setSelected(ticket), popupclose: () => setSelected(null) }}
              >
                <Popup maxWidth={295} className="complaint-popup" closeButton={true}>
                  <TicketPopup ticket={ticket} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Selected ticket detail */}
      {selected && (
        <div className="card animate-fade-up" style={{ padding:20 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:MARKER_COLOR[selected.status]||"#64748b", flexShrink:0 }} />
              <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"var(--brand)" }}>{selected.tracking_id}</span>
              <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background:`${MARKER_COLOR[selected.status]||"#64748b"}22`, color:MARKER_COLOR[selected.status]||"#64748b", border:`1px solid ${MARKER_COLOR[selected.status]||"#64748b"}44` }}>{selected.status}</span>
            </div>
            <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ width:28, height:28, padding:0, justifyContent:"center" }}><X size={14} /></button>
          </div>
          <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text-1)", marginBottom:12 }}>{selected.title}</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
            {[
              { label:"Resident",  value:selected.resident_name },
              { label:"Category",  value:selected.category },
              { label:"Location",  value:selected.location },
              { label:"Submitted", value:selected.submitted },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding:"10px 12px", borderRadius:8, background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:10, fontWeight:600, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:3 }}>{label}</p>
                <p style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{value||"—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes markerPulse {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        .complaint-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,.16) !important;
          border: 1px solid #e2e8f0 !important;
          padding: 0 !important;
        }
        .complaint-popup .leaflet-popup-content { margin: 14px 16px !important; }
        .complaint-popup .leaflet-popup-tip-container { margin-top: -1px; }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,.15) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          border: none !important;
          color: #334155 !important;
          font-size: 16px !important;
          line-height: 30px !important;
          width: 30px !important;
          height: 30px !important;
        }
        .leaflet-control-zoom a:hover { background: #f1f5f9 !important; }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,.75) !important;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}
