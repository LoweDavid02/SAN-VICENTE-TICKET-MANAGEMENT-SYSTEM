/**
 * LocationMap.jsx - Interactive Map with Geocoding
 * Uses OpenStreetMap (Leaflet) to display location based on address
 */

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon with blue color
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map view when coordinates change
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

// Known locations in Barangay San Vicente, Apalit, Pampanga
// Add exact coordinates for common locations here
const KNOWN_LOCATIONS = {
  'san vicente barangay hall': { lat: 14.9605, lng: 120.7606, name: 'San Vicente Barangay Hall' },
  'barangay hall': { lat: 14.9605, lng: 120.7606, name: 'San Vicente Barangay Hall' },
  'san vicente': { lat: 14.9605, lng: 120.7606, name: 'Barangay San Vicente' },
  // Add more known locations here with exact coordinates
  // Example:
  // 'san vicente elementary school': { lat: 14.xxxx, lng: 120.xxxx, name: 'San Vicente Elementary School' },
  // 'san vicente chapel': { lat: 14.xxxx, lng: 120.xxxx, name: 'San Vicente Chapel' },
  // 'purok 1': { lat: 14.xxxx, lng: 120.xxxx, name: 'Purok 1, San Vicente' },
};

/**
 * Check if address matches a known location
 * @param {string} address - The address to check
 * @returns {object|null} - Known location or null
 */
function checkKnownLocation(address) {
  const normalized = address.toLowerCase().trim();
  
  // Check for exact match
  if (KNOWN_LOCATIONS[normalized]) {
    return KNOWN_LOCATIONS[normalized];
  }
  
  // Check for partial match
  for (const [key, value] of Object.entries(KNOWN_LOCATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Geocode address using Nominatim (OpenStreetMap)
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lon: number, display_name: string} | null>}
 */
async function geocodeAddress(address) {
  try {
    // First, check if it's a known location
    const knownLocation = checkKnownLocation(address);
    if (knownLocation) {
      console.log(`[LocationMap] Using known location for: ${address}`);
      return {
        lat: knownLocation.lat,
        lon: knownLocation.lng,
        display_name: knownLocation.name
      };
    }
    
    // If not a known location, try geocoding with Nominatim
    // Add "San Vicente, Apalit, Pampanga, Philippines" to improve accuracy
    const searchQuery = `${address}, San Vicente, Apalit, Pampanga, Philippines`;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}` +
      `&format=json` +
      `&limit=1` +
      `&countrycodes=ph` + // Limit to Philippines
      `&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BarangayConnectApp/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export default function LocationMap({ address, height = 300 }) {
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  
  // Default center: Barangay San Vicente, Apalit, Pampanga
  const defaultCenter = [14.9605, 120.7606];
  const defaultZoom = 15;
  
  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Geocode the address
    geocodeAddress(address)
      .then((result) => {
        if (result) {
          setCoordinates({
            lat: result.lat,
            lng: result.lon,
            displayName: result.display_name
          });
        } else {
          setError('Location not found. Showing default area.');
          setCoordinates({
            lat: defaultCenter[0],
            lng: defaultCenter[1],
            displayName: address
          });
        }
      })
      .catch((err) => {
        console.error('Failed to geocode:', err);
        setError('Failed to load map location.');
        setCoordinates({
          lat: defaultCenter[0],
          lng: defaultCenter[1],
          displayName: address
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [address]);
  
  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F3F4F6',
        borderRadius: 12,
        flexDirection: 'column',
        gap: 12
      }}>
        <span className="material-symbols-outlined spinning" style={{ fontSize: 40, color: '#0058be' }}>
          progress_activity
        </span>
        <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Loading map...</p>
      </div>
    );
  }
  
  const center = coordinates ? [coordinates.lat, coordinates.lng] : defaultCenter;
  const zoom = coordinates ? 16 : defaultZoom;
  
  return (
    <div style={{ position: 'relative', width: '100%', height: height, borderRadius: 12, overflow: 'hidden' }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          zIndex: 1000,
          background: 'rgba(251, 191, 36, 0.95)',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          color: '#78350F',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
          {error}
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} zoom={zoom} />
        
        {coordinates && (
          <Marker position={[coordinates.lat, coordinates.lng]} icon={customIcon}>
            <Popup>
              <div style={{ padding: '4px 0' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#000000', marginBottom: 4 }}>
                  {address}
                </p>
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
                  Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map Controls Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 11,
        color: '#374151',
        fontWeight: 500,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#0058be' }}>location_on</span>
        <span>{address}</span>
      </div>
    </div>
  );
}
