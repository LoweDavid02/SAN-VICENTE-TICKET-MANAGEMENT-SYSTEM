# Postman API Testing Setup

## Overview

This directory contains Postman collection and environment files for testing the Barangay Connect API. The API routes were recently updated to remove the resident portal endpoints, focusing on Guest, Admin, and Personnel portals.

## Files Created

1. **`.postman.json`** - Configuration file to store workspace and collection IDs
2. **`barangay-connect-api.postman_collection.json`** - Complete API collection with all endpoints
3. **`barangay-connect-local.postman_environment.json`** - Local development environment
4. **`barangay-connect-production.postman_environment.json`** - Production environment template

## Recent API Changes

The following resident portal endpoints were **removed** from the API:
- `GET /api/v1/resident/dashboard`
- `GET /api/v1/resident/tickets`
- `POST /api/v1/resident/tickets`
- `GET /api/v1/resident/tickets/{id}`
- `GET /api/v1/resident/profile`
- `PATCH /api/v1/resident/profile`

The API now supports three portals:
1. **Guest Portal** - Public ticket submission and tracking (no authentication)
2. **Admin Portal** - Full system management (requires admin role)
3. **Personnel Portal** - Task management for field staff (requires personnel role)

## Setup Instructions

### Option 1: Manual Import (Recommended for Now)

Since the Postman Power requires API key configuration, you can manually import the collection:

1. Open Postman desktop app or web version
2. Click **Import** button
3. Drag and drop these files:
   - `barangay-connect-api.postman_collection.json`
   - `barangay-connect-local.postman_environment.json`
   - `barangay-connect-production.postman_environment.json`
4. Select the "Barangay Connect - Local" environment from the dropdown
5. Run the collection

### Option 2: Automated Testing with Postman Power

To enable automated testing via the Postman Power:

1. **Get Postman API Key:**
   - Log into your Postman account
   - Go to Settings → API Keys
   - Generate a new key with permissions for workspace, collection, and environment management

2. **Configure the API Key:**
   
   Add to your environment variables:
   ```bash
   export POSTMAN_API_KEY="your-api-key-here"
   ```
   
   Or add to `~/.kiro/settings/mcp.json`:
   ```json
   {
     "mcpServers": {
       "postman": {
         "url": "https://mcp.postman.com/minimal",
         "headers": {
           "Authorization": "Bearer YOUR_API_KEY_HERE"
         }
       }
     }
   }
   ```

3. **The hook is already configured** - It will automatically trigger when API files are edited

## API Collection Structure

### 1. Authentication (4 endpoints)
- **POST** `/auth/register` - Create new user account
- **POST** `/auth/login` - Login and get bearer token
- **GET** `/auth/me` - Get current user info
- **POST** `/auth/logout` - Logout and invalidate token

### 2. Guest Portal (2 endpoints)
- **POST** `/guest/tickets` - Submit ticket without authentication
- **GET** `/guest/tickets/{trackingCode}` - Track ticket status

### 3. Admin Portal (13 endpoints)
- **GET** `/admin/dashboard` - Dashboard statistics
- **GET** `/admin/tickets` - List all tickets
- **PATCH** `/admin/tickets/{id}/status` - Update ticket status
- **POST** `/admin/tickets/{id}/assign` - Assign ticket to personnel
- **GET** `/admin/users` - List all users
- **POST** `/admin/users` - Create new user
- **DELETE** `/admin/users/{id}` - Delete user
- **PATCH** `/admin/users/{id}/status` - Update user status
- **GET** `/admin/personnel` - List all personnel
- **GET** `/admin/profile` - Get admin profile
- **PATCH** `/admin/profile` - Update admin profile
- **GET** `/admin/map` - Get tickets for map view

### 4. Personnel Portal (5 endpoints)
- **GET** `/personnel/dashboard` - Personnel dashboard
- **GET** `/personnel/tasks` - Get assigned tasks
- **PATCH** `/personnel/tasks/{id}/status` - Update task status
- **GET** `/personnel/profile` - Get personnel profile
- **PATCH** `/personnel/profile` - Update personnel profile

## Testing Workflow

### 1. Start the API Server

```bash
cd LARAVEL-BACK-END
php artisan serve
```

The API will be available at `http://localhost:8000`

### 2. Run Tests in Order

**Step 1: Register/Login**
1. Run "Register" to create a test admin account
2. Or run "Login" if account already exists
3. The token will be automatically saved to collection variables

**Step 2: Test Guest Endpoints**
1. Run "Submit Ticket" - saves tracking code automatically
2. Run "Track Ticket" - uses saved tracking code

**Step 3: Test Admin Endpoints**
1. Run "Dashboard" to verify admin access
2. Run "Get All Tickets" to see submitted tickets
3. Test other admin endpoints as needed

**Step 4: Test Personnel Endpoints**
1. Create a personnel user via "Create User" (Admin endpoint)
2. Login as personnel
3. Test personnel dashboard and tasks

## Automated Test Scripts

Each request includes test scripts that:
- Verify response status codes
- Check response structure
- Auto-save tokens and tracking codes to variables
- Validate data types

Example test output:
```
✓ Status code is 201
✓ Response has token
✓ Response has tracking code
```

## Environment Variables

The collection uses these variables:

| Variable | Description | Auto-populated |
|----------|-------------|----------------|
| `base_url` | API base URL | No |
| `token` | Bearer auth token | Yes (on login) |
| `tracking_code` | Guest ticket tracking code | Yes (on submit) |

## Troubleshooting

### "Connection refused" errors
- Ensure Laravel API server is running: `php artisan serve`
- Check that `base_url` matches your server address

### "Unauthenticated" errors
- Run the Login request first
- Verify the token is saved in collection variables
- Check that Authorization header is set to `Bearer {{token}}`

### "403 Forbidden" errors
- Verify user has correct role (admin/personnel)
- Check middleware configuration in `api.php`

### Rate limiting errors
- Wait 60 seconds and retry
- Rate limits: Login (10/min), Guest (15/min), Authenticated (60/min)

## Next Steps

1. **Import the collection** into Postman manually
2. **Run the full collection** to verify all endpoints work
3. **Configure Postman API key** for automated testing (optional)
4. **Update production environment** with your Render URL when deployed

## Notes

- The resident portal has been removed - guests can submit tickets without accounts
- All authenticated endpoints require `Bearer {token}` in Authorization header
- CORS is configured for `localhost:5173` (React frontend)
- Rate limiting is active on all routes
