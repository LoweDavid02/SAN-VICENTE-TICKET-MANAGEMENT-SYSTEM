# Barangay San Vicente Civic UI - Implementation Plan

## Overview
Complete redesign from dark agent-native theme to light civic government UI with navy/teal palette.

## Scope of Changes

### 🎨 Design System (CRITICAL)
- **Current:** Dark theme (#0D0D10 bg, purple accent)
- **New:** Light theme (#F3F4F6 bg, navy #1E2D4E primary, teal #0D9488 accent)
- **Impact:** ALL components need visual redesign
- **Files:** `index.css`, all component styles

### 🗺️ Route Structure Changes
| Current | New | Status |
|---------|-----|--------|
| `/submit` | `/report` | ✅ Rename |
| N/A | `/report/success` | ✅ Create new |
| `/track` | `/track` | ✅ Keep, redesign |
| `/` (Landing) | `/` | ✅ Complete redesign |

### 🗄️ Database Schema Changes

#### New Tables Needed:
1. **`ticket_photos`** - Store uploaded images
   ```sql
   CREATE TABLE ticket_photos (
       id BIGSERIAL PRIMARY KEY,
       ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
       file_path VARCHAR(500) NOT NULL,
       file_name VARCHAR(255) NOT NULL,
       mime_type VARCHAR(50) NOT NULL,
       file_size INTEGER NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **`ticket_status_logs`** - Audit trail for status changes
   ```sql
   CREATE TABLE ticket_status_logs (
       id BIGSERIAL PRIMARY KEY,
       ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
       changed_by BIGINT REFERENCES users(id),
       from_status VARCHAR(30) NOT NULL,
       to_status VARCHAR(30) NOT NULL,
       note TEXT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

#### Table Modifications:
- **`tickets`** table:
  - Rename `tracking_id` → `reference_code`
  - Change format from `SV-2026-00142` (already correct)
  - Add `rejection_reason TEXT NULL`
  - Update validation rules

### 📝 Form Changes

#### Current Guest Submission Form:
- 3-step wizard
- Fields: name, email, phone, address, title, category, description, location, severity
- No photo upload
- No geolocation

#### New `/report` Form Requirements:
- Single-page form (not wizard)
- **New fields:**
  - Photo upload (max 3 files, 10MB each)
  - "Locate Me" button for geolocation
  - Character counter on description (max 1000)
- **Validation changes:**
  - Phone: Must match `/^09\d{9}$/` (PH format)
  - Name: Letters and spaces only
  - Description: min 20 chars (was 10)
  - Category options updated

### 🔌 API Endpoint Changes

#### Current:
```
POST /api/v1/guest/tickets
GET  /api/v1/guest/tickets/{trackingCode}
```

#### New:
```
POST   /api/tickets               (simplified path)
POST   /api/tickets/track         (POST instead of GET)
PATCH  /api/tickets/{ref}/confirm (new - resident confirmation)
```

### 🔄 Real-Time Features (NEW)
- Laravel Reverb WebSocket integration
- Live status updates on `/track` page
- Toast notifications for updates
- Requires:
  - Laravel Reverb setup
  - Laravel Echo client-side
  - Event broadcasting configuration

### 📱 Component Redesign Priority

#### HIGH PRIORITY (Core User Flow):
1. ✅ **Landing Page (`/`)** - Complete redesign
   - New hero with barangay hall photo
   - Two action cards (Submit/Track)
   - Quick resources grid
   - Stats strip
   - Remove all auth references

2. ✅ **Submit Form (`/report`)** - Complete redesign
   - Single-page form layout
   - Photo upload component
   - Geolocation button
   - New validation
   - Character counter

3. ✅ **Success Page (`/report/success`)** - NEW PAGE
   - Reference code display
   - Copy to clipboard
   - Track/Home buttons
   - Building banner

4. ✅ **Track Page (`/track`)** - Redesign + WebSocket
   - New search UI
   - Ticket result card
   - Status timeline
   - Resident confirmation (when completed)
   - Real-time updates

5. ✅ **Public Navbar** - Redesign
   - Remove all auth buttons
   - Barangay crest + wordmark
   - Home · Services · Transparency
   - Bell icon (decorative)

#### MEDIUM PRIORITY (Admin - Hidden):
6. **Login Page (`/login`)** - Minimal redesign
   - Keep hidden (no public links)
   - Simple email/password
   - Navy theme
   - No register/forgot password

7. **Admin Dashboard** - Keep existing, update colors

#### LOW PRIORITY:
8. Other admin pages - Update colors only

### 🚧 Implementation Phases

#### Phase 1: Foundation (2-3 hours)
- [x] Create civic design tokens CSS
- [ ] Update index.css with light theme
- [ ] Create database migrations
- [ ] Update API routes structure
- [ ] Remove auth references from public pages

#### Phase 2: Core Pages (4-5 hours)
- [ ] Redesign Landing page
- [ ] Create new `/report` form with photo upload
- [ ] Create `/report/success` page
- [ ] Redesign `/track` page
- [ ] Update public navbar

#### Phase 3: Backend (3-4 hours)
- [ ] Update GuestController validation
- [ ] Implement photo upload handling
- [ ] Add ticket confirmation endpoint
- [ ] Create status log tracking
- [ ] Update reference code generation

#### Phase 4: Real-Time (2-3 hours)
- [ ] Set up Laravel Reverb
- [ ] Configure broadcasting
- [ ] Implement WebSocket on track page
- [ ] Add toast notifications

#### Phase 5: Testing & Polish (2-3 hours)
- [ ] Test all user flows
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Performance optimization
- [ ] Database seeder

**Total Estimated Time: 13-18 hours**

### ⚠️ Breaking Changes

1. **URL Changes:**
   - `/submit` → `/report` (301 redirect needed)
   - Tracking codes in old format still work

2. **API Changes:**
   - Endpoint paths simplified
   - Response format may change
   - Photo upload adds new fields

3. **Database:**
   - New tables added
   - Column rename (tracking_id → reference_code)
   - Migration required

4. **Design:**
   - Complete visual overhaul
   - All existing styles replaced
   - Component library changes

### 📋 Acceptance Criteria Checklist

- [ ] Public pages have ZERO auth references
- [ ] `/login` accessible only via direct URL
- [ ] Form validates client-side on blur
- [ ] Form validates server-side (422 errors)
- [ ] Reference code format: `SV-YYYY-XXXXX`
- [ ] Photo upload works (max 3, 10MB each)
- [ ] Geolocation "Locate Me" button works
- [ ] Track page shows correct status colors
- [ ] WebSocket updates work in real-time
- [ ] Toast notifications appear on updates
- [ ] Resident confirmation works (Completed status)
- [ ] Mobile responsive (< 640px)
- [ ] Database seeder creates admin + 10 tickets
- [ ] All admin routes require auth (401 without token)

### 🎯 Current Status

**Completed:**
- ✅ Civic design tokens CSS created
- ✅ Bug fixes (API URL, validation, tracking code)
- ✅ Backend running (Laravel on port 8000)
- ✅ Frontend running (React on port 5174)

**Next Steps:**
1. Get confirmation on scope
2. Create database migrations
3. Update route structure
4. Begin component redesign

### 💡 Recommendations

1. **Incremental Deployment:**
   - Keep current system running
   - Deploy new design to `/v2` first
   - Test thoroughly before switching

2. **Data Migration:**
   - Run migrations on staging first
   - Backup database before production migration
   - Test rollback procedure

3. **User Communication:**
   - Announce URL changes
   - Provide redirect notices
   - Update any printed materials with old URLs

### ❓ Questions for Clarification

1. **Timeline:** When does this need to be completed?
2. **Testing:** Do you have a staging environment?
3. **Data:** Should we migrate existing tickets to new format?
4. **WebSocket:** Do you have Laravel Reverb installed/configured?
5. **Photos:** Where should uploaded photos be stored? (S3, local storage?)
6. **Existing Users:** Are there active users we need to notify?

---

**Ready to proceed?** This is a substantial redesign. I recommend we:
1. Start with Phase 1 (Foundation)
2. Test each phase before moving forward
3. Keep the current system running until new one is fully tested

Let me know if you want to proceed with this plan or if you'd like to adjust the scope!
