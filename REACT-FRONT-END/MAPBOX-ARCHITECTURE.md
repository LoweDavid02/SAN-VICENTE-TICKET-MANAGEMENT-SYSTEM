# Mapbox Integration Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Dashboard.jsx                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Map Component (Lazy)                    │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              MapboxMap.jsx                          │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │         Mapbox GL JS Core                    │  │  │  │
│  │  │  │  • WebGL Rendering                           │  │  │  │
│  │  │  │  • Vector Tiles                              │  │  │  │
│  │  │  │  • Custom Styling                            │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │         Interactive Markers                  │  │  │  │
│  │  │  │  • Status-based colors                       │  │  │  │
│  │  │  │  • Hover effects                             │  │  │  │
│  │  │  │  • Click handlers                            │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │         Popups                               │  │  │  │
│  │  │  │  • Ticket details                            │  │  │  │
│  │  │  │  • Custom styling                            │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │         Controls                             │  │  │  │
│  │  │  │  • Navigation (zoom, pan)                    │  │  │  │
│  │  │  │  • Geolocate                                 │  │  │  │
│  │  │  │  • Fit bounds                                │  │  │  │
│  │  │  │  • Fly to location                           │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │         Boundary Overlay                     │  │  │  │
│  │  │  │  • Barangay San Vicente polygon              │  │  │  │
│  │  │  │  • Custom styling                            │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Supporting Modules                          │
├─────────────────────────────────────────────────────────────────┤
│  useGeolocation Hook                                             │
│  • Get current location                                          │
│  • Track position changes                                        │
│  • Error handling                                                │
│  • Distance calculations                                         │
├─────────────────────────────────────────────────────────────────┤
│  Geofencing Utilities                                            │
│  • Point-in-polygon detection                                    │
│  • Distance to boundary                                          │
│  • Boundary statistics                                           │
│  • Coordinate validation                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Dashboard
  └── Map (Lazy Wrapper)
        └── MapboxMap
              ├── Mapbox GL JS Core
              ├── TicketMarker (x N)
              │     └── Marker Icon
              ├── TicketPopup
              │     └── Ticket Details
              ├── NavigationControl
              ├── GeolocateControl
              ├── Boundary Layer
              │     ├── Line Layer
              │     └── Fill Layer
              ├── GeofenceAlert
              └── Custom Controls
                    ├── Fly To Location Button
                    └── Fit Bounds Button
```

## Data Flow

```
┌──────────────┐
│   API Call   │
│ (useMapTickets)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Ticket Data  │
│ [{lat, lng}] │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Dashboard   │
│  Component   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Map Component│
│  (tickets)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  MapboxMap   │
│  Component   │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Render       │  │ Event        │
│ Markers      │  │ Handlers     │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ onTicketClick│
                  │  Callback    │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Dashboard   │
                  │ (show modal) │
                  └──────────────┘
```

## Geolocation Flow

```
┌──────────────────┐
│ useGeolocation() │
│      Hook        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ navigator.       │
│ geolocation      │
└────────┬─────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐    ┌──────────────┐
│   Success    │    │    Error     │
│  (location)  │    │  (message)   │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Update State │    │ Show Error   │
└──────┬───────┘    └──────────────┘
       │
       ▼
┌──────────────┐
│ Check        │
│ Boundary     │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Inside     │  │   Outside    │
│ (no alert)   │  │ (show alert) │
└──────────────┘  └──────────────┘
```

## Geofencing Flow

```
┌──────────────────┐
│ User Location    │
│ [lng, lat]       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ isPointInBoundary│
│   (Turf.js)      │
└────────┬─────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐    ┌──────────────┐
│   Inside     │    │   Outside    │
│ Boundary     │    │  Boundary    │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Allow        │    │ Show Alert   │
│ Submission   │    │ + Calculate  │
│              │    │ Distance     │
└──────────────┘    └──────────────┘
```

## Performance Optimization Flow

```
┌──────────────────┐
│  User Opens      │
│  Dashboard       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  React.lazy()    │
│  Triggered       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Load Map        │
│  Component       │
│  (vendor-mapbox) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Show Loading    │
│  Fallback        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Initialize      │
│  Mapbox GL JS    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Render Map      │
│  + Markers       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Memoized        │
│  Components      │
│  (no re-render)  │
└──────────────────┘
```

## Code Splitting Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Main Bundle                          │
│  • React core                                           │
│  • Router                                               │
│  • State management                                     │
│  • UI components                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 vendor-mapbox.js                        │
│  • mapbox-gl (~600KB)                                   │
│  • react-map-gl (~50KB)                                 │
│  • Lazy loaded when Dashboard opens                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  vendor-geo.js                          │
│  • @turf/turf (~200KB)                                  │
│  • Loaded with map component                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                vendor-leaflet.js (Legacy)               │
│  • leaflet (~150KB)                                     │
│  • react-leaflet (~30KB)                                │
│  • Can be removed after migration                      │
└─────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────┐
│                    MapboxMap State                      │
├─────────────────────────────────────────────────────────┤
│  selectedTicket: Ticket | null                          │
│  • Currently selected marker                            │
│  • Shows popup when set                                 │
├─────────────────────────────────────────────────────────┤
│  viewState: { longitude, latitude, zoom }               │
│  • Current map viewport                                 │
│  • Updated on pan/zoom                                  │
├─────────────────────────────────────────────────────────┤
│  isInsideBoundary: boolean                              │
│  • User location status                                 │
│  • Shows alert when false                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 useGeolocation State                    │
├─────────────────────────────────────────────────────────┤
│  location: Location | null                              │
│  • User's GPS coordinates                               │
│  • Updated continuously if watch=true                   │
├─────────────────────────────────────────────────────────┤
│  error: string | null                                   │
│  • Error message if geolocation fails                   │
├─────────────────────────────────────────────────────────┤
│  isLoading: boolean                                     │
│  • True while getting location                          │
└─────────────────────────────────────────────────────────┘
```

## Event Flow

```
User Action                Component                    Result
───────────                ─────────                    ──────

Click Marker      →    TicketMarker.onClick()    →    setSelectedTicket()
                                                  →    Show Popup

Close Popup       →    Popup.onClose()           →    setSelectedTicket(null)
                                                  →    Hide Popup

Click Geolocate   →    GeolocateControl          →    Get Location
                                                  →    Fly to Location

Zoom In/Out       →    NavigationControl         →    Update viewState
                                                  →    Re-render Map

Pan Map           →    Map.onMove()              →    Update viewState
                                                  →    Re-render Map

Fit Bounds        →    Custom Button             →    map.fitBounds()
                                                  →    Animate to Bounds

Fly To Location   →    Custom Button             →    map.flyTo()
                                                  →    Animate to Location
```

## Error Handling Flow

```
┌──────────────────┐
│  Component       │
│  Renders         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Try Operation   │
└────────┬─────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐    ┌──────────────┐
│   Success    │    │    Error     │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Render       │    │ Catch Error  │
│ Content      │    └──────┬───────┘
└──────────────┘           │
                           ▼
                    ┌──────────────┐
                    │ Log to       │
                    │ Console      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Show User    │
                    │ Friendly     │
                    │ Message      │
                    └──────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Development                          │
├─────────────────────────────────────────────────────────┤
│  Vite Dev Server (localhost:5174)                       │
│  • Hot Module Replacement                               │
│  • Source maps                                          │
│  • Fast refresh                                         │
│  • Proxy to Laravel backend                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Production                           │
├─────────────────────────────────────────────────────────┤
│  Render Static Site                                     │
│  • Optimized bundles                                    │
│  • Code splitting                                       │
│  • Lazy loading                                         │
│  • CDN distribution                                     │
│  • HTTPS                                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Environment Variables                  │
├─────────────────────────────────────────────────────────┤
│  Development: .env                                      │
│  • VITE_MAPBOX_TOKEN                                    │
│  • VITE_API_URL=/api/v1                                 │
├─────────────────────────────────────────────────────────┤
│  Production: Render Environment                         │
│  • VITE_MAPBOX_TOKEN                                    │
│  • VITE_API_URL=https://backend.onrender.com/api/v1    │
└─────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Token Security                         │
├─────────────────────────────────────────────────────────┤
│  1. Environment Variables                               │
│     • Never in source code                              │
│     • .env in .gitignore                                │
│                                                         │
│  2. Token Restrictions (Mapbox Dashboard)               │
│     • Restrict to specific URLs                         │
│     • localhost:5174 (dev)                              │
│     • your-app.onrender.com (prod)                      │
│                                                         │
│  3. Public Token                                        │
│     • Client-side only                                  │
│     • No secret operations                              │
│     • Rate limited by Mapbox                            │
└─────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
Current Capacity:
├── 100-200 markers without clustering
├── Real-time updates via WebSocket
├── Offline support via PWA
└── Mobile responsive

Future Enhancements:
├── Marker clustering (1000+ markers)
├── Heatmap layer (density visualization)
├── 3D buildings (visual depth)
├── Custom map style (Mapbox Studio)
├── Search/geocoding (address lookup)
├── Directions/routing (navigation)
└── Offline map caching (tiles)
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Stack                       │
├─────────────────────────────────────────────────────────┤
│  React 19.2.4                                           │
│  • Component framework                                  │
│  • Hooks (useState, useEffect, useCallback, useMemo)    │
│  • Lazy loading (React.lazy, Suspense)                  │
├─────────────────────────────────────────────────────────┤
│  Mapbox GL JS 3.1.2                                     │
│  • WebGL rendering                                      │
│  • Vector tiles                                         │
│  • Custom styling                                       │
├─────────────────────────────────────────────────────────┤
│  react-map-gl 7.1.7                                     │
│  • React wrapper for Mapbox                             │
│  • Component-based API                                  │
│  • TypeScript support                                   │
├─────────────────────────────────────────────────────────┤
│  Turf.js 7.0.0                                          │
│  • Geospatial calculations                              │
│  • Point-in-polygon                                     │
│  • Distance calculations                                │
├─────────────────────────────────────────────────────────┤
│  Vite 5.4.11                                            │
│  • Build tool                                           │
│  • Code splitting                                       │
│  • Hot module replacement                               │
└─────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: May 1, 2026  
**Status**: Production Ready
