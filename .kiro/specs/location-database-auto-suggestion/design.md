# Design Document

## System Architecture

### Overview

The location-database-auto-suggestion system follows a three-tier architecture:

1. **Frontend Layer**: React components for user interaction and display
2. **Backend Layer**: Laravel API endpoints for data management
3. **Data Layer**: PostgreSQL database with PostGIS extension for spatial data

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ LocationSearch   │  │  LocationMap     │                │
│  │   Component      │──│   Component      │                │
│  └──────────────────┘  └──────────────────┘                │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │  Location API  │                             │
│              │    Service     │                             │
│              └───────┬────────┘                             │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP/JSON
┌──────────────────────▼──────────────────────────────────────┐
│                  BACKEND (Laravel)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   Location       │  │   Location       │                │
│  │  Controller      │──│   Service        │                │
│  └──────────────────┘  └──────────────────┘                │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │  Location      │                             │
│              │   Model        │                             │
│              └───────┬────────┘                             │
└──────────────────────┼──────────────────────────────────────┘
                       │ Eloquent ORM
┌──────────────────────▼──────────────────────────────────────┐
│                DATABASE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐               │
│  │         locations table                   │               │
│  │  - id, name, latitude, longitude         │               │
│  │  - type, aliases, metadata               │               │
│  │  - created_at, updated_at                │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18+, Leaflet, React-Leaflet, Axios
- **Backend**: Laravel 10+, PHP 8.1+
- **Database**: PostgreSQL 14+ with PostGIS extension
- **Styling**: Tailwind CSS
- **Future**: Fuse.js for fuzzy search

---

## Database Design

### Schema: locations Table

```sql
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    type VARCHAR(50) NOT NULL,
    aliases JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_latitude CHECK (latitude BETWEEN 14.9 AND 15.1),
    CONSTRAINT chk_longitude CHECK (longitude BETWEEN 120.7 AND 120.9),
    CONSTRAINT chk_type CHECK (type IN ('government', 'health', 'sitio', 'school', 'road', 'landmark')),
    CONSTRAINT unique_location UNIQUE (name, latitude, longitude)
);

-- Indexes for performance
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_aliases ON locations USING GIN(aliases);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-incrementing |
| `name` | VARCHAR(255) | Official location name |
| `latitude` | DECIMAL(10,6) | Latitude coordinate (6 decimal precision) |
| `longitude` | DECIMAL(10,6) | Longitude coordinate (6 decimal precision) |
| `type` | VARCHAR(50) | Location category (government, health, sitio, school, road, landmark) |
| `aliases` | JSONB | Array of alternative names/common variations |
| `metadata` | JSONB | Additional flexible data (address, description, contact, etc.) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

### Sample Data Structure

```json
{
  "id": 1,
  "name": "San Vicente Barangay Hall",
  "latitude": 14.9605,
  "longitude": 120.7606,
  "type": "government",
  "aliases": ["barangay hall", "brgy hall", "municipal hall"],
  "metadata": {
    "address": "San Vicente, Apalit, Pampanga",
    "description": "Main barangay government office",
    "contact": "+63 XXX XXX XXXX",
    "operating_hours": "8:00 AM - 5:00 PM"
  },
  "created_at": "2026-05-11T10:00:00Z",
  "updated_at": "2026-05-11T10:00:00Z"
}
```

---

## Backend API Design

### Base URL
```
/api/v1/locations
```

### Endpoint 1: Get All Locations

**Request:**
```http
GET /api/v1/locations
```

**Query Parameters:**
- `type` (optional): Filter by location type
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "San Vicente Barangay Hall",
      "latitude": 14.9605,
      "longitude": 120.7606,
      "type": "government",
      "aliases": ["barangay hall", "brgy hall"],
      "metadata": {}
    }
  ],
  "meta": {
    "total": 25,
    "limit": 100,
    "offset": 0
  }
}
```

### Endpoint 2: Search Locations

**Request:**
```http
GET /api/v1/locations/search?q={query}
```

**Query Parameters:**
- `q` (required): Search query string (min 2 characters)
- `type` (optional): Filter by location type
- `limit` (optional): Max results (default: 8)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "San Vicente Barangay Hall",
      "latitude": 14.9605,
      "longitude": 120.7606,
      "type": "government",
      "aliases": ["barangay hall", "brgy hall"],
      "match_type": "name",
      "relevance_score": 1.0
    }
  ],
  "meta": {
    "query": "barangay",
    "results_count": 1,
    "search_time_ms": 45
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "Search query must be at least 2 characters"
  }
}
```

### Endpoint 3: Get Single Location

**Request:**
```http
GET /api/v1/locations/{id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "San Vicente Barangay Hall",
    "latitude": 14.9605,
    "longitude": 120.7606,
    "type": "government",
    "aliases": ["barangay hall", "brgy hall"],
    "metadata": {
      "address": "San Vicente, Apalit, Pampanga"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "Location with ID 999 not found"
  }
}
```

---

## Frontend Component Design

### Component 1: LocationSearch

**Purpose:** Auto-suggestion search input component

**Props:**
```typescript
interface LocationSearchProps {
  onSelect: (location: Location) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  disabled?: boolean;
}
```

**State:**
```typescript
interface LocationSearchState {
  query: string;
  suggestions: Location[];
  isLoading: boolean;
  showSuggestions: boolean;
  selectedIndex: number;
  error: string | null;
}
```

**Component Structure:**
```jsx
<div className="relative w-full">
  {/* Search Input */}
  <input
    type="text"
    value={query}
    onChange={handleSearch}
    onFocus={handleFocus}
    onBlur={handleBlur}
    onKeyDown={handleKeyDown}
    placeholder="Search location..."
    className="w-full rounded-xl border px-4 py-3"
  />
  
  {/* Loading Indicator */}
  {isLoading && (
    <div className="absolute right-3 top-3">
      <Spinner />
    </div>
  )}
  
  {/* Suggestions Dropdown */}
  {showSuggestions && suggestions.length > 0 && (
    <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg">
      {suggestions.map((location, index) => (
        <button
          key={location.id}
          onClick={() => handleSelect(location)}
          className={`flex w-full items-start gap-3 px-4 py-3 hover:bg-gray-50 ${
            index === selectedIndex ? 'bg-blue-50' : ''
          }`}
        >
          <span className="material-symbols-outlined">location_on</span>
          <div className="text-left">
            <p className="font-medium text-gray-800">{location.name}</p>
            <p className="text-sm text-gray-500 capitalize">{location.type}</p>
          </div>
        </button>
      ))}
    </div>
  )}
  
  {/* No Results Message */}
  {showSuggestions && query.length >= 2 && suggestions.length === 0 && !isLoading && (
    <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white p-4 shadow-lg">
      <p className="text-sm text-gray-500">No locations found</p>
    </div>
  )}
  
  {/* Error Message */}
  {error && (
    <p className="mt-2 text-sm text-red-600">{error}</p>
  )}
</div>
```

**Key Functions:**

1. **handleSearch(value: string)**
   - Updates query state
   - Debounces API call by 300ms
   - Calls searchLocations API if query >= 2 characters

2. **handleSelect(location: Location)**
   - Calls onSelect prop with selected location
   - Updates query to location name
   - Hides suggestions dropdown
   - Stores in recent searches (localStorage)

3. **handleKeyDown(event: KeyboardEvent)**
   - Arrow Up/Down: Navigate suggestions
   - Enter: Select highlighted suggestion
   - Escape: Close suggestions dropdown

4. **searchLocations(query: string)**
   - Calls `/api/v1/locations/search?q={query}`
   - Updates suggestions state
   - Handles loading and error states

### Component 2: LocationMap (Enhanced)

**Purpose:** Display selected location on interactive map

**New Props:**
```typescript
interface LocationMapProps {
  address?: string;
  location?: Location; // NEW: Direct location object
  height?: number;
  onLocationChange?: (location: Location) => void;
}
```

**Enhanced Logic:**
```javascript
useEffect(() => {
  // Priority 1: Use location prop if provided
  if (location) {
    setCoordinates({
      lat: location.latitude,
      lng: location.longitude,
      displayName: location.name,
      source: 'database'
    });
    return;
  }
  
  // Priority 2: Check KNOWN_LOCATIONS (backward compatibility)
  const knownLocation = checkKnownLocation(address);
  if (knownLocation) {
    setCoordinates({
      lat: knownLocation.lat,
      lng: knownLocation.lng,
      displayName: knownLocation.name,
      source: 'known'
    });
    return;
  }
  
  // Priority 3: Geocode with Nominatim (fallback)
  geocodeAddress(address).then(result => {
    if (result) {
      setCoordinates({
        lat: result.lat,
        lng: result.lon,
        displayName: result.display_name,
        source: 'geocoded'
      });
    } else {
      // Priority 4: Default to barangay center
      setCoordinates({
        lat: defaultCenter[0],
        lng: defaultCenter[1],
        displayName: address,
        source: 'default'
      });
    }
  });
}, [location, address]);
```

### Component 3: LocationService (API Client)

**Purpose:** Centralized API communication service

**File:** `REACT-FRONT-END/src/services/locationService.js`

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class LocationService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Cache for performance
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  /**
   * Search locations by query
   */
  async searchLocations(query, options = {}) {
    const { type, limit = 8 } = options;
    
    // Check cache
    const cacheKey = `search:${query}:${type}:${limit}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    
    try {
      const params = { q: query, limit };
      if (type) params.type = type;
      
      const response = await this.client.get('/locations/search', { params });
      
      // Cache result
      this.cache.set(cacheKey, {
        data: response.data.data,
        timestamp: Date.now()
      });
      
      return response.data.data;
    } catch (error) {
      console.error('[LocationService] Search error:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get all locations
   */
  async getAllLocations(options = {}) {
    const { type, limit = 100, offset = 0 } = options;
    
    try {
      const params = { limit, offset };
      if (type) params.type = type;
      
      const response = await this.client.get('/locations', { params });
      return response.data.data;
    } catch (error) {
      console.error('[LocationService] Get all error:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get single location by ID
   */
  async getLocation(id) {
    try {
      const response = await this.client.get(`/locations/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('[LocationService] Get location error:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      return {
        code: error.response.data?.error?.code || 'API_ERROR',
        message: error.response.data?.error?.message || 'An error occurred',
        status: error.response.status
      };
    } else if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
        status: 0
      };
    } else {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        status: 0
      };
    }
  }
}

export default new LocationService();
```

---

## Integration Design

### Integration 1: ReportConcern Form

**Current State:**
```jsx
<input
  type="text"
  value={formData.location}
  onChange={(e) => setFormData({...formData, location: e.target.value})}
  placeholder="Enter location"
/>
```

**New State:**
```jsx
import LocationSearch from '../components/LocationSearch';

// Add state for selected location
const [selectedLocation, setSelectedLocation] = useState(null);

// Handle location selection
const handleLocationSelect = (location) => {
  setSelectedLocation(location);
  setFormData({
    ...formData,
    location: location.name,
    location_id: location.id,
    latitude: location.latitude,
    longitude: location.longitude
  });
};

// Render
<LocationSearch
  onSelect={handleLocationSelect}
  placeholder="Search for a location..."
  initialValue={formData.location}
/>

{selectedLocation && (
  <LocationMap
    location={selectedLocation}
    height={300}
  />
)}
```

### Integration 2: TrackConcern Display

**Enhanced Display:**
```jsx
// Fetch location details if location_id exists
useEffect(() => {
  if (ticket.location_id) {
    locationService.getLocation(ticket.location_id)
      .then(location => setLocationDetails(location))
      .catch(err => console.error('Failed to load location:', err));
  }
}, [ticket.location_id]);

// Render
<div className="location-section">
  <h3>Location</h3>
  <p className="location-name">{ticket.location}</p>
  
  {locationDetails && (
    <span className="location-type-badge">
      {locationDetails.type}
    </span>
  )}
  
  <LocationMap
    location={locationDetails}
    address={ticket.location}
    height={300}
  />
  
  {!ticket.location_id && (
    <p className="text-sm text-gray-500">
      ⚠️ Approximate location (geocoded)
    </p>
  )}
</div>
```

---

## Search Algorithm Design

### Phase 1: Basic Search (MVP)

**Algorithm:**
```
1. Normalize query (lowercase, trim)
2. Search in database:
   a. Exact match on name (score: 1.0)
   b. Partial match on name using ILIKE (score: 0.8)
   c. Match in aliases array (score: 0.6)
3. Sort by relevance score (descending)
4. Limit to 8 results
5. Return results
```

**SQL Query:**
```sql
SELECT 
  id, name, latitude, longitude, type, aliases,
  CASE
    WHEN LOWER(name) = LOWER($query) THEN 1.0
    WHEN LOWER(name) LIKE LOWER($query || '%') THEN 0.9
    WHEN LOWER(name) LIKE LOWER('%' || $query || '%') THEN 0.8
    WHEN aliases::text ILIKE '%' || $query || '%' THEN 0.6
    ELSE 0.5
  END as relevance_score
FROM locations
WHERE 
  LOWER(name) LIKE LOWER('%' || $query || '%')
  OR aliases::text ILIKE '%' || $query || '%'
ORDER BY relevance_score DESC, name ASC
LIMIT 8;
```

### Phase 2: Fuzzy Search (Future Enhancement)

**Algorithm using Fuse.js:**
```javascript
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'aliases', weight: 0.3 }
  ],
  threshold: 0.4, // 0.0 = exact, 1.0 = match anything
  includeScore: true,
  minMatchCharLength: 2
};

const fuse = new Fuse(locations, fuseOptions);
const results = fuse.search(query);
```

---

## State Management Design

### Global State (Context API)

**File:** `REACT-FRONT-END/src/contexts/LocationContext.jsx`

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import locationService from '../services/locationService';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentLocations');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);
  
  // Add to recent searches
  const addRecentSearch = (location) => {
    const updated = [
      location,
      ...recentSearches.filter(l => l.id !== location.id)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recentLocations', JSON.stringify(updated));
  };
  
  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentLocations');
  };
  
  const value = {
    locations,
    recentSearches,
    isLoading,
    addRecentSearch,
    clearRecentSearches
  };
  
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
```

---

## Error Handling Design

### Error Types

1. **Network Errors**: Server unreachable
2. **Validation Errors**: Invalid query parameters
3. **Not Found Errors**: Location doesn't exist
4. **Timeout Errors**: Request takes too long

### Error Handling Strategy

```javascript
// In LocationSearch component
const handleSearch = async (query) => {
  try {
    setIsLoading(true);
    setError(null);
    
    const results = await locationService.searchLocations(query);
    setSuggestions(results);
    
  } catch (error) {
    // Handle different error types
    switch (error.code) {
      case 'NETWORK_ERROR':
        setError('Unable to connect. Please check your internet connection.');
        // Fall back to KNOWN_LOCATIONS
        const fallbackResults = searchKnownLocations(query);
        setSuggestions(fallbackResults);
        break;
        
      case 'INVALID_QUERY':
        setError('Please enter at least 2 characters');
        break;
        
      case 'TIMEOUT':
        setError('Search is taking too long. Please try again.');
        break;
        
      default:
        setError('An error occurred. You can still enter a location manually.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

### Fallback Mechanism

```javascript
// Fallback hierarchy
1. Database search (primary)
   ↓ (if fails)
2. KNOWN_LOCATIONS object (backward compatibility)
   ↓ (if fails)
3. Nominatim geocoding (external API)
   ↓ (if fails)
4. Manual entry + default barangay center
```

---

## Performance Optimization Design

### 1. Debouncing

```javascript
import { useCallback } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useCallback(
  debounce(async (query) => {
    const results = await locationService.searchLocations(query);
    setSuggestions(results);
  }, 300),
  []
);
```

### 2. Caching Strategy

- **Client-side cache**: 5 minutes in LocationService
- **Browser cache**: HTTP Cache-Control headers
- **Recent searches**: localStorage (persistent)

### 3. Database Indexing

```sql
-- Already included in schema
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_aliases ON locations USING GIN(aliases);
```

### 4. Lazy Loading

```javascript
// Load locations on demand, not on app startup
const [locations, setLocations] = useState([]);

useEffect(() => {
  // Only load when user focuses on search input
  if (isFocused && locations.length === 0) {
    loadLocations();
  }
}, [isFocused]);
```

---

## Security Considerations

### 1. Input Validation

```php
// Laravel validation rules
$request->validate([
    'q' => 'required|string|min:2|max:100',
    'type' => 'nullable|in:government,health,sitio,school,road,landmark',
    'limit' => 'nullable|integer|min:1|max:50'
]);
```

### 2. SQL Injection Prevention

- Use Eloquent ORM (parameterized queries)
- Validate all user inputs
- Escape special characters

### 3. Rate Limiting

```php
// In routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    Route::get('/locations/search', [LocationController::class, 'search']);
});
```

### 4. CORS Configuration

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => [env('FRONTEND_URL')],
'allowed_methods' => ['GET'],
```

---

## Testing Strategy

### Unit Tests

1. **LocationService Tests**
   - Test API calls
   - Test caching mechanism
   - Test error handling

2. **Search Algorithm Tests**
   - Test exact matches
   - Test partial matches
   - Test alias matching
   - Test relevance scoring

### Integration Tests

1. **LocationSearch Component Tests**
   - Test user input
   - Test suggestion display
   - Test selection behavior
   - Test keyboard navigation

2. **API Endpoint Tests**
   - Test search endpoint
   - Test validation
   - Test error responses

### E2E Tests

1. **User Flow Tests**
   - Search for location
   - Select from suggestions
   - View on map
   - Submit concern with location

---

## Deployment Considerations

### Database Migration

```bash
# Run migration
php artisan migrate

# Seed initial data
php artisan db:seed --class=LocationSeeder
```

### Environment Variables

```env
# .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=barangay_connect
DB_USERNAME=postgres
DB_PASSWORD=secret

# Frontend .env
VITE_API_BASE_URL=http://localhost:8000
```

### Build Process

```bash
# Backend
composer install
php artisan config:cache
php artisan route:cache

# Frontend
npm install
npm run build
```

---

## Future Enhancements

### Phase 2: Fuzzy Search
- Integrate Fuse.js
- Implement typo tolerance
- Add similarity scoring

### Phase 3: Recent Searches
- Display recent searches on focus
- Persist in localStorage
- Add clear history button

### Phase 4: Category Filtering
- Add category filter buttons
- Show location count per category
- Filter search results by type

### Phase 5: GPS Distance Sorting
- Request user location permission
- Calculate distances using Haversine formula
- Sort results by proximity
- Display distance in meters/km

### Phase 6: AI Smart Address Parsing
- Integrate NLP service
- Parse natural language queries
- Extract location components
- Learn from user selections

---

## Conclusion

This design provides a comprehensive, scalable solution for the location database and auto-suggestion system. The architecture follows best practices for separation of concerns, performance optimization, and user experience. The phased approach allows for incremental development and testing, with clear paths for future enhancements.

