# Implementation Tasks

## Task 1: Create Database Migration and Model

**Status:** pending

**Description:**
Create the PostgreSQL database migration for the `locations` table and the corresponding Laravel Eloquent model with validation rules and relationships.

**Requirements:**
- Requirement 1: Location Database Structure
- Requirement 7: Database Migration and API Endpoints
- Requirement 12: Data Validation and Integrity

**Acceptance Criteria:**
- [ ] Migration file created in `LARAVEL-BACK-END/database/migrations/`
- [ ] Table includes all required columns: id, name, latitude, longitude, type, aliases, metadata, timestamps
- [ ] Constraints added for latitude (14.9-15.1) and longitude (120.7-120.9)
- [ ] Check constraint for type enum values
- [ ] Unique constraint on (name, latitude, longitude)
- [ ] Indexes created for name, type, aliases, and coordinates
- [ ] Location model created in `LARAVEL-BACK-END/app/Models/Location.php`
- [ ] Model includes fillable fields and casts for JSONB columns
- [ ] Migration runs successfully with `php artisan migrate`

**Files to Create/Modify:**
- `LARAVEL-BACK-END/database/migrations/YYYY_MM_DD_create_locations_table.php`
- `LARAVEL-BACK-END/app/Models/Location.php`

---

## Task 2: Create Location Database Seeder

**Status:** pending

**Description:**
Create a database seeder that populates the locations table with at least 20 comprehensive location entries for Barangay San Vicente, Apalit, Pampanga, including government buildings, health facilities, schools, sitios, roads, and landmarks.

**Requirements:**
- Requirement 2: Comprehensive Location Data
- Requirement 3: Location Alias Support
- Requirement 7: Database Migration and API Endpoints

**Acceptance Criteria:**
- [ ] Seeder file created in `LARAVEL-BACK-END/database/seeders/LocationSeeder.php`
- [ ] At least 20 location entries included
- [ ] San Vicente Barangay Hall with coordinates (14.9605, 120.7606)
- [ ] Health Center with exact coordinates
- [ ] Elementary School with exact coordinates
- [ ] Sitios (Pulo Maligaya, Pulo Babo) with exact coordinates
- [ ] MacArthur Highway with representative coordinates
- [ ] Each location includes appropriate aliases array
- [ ] Each location includes metadata (address, description)
- [ ] All coordinates validated within Apalit, Pampanga bounds
- [ ] Seeder runs successfully with `php artisan db:seed --class=LocationSeeder`

**Files to Create/Modify:**
- `LARAVEL-BACK-END/database/seeders/LocationSeeder.php`
- `LARAVEL-BACK-END/database/seeders/DatabaseSeeder.php` (register LocationSeeder)

---

## Task 3: Create Location API Controller

**Status:** pending

**Description:**
Create the Laravel API controller with three endpoints: get all locations, search locations, and get single location by ID. Implement validation, error handling, and response formatting.

**Requirements:**
- Requirement 7: Database Migration and API Endpoints
- Requirement 10: Error Handling and Fallback Behavior
- Requirement 12: Data Validation and Integrity

**Acceptance Criteria:**
- [ ] Controller created in `LARAVEL-BACK-END/app/Http/Controllers/Api/V1/LocationController.php`
- [ ] `index()` method returns all locations with optional type filter and pagination
- [ ] `search()` method accepts query parameter and returns matching locations
- [ ] `show()` method returns single location by ID
- [ ] Input validation implemented for all endpoints
- [ ] Search query minimum 2 characters validation
- [ ] Type filter validation against allowed values
- [ ] Consistent JSON response format with success/error structure
- [ ] Error responses include error code and message
- [ ] 404 responses for non-existent locations

**Files to Create/Modify:**
- `LARAVEL-BACK-END/app/Http/Controllers/Api/V1/LocationController.php`

---

## Task 4: Implement Search Algorithm in Controller

**Status:** pending

**Description:**
Implement the search algorithm in the LocationController that matches queries against location names and aliases with relevance scoring. Use database queries with ILIKE for case-insensitive partial matching.

**Requirements:**
- Requirement 5: Search Matching Algorithm
- Requirement 11: Performance Optimization

**Acceptance Criteria:**
- [ ] Search matches exact location names (score: 1.0)
- [ ] Search matches partial location names (score: 0.8)
- [ ] Search matches aliases in JSONB array (score: 0.6)
- [ ] Case-insensitive matching implemented
- [ ] Results sorted by relevance score descending
- [ ] Results limited to 8 by default
- [ ] Search includes relevance_score in response
- [ ] Search includes match_type field (name/alias)
- [ ] Query execution time logged for monitoring
- [ ] Database indexes utilized for performance

**Files to Modify:**
- `LARAVEL-BACK-END/app/Http/Controllers/Api/V1/LocationController.php`

---

## Task 5: Register API Routes

**Status:** pending

**Description:**
Register the location API routes in Laravel with appropriate middleware for rate limiting, CORS, and API versioning.

**Requirements:**
- Requirement 7: Database Migration and API Endpoints

**Acceptance Criteria:**
- [ ] Routes registered in `LARAVEL-BACK-END/routes/api.php`
- [ ] GET `/api/v1/locations` route registered
- [ ] GET `/api/v1/locations/search` route registered
- [ ] GET `/api/v1/locations/{id}` route registered
- [ ] Rate limiting middleware applied (60 requests per minute)
- [ ] CORS middleware configured for frontend origin
- [ ] Routes accessible without authentication (guest access)
- [ ] API versioning prefix `/api/v1` applied

**Files to Modify:**
- `LARAVEL-BACK-END/routes/api.php`
- `LARAVEL-BACK-END/config/cors.php` (if needed)

---

## Task 6: Create LocationService API Client

**Status:** pending

**Description:**
Create a frontend service class that handles all API communication with the location endpoints, including caching, error handling, and request debouncing.

**Requirements:**
- Requirement 4: Auto-Suggestion Search Component
- Requirement 10: Error Handling and Fallback Behavior
- Requirement 11: Performance Optimization

**Acceptance Criteria:**
- [ ] Service file created in `REACT-FRONT-END/src/services/locationService.js`
- [ ] Axios client configured with base URL and timeout
- [ ] `searchLocations(query, options)` method implemented
- [ ] `getAllLocations(options)` method implemented
- [ ] `getLocation(id)` method implemented
- [ ] Client-side caching with 5-minute expiration
- [ ] Cache key includes query parameters
- [ ] Error handling for network, timeout, and API errors
- [ ] Error responses formatted consistently
- [ ] Console logging for debugging

**Files to Create:**
- `REACT-FRONT-END/src/services/locationService.js`

---

## Task 7: Create LocationSearch Component

**Status:** pending

**Description:**
Create the React auto-suggestion search component with real-time search, keyboard navigation, and selection handling. Component should display suggestions as user types and update parent component on selection.

**Requirements:**
- Requirement 4: Auto-Suggestion Search Component
- Requirement 5: Search Matching Algorithm
- Requirement 8: Frontend State Management
- Requirement 9: Responsive Design and Accessibility

**Acceptance Criteria:**
- [ ] Component created in `REACT-FRONT-END/src/components/LocationSearch.jsx`
- [ ] Search input with controlled state
- [ ] Debounced search (300ms) on input change
- [ ] Minimum 2 characters before search
- [ ] Loading indicator displayed during search
- [ ] Suggestions dropdown with max 8 results
- [ ] Each suggestion shows location name and type
- [ ] Click handler for suggestion selection
- [ ] Keyboard navigation (Arrow Up/Down, Enter, Escape)
- [ ] Dropdown closes on outside click
- [ ] "No results" message when no matches
- [ ] Error message display for API failures
- [ ] ARIA labels for accessibility
- [ ] Responsive design for mobile (320px+)
- [ ] Touch-friendly tap targets (44px min height)

**Files to Create:**
- `REACT-FRONT-END/src/components/LocationSearch.jsx`

---

## Task 8: Add Styling to LocationSearch Component

**Status:** pending

**Description:**
Apply Tailwind CSS styling to the LocationSearch component to match the existing civic design system with proper colors, spacing, shadows, and hover states.

**Requirements:**
- Requirement 9: Responsive Design and Accessibility

**Acceptance Criteria:**
- [ ] Input field styled with rounded-xl border and padding
- [ ] Focus state with blue ring (ring-2 ring-blue-500)
- [ ] Suggestions dropdown with white background and shadow-lg
- [ ] Hover state for suggestions (bg-gray-50)
- [ ] Selected suggestion highlighted (bg-blue-50)
- [ ] Location icon displayed for each suggestion
- [ ] Type badge styled with appropriate colors
- [ ] Loading spinner styled with blue color
- [ ] Error messages styled with red text
- [ ] Responsive layout for mobile devices
- [ ] Consistent with existing design tokens

**Files to Modify:**
- `REACT-FRONT-END/src/components/LocationSearch.jsx`

---

## Task 9: Enhance LocationMap Component

**Status:** pending

**Description:**
Enhance the existing LocationMap component to accept a location object prop directly and prioritize database locations over geocoding. Add source indicator to show whether location is from database, known locations, or geocoded.

**Requirements:**
- Requirement 6: Integration with LocationMap Component

**Acceptance Criteria:**
- [ ] New prop `location` added to component interface
- [ ] Priority logic: location prop > KNOWN_LOCATIONS > geocoding > default
- [ ] Source tracking (database/known/geocoded/default)
- [ ] Console logging when using database location
- [ ] Map centers on location with zoom level 16
- [ ] Marker placed at exact coordinates
- [ ] Popup shows location name and coordinates
- [ ] Source indicator badge displayed on map
- [ ] Backward compatibility maintained with address prop
- [ ] No breaking changes to existing usage

**Files to Modify:**
- `REACT-FRONT-END/src/components/LocationMap.jsx`

---

## Task 10: Integrate LocationSearch into ReportConcern Form

**Status:** pending

**Description:**
Replace the current location text input in the ReportConcern form with the new LocationSearch component. Update form state to store location_id, latitude, and longitude when a location is selected.

**Requirements:**
- Requirement 19: Integration with ReportConcern Form

**Acceptance Criteria:**
- [ ] LocationSearch component imported and rendered
- [ ] Current location input field replaced
- [ ] Form state includes location_id, latitude, longitude fields
- [ ] `handleLocationSelect` function updates all location fields
- [ ] LocationMap component displays selected location
- [ ] Map only shown after location selection
- [ ] Form validation requires location selection
- [ ] Manual entry still possible if search fails
- [ ] Hidden fields for location_id, latitude, longitude in form submission
- [ ] Existing form functionality preserved

**Files to Modify:**
- `REACT-FRONT-END/src/pages/ReportConcern.jsx`

---

## Task 11: Update Backend to Store Location ID

**Status:** pending

**Description:**
Update the Laravel backend concern/ticket creation endpoint to accept and store the location_id field along with the location text. Add foreign key relationship to locations table.

**Requirements:**
- Requirement 19: Integration with ReportConcern Form

**Acceptance Criteria:**
- [ ] Migration created to add location_id column to concerns/tickets table
- [ ] Foreign key constraint to locations table
- [ ] location_id nullable (for backward compatibility)
- [ ] Concern/Ticket model updated with location relationship
- [ ] API endpoint accepts location_id in request
- [ ] Validation allows location_id to be null or valid location ID
- [ ] Both location text and location_id stored in database
- [ ] Migration runs successfully

**Files to Create/Modify:**
- `LARAVEL-BACK-END/database/migrations/YYYY_MM_DD_add_location_id_to_concerns_table.php`
- `LARAVEL-BACK-END/app/Models/Concern.php` (or Ticket model)
- `LARAVEL-BACK-END/app/Http/Controllers/Api/V1/Guest/GuestController.php`

---

## Task 12: Enhance TrackConcern to Display Location Details

**Status:** pending

**Description:**
Update the TrackConcern page to fetch and display location details when a ticket has a location_id. Show location type badge and source indicator for geocoded vs database locations.

**Requirements:**
- Requirement 20: Integration with TrackConcern Display

**Acceptance Criteria:**
- [ ] Fetch location details using locationService when location_id exists
- [ ] Display location name from ticket data
- [ ] Display location type badge if location details available
- [ ] Pass location object to LocationMap component
- [ ] Show "Approximate location" note for geocoded locations
- [ ] Show "Exact location" note for database locations
- [ ] Error handling if location fetch fails
- [ ] Fallback to address-only display if no location_id
- [ ] Styling consistent with existing design

**Files to Modify:**
- `REACT-FRONT-END/src/pages/TrackConcern.jsx`

---

## Task 13: Create LocationContext for State Management

**Status:** pending

**Description:**
Create a React Context for managing global location state, including recent searches stored in localStorage. Provide hooks for accessing and updating location state across components.

**Requirements:**
- Requirement 8: Frontend State Management
- Requirement 14: Future Enhancement - Recent Searches

**Acceptance Criteria:**
- [ ] Context file created in `REACT-FRONT-END/src/contexts/LocationContext.jsx`
- [ ] LocationProvider component wraps app
- [ ] State includes locations, recentSearches, isLoading
- [ ] `addRecentSearch` function stores last 5 searches
- [ ] `clearRecentSearches` function clears localStorage
- [ ] Recent searches loaded from localStorage on mount
- [ ] Recent searches persisted to localStorage on update
- [ ] `useLocation` hook for accessing context
- [ ] Error thrown if hook used outside provider
- [ ] Provider added to App.jsx

**Files to Create/Modify:**
- `REACT-FRONT-END/src/contexts/LocationContext.jsx`
- `REACT-FRONT-END/src/App.jsx`

---

## Task 14: Add Recent Searches to LocationSearch

**Status:** pending

**Description:**
Enhance the LocationSearch component to display recent searches when the input is focused with an empty query. Allow users to quickly select from previously searched locations.

**Requirements:**
- Requirement 14: Future Enhancement - Recent Searches

**Acceptance Criteria:**
- [ ] useLocation hook imported and used
- [ ] Recent searches displayed on focus with empty query
- [ ] Recent searches show location name and timestamp
- [ ] Click on recent search selects that location
- [ ] Selected location moved to top of recent searches
- [ ] "Clear history" button displayed
- [ ] Clear button removes all recent searches
- [ ] Recent searches section visually distinct from search results
- [ ] Maximum 5 recent searches displayed

**Files to Modify:**
- `REACT-FRONT-END/src/components/LocationSearch.jsx`

---

## Task 15: Add Environment Variables Configuration

**Status:** pending

**Description:**
Add necessary environment variables for API base URL configuration in both frontend and backend. Update .env.example files with documentation.

**Requirements:**
- Requirement 7: Database Migration and API Endpoints

**Acceptance Criteria:**
- [ ] VITE_API_BASE_URL added to frontend .env
- [ ] FRONTEND_URL added to backend .env for CORS
- [ ] .env.example files updated with new variables
- [ ] Documentation comments added for each variable
- [ ] Default values provided for local development
- [ ] Production values documented in deployment guide

**Files to Modify:**
- `REACT-FRONT-END/.env`
- `REACT-FRONT-END/.env.example`
- `LARAVEL-BACK-END/.env`
- `LARAVEL-BACK-END/.env.example`

---

## Task 16: Write Unit Tests for LocationService

**Status:** pending

**Description:**
Write comprehensive unit tests for the LocationService API client, covering all methods, caching behavior, and error handling scenarios.

**Requirements:**
- Requirement 11: Performance Optimization

**Acceptance Criteria:**
- [ ] Test file created in `REACT-FRONT-END/src/services/__tests__/locationService.test.js`
- [ ] Test searchLocations with valid query
- [ ] Test searchLocations with caching
- [ ] Test getAllLocations with filters
- [ ] Test getLocation by ID
- [ ] Test error handling for network errors
- [ ] Test error handling for API errors
- [ ] Test cache expiration
- [ ] Test clearCache functionality
- [ ] All tests passing
- [ ] Code coverage > 80%

**Files to Create:**
- `REACT-FRONT-END/src/services/__tests__/locationService.test.js`

---

## Task 17: Write Component Tests for LocationSearch

**Status:** pending

**Description:**
Write React component tests for LocationSearch covering user interactions, keyboard navigation, and API integration using React Testing Library.

**Requirements:**
- Requirement 4: Auto-Suggestion Search Component
- Requirement 9: Responsive Design and Accessibility

**Acceptance Criteria:**
- [ ] Test file created in `REACT-FRONT-END/src/components/__tests__/LocationSearch.test.jsx`
- [ ] Test component renders correctly
- [ ] Test search input updates state
- [ ] Test debounced API call on input
- [ ] Test suggestions display
- [ ] Test suggestion selection
- [ ] Test keyboard navigation (arrows, enter, escape)
- [ ] Test loading state display
- [ ] Test error state display
- [ ] Test "no results" message
- [ ] Test accessibility (ARIA labels)
- [ ] All tests passing

**Files to Create:**
- `REACT-FRONT-END/src/components/__tests__/LocationSearch.test.jsx`

---

## Task 18: Write API Tests for Location Endpoints

**Status:** pending

**Description:**
Write Laravel feature tests for all location API endpoints, covering success cases, validation errors, and edge cases.

**Requirements:**
- Requirement 7: Database Migration and API Endpoints
- Requirement 12: Data Validation and Integrity

**Acceptance Criteria:**
- [ ] Test file created in `LARAVEL-BACK-END/tests/Feature/LocationApiTest.php`
- [ ] Test GET /api/v1/locations returns all locations
- [ ] Test GET /api/v1/locations with type filter
- [ ] Test GET /api/v1/locations with pagination
- [ ] Test GET /api/v1/locations/search with valid query
- [ ] Test search validation (min 2 characters)
- [ ] Test search with no results
- [ ] Test GET /api/v1/locations/{id} success
- [ ] Test GET /api/v1/locations/{id} not found
- [ ] Test rate limiting
- [ ] All tests passing

**Files to Create:**
- `LARAVEL-BACK-END/tests/Feature/LocationApiTest.php`

---

## Task 19: Create Documentation for Location System

**Status:** pending

**Description:**
Create comprehensive documentation for the location database and auto-suggestion system, including setup instructions, API documentation, and usage examples.

**Requirements:**
- All requirements

**Acceptance Criteria:**
- [ ] Documentation file created in `docs/guides/LOCATION-SYSTEM-GUIDE.md`
- [ ] System overview and architecture diagram
- [ ] Database schema documentation
- [ ] API endpoint documentation with examples
- [ ] Frontend component usage examples
- [ ] Setup and installation instructions
- [ ] How to add new locations guide
- [ ] Troubleshooting section
- [ ] Future enhancements roadmap

**Files to Create:**
- `docs/guides/LOCATION-SYSTEM-GUIDE.md`

---

## Task 20: Build and Deploy Location System

**Status:** pending

**Description:**
Build the frontend and backend, run all migrations and seeders, and verify the complete location system works end-to-end in the development environment.

**Requirements:**
- All requirements

**Acceptance Criteria:**
- [ ] Backend migrations run successfully
- [ ] Location seeder populates database with 20+ locations
- [ ] Frontend builds without errors
- [ ] All API endpoints accessible and returning correct data
- [ ] LocationSearch component displays and functions correctly
- [ ] Location selection updates map correctly
- [ ] Form submission includes location data
- [ ] TrackConcern displays location details correctly
- [ ] No console errors in browser
- [ ] Manual testing checklist completed
- [ ] System ready for user acceptance testing

**Files to Verify:**
- All created/modified files
- Build output
- Database state

---

## Task 21: FUTURE - Implement Fuzzy Search with Fuse.js

**Status:** pending

**Description:**
Integrate Fuse.js library for fuzzy search functionality that tolerates typos and approximate matches. This is a future enhancement to be implemented after the core system is stable.

**Requirements:**
- Requirement 13: Future Enhancement - Fuzzy Search

**Acceptance Criteria:**
- [ ] Fuse.js installed via npm
- [ ] Fuzzy search integrated in LocationService
- [ ] Similarity threshold configured (0.4 for aliases, 0.6 for names)
- [ ] Match scores included in results
- [ ] Fuzzy search enabled via feature flag
- [ ] Performance compared with basic search
- [ ] Documentation updated

**Files to Modify:**
- `REACT-FRONT-END/package.json`
- `REACT-FRONT-END/src/services/locationService.js`

---

## Task 22: FUTURE - Implement Category Filtering

**Status:** pending

**Description:**
Add category filter buttons to LocationSearch component allowing users to filter results by location type (government, health, school, etc.). This is a future enhancement.

**Requirements:**
- Requirement 15: Future Enhancement - Category Filtering

**Acceptance Criteria:**
- [ ] Category filter buttons displayed above search input
- [ ] Buttons for each location type
- [ ] Location count displayed per category
- [ ] Active category highlighted
- [ ] Search results filtered by selected category
- [ ] "All Categories" button to clear filter
- [ ] Filter state persisted during search
- [ ] Styling consistent with design system

**Files to Modify:**
- `REACT-FRONT-END/src/components/LocationSearch.jsx`

---

## Task 23: FUTURE - Implement GPS Distance Sorting

**Status:** pending

**Description:**
Add GPS-based distance sorting that requests user location permission and sorts search results by proximity. Display distance for each result. This is a future enhancement.

**Requirements:**
- Requirement 16: Future Enhancement - GPS Distance Sorting

**Acceptance Criteria:**
- [ ] Request user GPS permission on component mount
- [ ] Calculate distance using Haversine formula
- [ ] Sort results by distance when GPS available
- [ ] Display distance in meters/kilometers
- [ ] Fallback to relevance sorting if GPS denied
- [ ] Distance calculation utility function created
- [ ] Performance optimized for large result sets
- [ ] User preference stored in localStorage

**Files to Modify:**
- `REACT-FRONT-END/src/components/LocationSearch.jsx`
- `REACT-FRONT-END/src/utils/geoUtils.js` (create)

---

## Task 24: FUTURE - Implement AI Smart Address Parsing

**Status:** pending

**Description:**
Integrate AI/NLP service for parsing natural language location descriptions like "near the school" or "beside barangay hall". This is a future enhancement requiring external AI service.

**Requirements:**
- Requirement 18: Future Enhancement - AI Smart Address Parsing

**Acceptance Criteria:**
- [ ] AI service integration (OpenAI, Google NLP, or custom)
- [ ] Natural language query parsing
- [ ] Location component extraction
- [ ] Relative position understanding
- [ ] Multiple candidate suggestions with confidence scores
- [ ] Learning from user selections
- [ ] Fallback to basic search if AI fails
- [ ] Cost and performance monitoring

**Files to Create/Modify:**
- `REACT-FRONT-END/src/services/aiLocationParser.js` (create)
- `REACT-FRONT-END/src/components/LocationSearch.jsx`

