# Mapbox Integration Guide

## Overview

This project uses **Mapbox GL JS** for interactive, high-performance mapping with custom styling, geolocation, and geofencing capabilities.

## Features Implemented

### ✅ Core Features
- **Custom Mapbox Map Component** with production-ready architecture
- **Interactive Markers** with status-based colors and popups
- **Geolocation** with user location tracking
- **Geofencing** with Barangay San Vicente boundary detection
- **Custom Controls** (navigation, geolocate, fit bounds)
- **Lazy Loading** for optimal performance
- **Mobile Responsive** design
- **Error Handling** and loading states

### 🎨 Custom Styling
- Mapbox Streets v12 base style
- Custom marker colors by ticket status:
  - 🔴 Pending: `#EF4444`
  - 🟠 In Progress: `#F59E0B`
  - 🟢 Completed: `#10B981`
  - ⚫ Rejected: `#6B7280`
- Teal accent color (`#14b8a6`) for branding
- Barangay boundary overlay with dashed line

### 📍 Geofencing
- Polygon boundary for Barangay San Vicente
- Real-time detection if user is inside/outside boundary
- Visual alert when outside service area
- Utilities for distance calculation and boundary snapping

## File Structure

```
REACT-FRONT-END/
├── src/
│   ├── components/
│   │   └── Map/
│   │       ├── index.js           # Lazy-loaded wrapper
│   │       └── MapboxMap.jsx      # Main Mapbox component
│   ├── hooks/
│   │   └── useGeolocation.js      # Geolocation hook
│   ├── utils/
│   │   └── geofencing.js          # Geofencing utilities
│   └── pages/
│       └── Dashboard.jsx          # Updated to use Mapbox
├── .env                           # Development environment variables
├── .env.production                # Production environment variables
└── vite.config.js                 # Build configuration with Mapbox chunking
```

## Setup Instructions

### 1. Get Mapbox Access Token

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up or log in
3. Navigate to **Access Tokens**
4. Click **Create a token**
5. Use default public scopes (no special permissions needed)
6. Copy the token

### 2. Configure Environment Variables

**Development (.env):**
```bash
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxx
```

**Production (.env.production):**
```bash
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxx
```

### 3. Install Dependencies (Already Done)

Dependencies are already in `package.json`:
```json
{
  "mapbox-gl": "^3.1.2",
  "react-map-gl": "^7.1.7",
  "@turf/turf": "^7.0.0"
}
```

### 4. Start Development Server

```bash
cd REACT-FRONT-END
npm run dev
```

## Component Usage

### Basic Usage

```jsx
import Map from '../components/Map';

function MyComponent() {
  const tickets = [
    {
      tracking_id: 'TKT-001',
      title: 'Street Light Repair',
      status: 'Pending',
      latitude: 14.9467,
      longitude: 120.7548,
      location: 'Main Street',
      resident_name: 'Juan Dela Cruz',
    },
  ];

  const handleTicketClick = (ticket) => {
    console.log('Clicked ticket:', ticket);
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Map tickets={tickets} onTicketClick={handleTicketClick} />
    </div>
  );
}
```

### Advanced Usage with Geolocation

```jsx
import { MapboxMap } from '../components/Map';
import { useGeolocation } from '../hooks/useGeolocation';
import { isPointInBoundary } from '../utils/geofencing';

function AdvancedMap() {
  const { location, error, isLoading } = useGeolocation({
    enableHighAccuracy: true,
    watch: true, // Continuously track user location
  });

  const isInside = location 
    ? isPointInBoundary([location.longitude, location.latitude])
    : true;

  return (
    <div>
      {!isInside && (
        <div className="alert alert-warning">
          You are outside the service area
        </div>
      )}
      <MapboxMap tickets={tickets} />
    </div>
  );
}
```

## API Reference

### MapboxMap Component

**Props:**
- `tickets` (Array): Array of ticket objects with `latitude`, `longitude`, `status`, etc.
- `onTicketClick` (Function): Callback when a marker is clicked
- `className` (String): Additional CSS classes

**Ticket Object Structure:**
```typescript
{
  tracking_id: string;
  title: string;
  status: 'Pending' | 'Under Review' | 'In Progress' | 'Completed' | 'Rejected';
  latitude: number;
  longitude: number;
  location?: string;
  resident_name?: string;
}
```

### useGeolocation Hook

**Options:**
```typescript
{
  enableHighAccuracy?: boolean; // Default: true
  timeout?: number;             // Default: 10000ms
  maximumAge?: number;          // Default: 0
  watch?: boolean;              // Default: false
}
```

**Returns:**
```typescript
{
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
  } | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
}
```

### Geofencing Utilities

```javascript
import {
  isPointInBoundary,
  distanceToBoundary,
  getNearestBoundaryPoint,
  isValidTicketLocation,
  filterTicketsByBoundary,
  getBoundaryStats,
  snapToBoundary,
} from '../utils/geofencing';

// Check if point is inside boundary
const inside = isPointInBoundary([120.7548, 14.9467]);

// Get distance to boundary (negative if inside, positive if outside)
const distance = distanceToBoundary([120.7548, 14.9467]);

// Get nearest point on boundary
const nearest = getNearestBoundaryPoint([120.7548, 14.9467]);

// Validate ticket location
const valid = isValidTicketLocation(ticket);

// Filter tickets by boundary
const insideTickets = filterTicketsByBoundary(tickets, true);
const outsideTickets = filterTicketsByBoundary(tickets, false);

// Get boundary statistics
const stats = getBoundaryStats(tickets);
// Returns: { inside: 45, outside: 3, invalid: 2 }

// Snap point to boundary if within 100m
const snapped = snapToBoundary([120.7548, 14.9467], 100);
```

## Performance Optimizations

### 1. Lazy Loading
The map component is lazy-loaded using React's `lazy()` and `Suspense`:
```jsx
const MapboxMap = lazy(() => import('./MapboxMap'));
```

### 2. Code Splitting
Vite automatically splits Mapbox into separate chunks:
- `vendor-mapbox.js` - Mapbox GL JS + react-map-gl (~600KB)
- `vendor-geo.js` - Turf.js geospatial utilities (~200KB)

### 3. Memoization
Components use `React.memo()` to prevent unnecessary re-renders:
- `TicketMarker` - Only re-renders when ticket data changes
- `TicketPopup` - Only re-renders when selected ticket changes
- `GeofenceAlert` - Only re-renders when boundary status changes

### 4. Efficient State Management
- `useCallback` for event handlers
- `useRef` for map instance (no re-renders)
- Minimal state updates

### 5. Optimized Dependencies
```javascript
optimizeDeps: {
  include: ['mapbox-gl', 'react-map-gl'],
  exclude: ['@turf/turf'], // Load on demand
}
```

## Customization

### Change Map Style

Edit `MapboxMap.jsx`:
```javascript
// Available styles:
// - mapbox://styles/mapbox/streets-v12 (default)
// - mapbox://styles/mapbox/outdoors-v12
// - mapbox://styles/mapbox/light-v11
// - mapbox://styles/mapbox/dark-v11
// - mapbox://styles/mapbox/satellite-v9
// - mapbox://styles/mapbox/satellite-streets-v12

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11';
```

### Change Marker Colors

Edit `MapboxMap.jsx`:
```javascript
const MARKER_COLORS = {
  'Pending': '#EF4444',      // Red
  'In Progress': '#3B82F6',  // Blue
  'Completed': '#10B981',    // Green
  'Rejected': '#6B7280',     // Gray
};
```

### Change Boundary Style

Edit `MapboxMap.jsx`:
```javascript
const boundaryLayerStyle = {
  id: 'barangay-boundary',
  type: 'line',
  paint: {
    'line-color': '#14b8a6',    // Teal
    'line-width': 3,
    'line-opacity': 1,
    'line-dasharray': [4, 2],   // Dash pattern
  },
};
```

### Add Custom Controls

```jsx
import { FullscreenControl, ScaleControl } from 'react-map-gl';

<Map>
  <FullscreenControl position="top-left" />
  <ScaleControl position="bottom-left" />
</Map>
```

## Troubleshooting

### Map Not Showing

1. **Check Mapbox token:**
   ```bash
   echo $VITE_MAPBOX_TOKEN
   ```

2. **Verify token in browser console:**
   ```javascript
   console.log(import.meta.env.VITE_MAPBOX_TOKEN);
   ```

3. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for Mapbox-related errors

### Geolocation Not Working

1. **Check HTTPS:** Geolocation requires HTTPS (or localhost)
2. **Check permissions:** Browser may block location access
3. **Check browser console:** Look for permission errors

### Markers Not Showing

1. **Verify ticket data:**
   ```javascript
   console.log('Tickets:', tickets);
   ```

2. **Check coordinates:**
   - Latitude: 14.938 to 14.956
   - Longitude: 120.747 to 120.763

3. **Verify ticket structure:**
   ```javascript
   {
     latitude: 14.9467,  // Must be number, not string
     longitude: 120.7548, // Must be number, not string
   }
   ```

### Performance Issues

1. **Limit visible markers:**
   ```javascript
   const visibleTickets = tickets.slice(0, 100);
   ```

2. **Use clustering for many markers:**
   ```bash
   npm install supercluster
   ```

3. **Disable animations:**
   ```javascript
   <Map
     mapStyle={MAPBOX_STYLE}
     fadeDuration={0}
     attributionControl={false}
   />
   ```

## Migration from Leaflet

The old Leaflet implementation has been replaced with Mapbox. Key differences:

| Feature | Leaflet | Mapbox |
|---------|---------|--------|
| Bundle Size | ~150KB | ~600KB |
| Performance | Good | Excellent |
| 3D Support | No | Yes |
| Custom Styles | Limited | Full control |
| Vector Tiles | No | Yes |
| WebGL | No | Yes |

**To remove Leaflet completely:**
```bash
npm uninstall leaflet react-leaflet
```

Then remove from `vite.config.js`:
```javascript
// Remove this chunk:
if (id.includes('leaflet') || id.includes('react-leaflet')) {
  return 'vendor-leaflet';
}
```

## Production Deployment

### 1. Set Environment Variables on Render

In your Render dashboard:
1. Go to your service
2. Navigate to **Environment**
3. Add:
   ```
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx
   ```

### 2. Build and Deploy

```bash
npm run build
npm run preview  # Test production build locally
```

### 3. Verify Deployment

1. Open deployed app
2. Check map loads correctly
3. Test geolocation
4. Test marker interactions
5. Check browser console for errors

## Best Practices

### 1. Token Security
- ✅ Use environment variables
- ✅ Restrict token to specific URLs in Mapbox dashboard
- ❌ Never commit tokens to Git

### 2. Performance
- ✅ Lazy load map component
- ✅ Use code splitting
- ✅ Memoize components
- ✅ Limit visible markers
- ❌ Don't load map on every page

### 3. User Experience
- ✅ Show loading states
- ✅ Handle errors gracefully
- ✅ Provide fallback for no geolocation
- ✅ Make controls accessible
- ❌ Don't auto-zoom without user action

### 4. Accessibility
- ✅ Add ARIA labels to controls
- ✅ Provide keyboard navigation
- ✅ Use semantic HTML
- ✅ Test with screen readers

## Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [react-map-gl Documentation](https://visgl.github.io/react-map-gl/)
- [Turf.js Documentation](https://turfjs.org/)
- [Mapbox Studio](https://studio.mapbox.com/) - Create custom styles
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables
3. Test with minimal example
4. Check Mapbox status: [https://status.mapbox.com/](https://status.mapbox.com/)

## License

Mapbox GL JS is licensed under the Mapbox Terms of Service. Free tier includes:
- 50,000 map loads per month
- Unlimited API requests
- No credit card required

For production use, review [Mapbox Pricing](https://www.mapbox.com/pricing/).
