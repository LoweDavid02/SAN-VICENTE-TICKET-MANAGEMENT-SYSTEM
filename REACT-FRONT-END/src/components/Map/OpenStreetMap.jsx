import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MapPin, Navigation, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { isPointInBoundary, BARANGAY_BOUNDARY } from '../../utils/geofencing';
import './mapbox.css';

// San Vicente center and bounds
const BRGY_CENTER = [14.9467, 120.7548]; // [lat, lng] for Leaflet
const BRGY_BOUNDS = [
  [14.938, 120.747],  // SW
  [14.956, 120.763],  // NE
];

// Marker colors by status
const MARKER_COLORS = {
  'Pending': '#EF4444',
  'Under Review': '#F59E0B',
  'In Progress': '#F59E0B',
  'Completed': '#10B981',
  'Rejected': '#6B7280',
};

/**
 * GeofenceAlert component
 */
const GeofenceAlert = memo(({ isInside }) => {
  if (isInside) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: 'rgba(239, 68, 68, 0.95)',
      color: 'white',
      padding: '10px 16px',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      animation: 'slideDown 0.3s ease-out',
    }}>
      <AlertCircle size={16} />
      <span>You are outside San Vicente</span>
    </div>
  );
});

GeofenceAlert.displayName = 'GeofenceAlert';

/**
 * Main OpenStreetMap component with Leaflet
 * 100% FREE - No API key required, no sign-up, unlimited usage
 */
export default function OpenStreetMap({ tickets = [], onTicketClick, className = '' }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const mapObjRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Geolocation hook
  const { location, error: geoError, isLoading: geoLoading } = useGeolocation();
  
  // Check if user is inside barangay boundary
  const [isInsideBoundary, setIsInsideBoundary] = useState(true);
  
  useEffect(() => {
    if (location) {
      const inside = isPointInBoundary([location.longitude, location.latitude]);
      setIsInsideBoundary(inside);
    }
  }, [location]);
  
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
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        center: BRGY_CENTER,
        zoom: 15,
        minZoom: 13,
        maxZoom: 19,
        zoomControl: false, // We'll add custom controls
        scrollWheelZoom: false,
        doubleClickZoom: true,
        attributionControl: true,
        maxBounds: BRGY_BOUNDS,
        maxBoundsViscosity: 0.8,
      });

      // Fit the view exactly to the barangay bounds on load
      map.fitBounds(BRGY_BOUNDS, { padding: [20, 20] });

      // OpenStreetMap tiles - 100% FREE, no API key required
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Barangay boundary polygon
      L.geoJSON({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [BARANGAY_BOUNDARY],
          },
        }],
      }, {
        style: {
          color: '#14b8a6',
          weight: 2.5,
          opacity: 0.8,
          fillColor: '#14b8a6',
          fillOpacity: 0.05,
          dashArray: '6 4',
        },
      }).addTo(map);

      mapObjRef.current = map;
      if (!cancelled) setReady(true);
    });
    
    return () => {
      cancelled = true;
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, []);
  
  // Add/update ticket markers
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapObjRef.current;
    if (!L || !map || !ready) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    tickets.forEach((ticket) => {
      if (ticket.latitude == null || ticket.longitude == null) return;
      
      const color = MARKER_COLORS[ticket.status] || '#EF4444';
      const isSelected = selectedTicket?.tracking_id === ticket.tracking_id;
      const size = isSelected ? 18 : 14;
      
      const dot = `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        border:2.5px solid white;
        box-shadow:0 0 0 2px ${color}55, 0 2px 6px rgba(0,0,0,.35);
        cursor:pointer;
        transition:transform .15s;
      " onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'"></div>`;
      
      const icon = L.divIcon({
        html: dot,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -10],
      });
      
      const statusColor = MARKER_COLORS[ticket.status] || '#64748b';
      const marker = L.marker([Number(ticket.latitude), Number(ticket.longitude)], { icon })
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;padding:2px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="font-family:monospace;font-size:11px;font-weight:700;color:#14b8a6">${ticket.tracking_id}</span>
              <span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:99px;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44">${ticket.status}</span>
            </div>
            <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 6px;line-height:1.3">${ticket.title}</p>
            <p style="font-size:11px;color:#64748b;margin:0 0 3px">📍 ${ticket.location || '—'}</p>
            <p style="font-size:11px;color:#64748b;margin:0">👤 ${ticket.resident_name || '—'}</p>
          </div>
        `, { maxWidth: 260 })
        .on('click', () => {
          setSelectedTicket(ticket);
          if (onTicketClick) onTicketClick(ticket);
        })
        .addTo(map);
      
      markersRef.current.push(marker);
    });
  }, [tickets, ready, selectedTicket, onTicketClick]);
  
  // Add/update user location marker
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapObjRef.current;
    if (!L || !map || !ready || !location) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create user location marker (blue dot)
    const userIcon = L.divIcon({
      html: `<div style="
        width:16px;height:16px;border-radius:50%;
        background:#3B82F6;
        border:3px solid white;
        box-shadow:0 0 0 2px #3B82F655, 0 2px 8px rgba(0,0,0,.4);
      "></div>`,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    userMarkerRef.current = L.marker([location.latitude, location.longitude], { icon: userIcon })
      .bindPopup('📍 You are here')
      .addTo(map);
  }, [location, ready]);
  
  // Fly to user location
  const flyToUserLocation = useCallback(() => {
    if (location && mapObjRef.current) {
      mapObjRef.current.flyTo([location.latitude, location.longitude], 17, {
        duration: 1.5,
      });
    }
  }, [location]);
  
  // Fit bounds to show all tickets
  const fitBoundsToTickets = useCallback(() => {
    if (tickets.length === 0 || !mapObjRef.current) return;
    
    const validTickets = tickets.filter(t => t.latitude && t.longitude);
    if (validTickets.length === 0) return;
    
    const bounds = validTickets.map(t => [Number(t.latitude), Number(t.longitude)]);
    mapObjRef.current.fitBounds(bounds, { padding: [60, 60], duration: 1 });
  }, [tickets]);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);
  
  return (
    <div 
      style={{ 
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '100%',
        zIndex: isFullscreen ? 9999 : 1,
      }} 
      className={className}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Geofence alert */}
      <GeofenceAlert isInside={isInsideBoundary} />
      
      {/* Custom controls */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
      }}>
        {/* Zoom controls */}
        <div style={{
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => mapObjRef.current?.zoomIn()}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              background: 'white',
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            title="Zoom in"
          >
            +
          </button>
          <div style={{ height: 1, background: 'rgba(0,0,0,0.1)' }} />
          <button
            onClick={() => mapObjRef.current?.zoomOut()}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              background: 'white',
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            title="Zoom out"
          >
            −
          </button>
        </div>
        
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'white',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={18} color="#14b8a6" /> : <Maximize2 size={18} color="#14b8a6" />}
        </button>
      </div>
      
      {/* Bottom controls */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
      }}>
        {location && (
          <button
            onClick={flyToUserLocation}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Go to my location"
          >
            <Navigation size={18} color="#14b8a6" />
          </button>
        )}
        
        {tickets.length > 0 && (
          <button
            onClick={fitBoundsToTickets}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Show all tickets"
          >
            <MapPin size={18} color="#14b8a6" />
          </button>
        )}
      </div>
      
      {/* Loading indicator */}
      {!ready && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
          zIndex: 999,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: '#14b8a6',
              animation: 'spin 0.65s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              Loading map...
            </span>
          </div>
        </div>
      )}
      
      {/* Geolocation loading */}
      {geoLoading && (
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(255,255,255,0.95)',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 12,
          color: '#64748b',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          Getting your location...
        </div>
      )}
      
      {/* Geolocation error */}
      {geoError && (
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          {geoError}
        </div>
      )}
    </div>
  );
}
