import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MapPin, Navigation, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { isPointInBoundary, BARANGAY_BOUNDARY } from '../../utils/geofencing';
import './mapbox.css';

// Barangay San Vicente center and bounds
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

// Barangay boundary layer style
const boundaryLayerStyle = {
  id: 'barangay-boundary',
  type: 'line',
  paint: {
    'line-color': '#14b8a6',
    'line-width': 2.5,
    'line-opacity': 0.8,
    'line-dasharray': [2, 2],
  },
};

const boundaryFillStyle = {
  id: 'barangay-fill',
  type: 'fill',
  paint: {
    'fill-color': '#14b8a6',
    'fill-opacity': 0.05,
  },
};

/**
 * Custom marker component with status-based color
 */
const TicketMarker = memo(({ ticket, onClick, isSelected }) => {
  const color = MARKER_COLORS[ticket.status] || '#EF4444';
  
  return (
    <Marker
      longitude={Number(ticket.longitude)}
      latitude={Number(ticket.latitude)}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(ticket);
      }}
    >
      <div
        style={{
          width: isSelected ? 18 : 14,
          height: isSelected ? 18 : 14,
          borderRadius: '50%',
          backgroundColor: color,
          border: '2.5px solid white',
          boxShadow: `0 0 0 2px ${color}55, 0 2px 6px rgba(0,0,0,0.35)`,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isSelected ? 'scale(1.3)' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isSelected ? 'scale(1.3)' : 'scale(1)';
        }}
      />
    </Marker>
  );
});

TicketMarker.displayName = 'TicketMarker';

/**
 * Custom popup for ticket details
 */
const TicketPopup = memo(({ ticket, onClose }) => {
  const statusColor = MARKER_COLORS[ticket.status] || '#64748b';
  
  return (
    <Popup
      longitude={Number(ticket.longitude)}
      latitude={Number(ticket.latitude)}
      anchor="bottom"
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      maxWidth="280px"
      className="ticket-popup"
    >
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 700,
            color: '#14b8a6',
          }}>
            {ticket.tracking_id}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 99,
            background: `${statusColor}22`,
            color: statusColor,
            border: `1px solid ${statusColor}44`,
          }}>
            {ticket.status}
          </span>
        </div>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 6px',
          lineHeight: 1.3,
        }}>
          {ticket.title}
        </p>
        <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 3px' }}>
          📍 {ticket.location || '—'}
        </p>
        <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
          👤 {ticket.resident_name || '—'}
        </p>
      </div>
    </Popup>
  );
});

TicketPopup.displayName = 'TicketPopup';

/**
 * Geofencing alert component
 */
const GeofenceAlert = memo(({ isInside }) => {
  if (isInside) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
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
      <span>You are outside Barangay San Vicente</span>
    </div>
  );
});

GeofenceAlert.displayName = 'GeofenceAlert';

/**
 * Main Mapbox component with all features
 */
export default function MapboxMap({ tickets = [], onTicketClick, className = '' }) {
  const mapRef = useRef(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: BRGY_CENTER.lng,
    latitude: BRGY_CENTER.lat,
    zoom: 15,
  });
  
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
  
  // Handle ticket marker click
  const handleMarkerClick = useCallback((ticket) => {
    setSelectedTicket(ticket);
    if (onTicketClick) {
      onTicketClick(ticket);
    }
  }, [onTicketClick]);
  
  // Close popup
  const handleClosePopup = useCallback(() => {
    setSelectedTicket(null);
  }, []);
  
  // Fly to user location
  const flyToUserLocation = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 17,
        duration: 1500,
        essential: true,
      });
    }
  }, [location]);
  
  // Fit bounds to show all tickets
  const fitBoundsToTickets = useCallback(() => {
    if (tickets.length === 0 || !mapRef.current) return;
    
    const validTickets = tickets.filter(t => t.latitude && t.longitude);
    if (validTickets.length === 0) return;
    
    const bounds = validTickets.reduce((acc, ticket) => {
      return [
        [
          Math.min(acc[0][0], ticket.longitude),
          Math.min(acc[0][1], ticket.latitude),
        ],
        [
          Math.max(acc[1][0], ticket.longitude),
          Math.max(acc[1][1], ticket.latitude),
        ],
      ];
    }, [
      [validTickets[0].longitude, validTickets[0].latitude],
      [validTickets[0].longitude, validTickets[0].latitude],
    ]);
    
    mapRef.current.fitBounds(bounds, {
      padding: 60,
      duration: 1000,
    });
  }, [tickets]);
  
  // Barangay boundary GeoJSON
  const boundaryGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [BARANGAY_BOUNDARY],
    },
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className={className}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        mapStyle={MAPBOX_STYLE}
        maxBounds={BRGY_BOUNDS}
        minZoom={13}
        maxZoom={19}
        attributionControl={true}
        scrollZoom={false}
        doubleClickZoom={true}
        dragRotate={false}
        touchZoomRotate={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" showCompass={false} />
        
        {/* Geolocate control */}
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showUserHeading={true}
          showAccuracyCircle={true}
        />
        
        {/* Barangay boundary */}
        <Source id="barangay-boundary" type="geojson" data={boundaryGeoJSON}>
          <Layer {...boundaryFillStyle} />
          <Layer {...boundaryLayerStyle} />
        </Source>
        
        {/* Ticket markers */}
        {tickets
          .filter(ticket => ticket.latitude && ticket.longitude)
          .map((ticket) => (
            <TicketMarker
              key={ticket.tracking_id}
              ticket={ticket}
              onClick={handleMarkerClick}
              isSelected={selectedTicket?.tracking_id === ticket.tracking_id}
            />
          ))}
        
        {/* Selected ticket popup */}
        {selectedTicket && (
          <TicketPopup ticket={selectedTicket} onClose={handleClosePopup} />
        )}
      </Map>
      
      {/* Geofence alert */}
      <GeofenceAlert isInside={isInsideBoundary} />
      
      {/* Custom controls */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 10,
      }}>
        {location && (
          <button
            onClick={flyToUserLocation}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'white',
              border: '1px solid rgba(0,0,0,0.1)',
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
              border: '1px solid rgba(0,0,0,0.1)',
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
          zIndex: 10,
        }}>
          Getting your location...
        </div>
      )}
      
      {/* Error indicator */}
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
          zIndex: 10,
        }}>
          {geoError}
        </div>
      )}
    </div>
  );
}
