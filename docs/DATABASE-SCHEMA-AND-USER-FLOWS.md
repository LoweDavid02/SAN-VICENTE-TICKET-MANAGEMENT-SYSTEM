# 🗄️ BARANGAY CONNECT - COMPLETE DATABASE SCHEMA & USER FLOWS

**Project**: Barangay Connect - San Vicente Civic Engagement Platform  
**Database**: PostgreSQL  
**ORM**: Laravel Eloquent  
**Date**: May 7, 2026

---

## 📊 DATABASE OVERVIEW

### Total Tables: 15

**Core Tables** (5):
- users
- tickets
- ticket_timeline
- ticket_photos
- notifications

**Authentication & Authorization** (4):
- personal_access_tokens (Laravel Sanctum)
- permissions (Spatie)
- roles (Spatie)
- model_has_roles (Spatie)

**System Tables** (6):
- sessions
- password_reset_tokens
- cache
- jobs
- job_batches
- failed_jobs

---

## 📋 COMPLETE TABLE SCHEMAS

### 1. **users** (Core User Table)

All three user types (Civic/Guest, Admin, Personnel) are stored in this single table, differentiated by the portal field.

```sql
CREATE TABLE users (
    -- Primary Key
    id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic Information
    first_name          VARCHAR(255) NOT NULL,
    last_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at   TIMESTAMP NULL,
    password            VARCHAR(255) NOT NULL,
    
    -- User Type & Status
    portal              ENUM('admin', 'resident', 'personnel') DEFAULT 'resident',
    status              ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    
    -- Profile Information (added via migration)
    phone               VARCHAR(255) NULL,
    address             VARCHAR(255) NULL,
    bio                 TEXT NULL,
    avatar              TEXT NULL,  -- base64 or URL
    
    -- Laravel Defaults
    remember_token      VARCHAR(100) NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    deleted_at          TIMESTAMP NULL  -- Soft deletes
);
```

**Indexes**: email (unique), deleted_at

**User Types**:
- portal = 'admin' → Admin users (full system access)
- portal = 'personnel' → Personnel/Field workers (assigned tasks)
- portal = 'resident' → Registered residents (can submit tickets)

---

### 2. **tickets** (Main Ticket/Concern Table)

Stores all civic concerns/tickets from both registered users and guests.

```sql
CREATE TABLE tickets (
    -- Primary Key
    id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Tracking & Reference
    tracking_id         VARCHAR(20) UNIQUE NOT NULL,  -- e.g., SVR-001
    reference_code      VARCHAR(20) UNIQUE NULL,      -- Alternative tracking
    
    -- Ticket Information
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    category            VARCHAR(255) NOT NULL,  -- e.g., 'Road Repair', 'Garbage'
    location            VARCHAR(255) NOT NULL,
    
    -- Geolocation (added via migration)
    latitude            DECIMAL(10,7) NULL,
    longitude           DECIMAL(10,7) NULL,
    geocoded_address    VARCHAR(255) NULL,
    
    -- Priority & Status
    severity            ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status              ENUM('Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected') DEFAULT 'Pending',
    progress            INTEGER DEFAULT 10,  -- 0-100
    rejection_reason    TEXT NULL,
    
    -- Assignment
    resident_id         BIGINT UNSIGNED NULL,  -- FK to users (nullable for guests)
    assigned_to         BIGINT UNSIGNED NULL,  -- FK to users (personnel)
    
    -- Guest Information (for non-authenticated submissions)
    guest_name          VARCHAR(255) NULL,
    guest_email         VARCHAR(255) NULL,
    guest_phone         VARCHAR(255) NULL,
    guest_address       TEXT NULL,
    
    -- Additional Information
    field_note          TEXT NULL,  -- Notes from personnel
    images              JSON NULL,  -- Legacy: array of file paths
    
    -- Timestamps
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    deleted_at          TIMESTAMP NULL,  -- Soft deletes
    
    -- Foreign Keys
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
```

**Indexes** (Performance Optimized):
- 	racking_id (unique)
- 
eference_code (unique)
- status
- category
- severity
- created_at
- assigned_to
- 
esident_id
- (status, created_at) composite
- (assigned_to, status) composite
- (category, status) composite
- (latitude, longitude) composite (for map queries)

---

### 3. **ticket_timeline** (Status Change History)

Tracks all status changes and updates to tickets.

```sql
CREATE TABLE ticket_timeline (
    -- Primary Key
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Relationship
    ticket_id   BIGINT UNSIGNED NOT NULL,
    
    -- Status Change
    status      VARCHAR(255) NOT NULL,
    note        VARCHAR(255) NULL,
    
    -- Who Made the Change
    updated_by  BIGINT UNSIGNED NULL,
    
    -- Timestamps
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    -- Foreign Keys
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Indexes**:
- 	icket_id
- (ticket_id, created_at) composite

---

### 4. **ticket_photos** (Ticket Attachments)

Stores photo attachments for tickets.

```sql
CREATE TABLE ticket_photos (
    -- Primary Key
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Relationship
    ticket_id   BIGINT UNSIGNED NOT NULL,
    
    -- File Information
    file_path   VARCHAR(500) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    mime_type   VARCHAR(50) NOT NULL,
    file_size   INTEGER NOT NULL,  -- in bytes
    
    -- Timestamp
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);
```

**Indexes**: 	icket_id

---

### 5. **ticket_status_logs** (Detailed Status Audit Trail)

Comprehensive audit log for all status changes.

```sql
CREATE TABLE ticket_status_logs (
    -- Primary Key
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Relationship
    ticket_id   BIGINT UNSIGNED NOT NULL,
    
    -- Who Changed It
    changed_by  BIGINT UNSIGNED NULL,
    
    -- Status Change Details
    from_status VARCHAR(30) NOT NULL,
    to_status   VARCHAR(30) NOT NULL,
    note        TEXT NULL,
    
    -- Timestamp
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Indexes**: 	icket_id, created_at

---

### 6. **notifications** (User Notifications)

Stores notifications for all user types.

```sql
CREATE TABLE notifications (
    -- Primary Key
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Relationship
    user_id     BIGINT UNSIGNED NULL,
    
    -- Notification Content
    type        VARCHAR(255) NOT NULL,  -- 'success', 'info', 'warning', 'danger'
    title       VARCHAR(255) NOT NULL,
    body        TEXT NOT NULL,
    link        VARCHAR(255) NULL,
    portal      VARCHAR(255) NULL,  -- 'admin', 'personnel', 'resident'
    
    -- Read Status
    read        BOOLEAN DEFAULT FALSE,
    read_at     TIMESTAMP NULL,
    
    -- Timestamps
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    -- Foreign Key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes**:
- (user_id, read, created_at) composite
- (portal, created_at) composite

---

### 7. **personal_access_tokens** (Laravel Sanctum)

API authentication tokens for all users.

```sql
CREATE TABLE personal_access_tokens (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) UNIQUE NOT NULL,
    abilities       TEXT NULL,
    last_used_at    TIMESTAMP NULL,
    expires_at      TIMESTAMP NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    
    INDEX (tokenable_type, tokenable_id)
);
```

---

### 8. **permissions** (Spatie Permission)

System permissions.

```sql
CREATE TABLE permissions (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    guard_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    UNIQUE (name, guard_name)
);
```

---

### 9. **roles** (Spatie Permission)

User roles (admin, personnel, resident).

```sql
CREATE TABLE roles (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    guard_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    UNIQUE (name, guard_name)
);
```

---

### 10. **model_has_roles** (Spatie Permission)

Links users to their roles.

```sql
CREATE TABLE model_has_roles (
    role_id         BIGINT UNSIGNED NOT NULL,
    model_type      VARCHAR(255) NOT NULL,
    model_id        BIGINT UNSIGNED NOT NULL,
    
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

---

## 🔄 ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS TABLE                              │
│  (Admin, Personnel, Resident differentiated by 'portal' field)  │
└────────────┬────────────────────────────────────┬────────────────┘
             │                                    │
             │ 1:N (resident_id)                  │ 1:N (assigned_to)
             │                                    │
             ▼                                    ▼
┌────────────────────────────────────────────────────────────────┐
│                        TICKETS TABLE                            │
│  (Main concern/ticket table - supports both users & guests)    │
└──┬──────────┬──────────┬──────────────────────────────────┬───┘
   │          │          │                                  │
   │ 1:N      │ 1:N      │ 1:N                              │ 1:N
   │          │          │                                  │
   ▼          ▼          ▼                                  ▼
┌──────┐  ┌──────┐  ┌──────────┐                    ┌─────────────┐
│TICKET│  │TICKET│  │  TICKET  │                    │NOTIFICATIONS│
│PHOTOS│  │STATUS│  │ TIMELINE │                    │             │
│      │  │ LOGS │  │          │                    │             │
└──────┘  └──────┘  └────┬─────┘                    └──────┬──────┘
                         │                                  │
                         │ N:1 (updated_by)                 │ N:1 (user_id)
                         │                                  │
                         ▼                                  ▼
                    ┌─────────────────────────────────────────┐
                    │              USERS TABLE                 │
                    └─────────────────────────────────────────┘
```

---

## 👥 USER TYPES & ROLES

### 1. **CIVIC/GUEST USERS** (Unauthenticated)
- **Portal**: None (public access)
- **Database**: Guest info stored in 	ickets table
- **Fields Used**: guest_name, guest_email, guest_phone, guest_address
- **Capabilities**:
  - Submit concerns/tickets without registration
  - Track tickets using 	racking_id
  - View ticket status and timeline
  - Upload photos (up to 5)

### 2. **RESIDENT USERS** (Authenticated)
- **Portal**: portal = 'resident'
- **Role**: 
esident (Spatie)
- **Database**: Full user record in users table
- **Capabilities**:
  - All guest capabilities
  - Create account and login
  - View personal ticket history
  - Update profile information
  - Receive notifications

### 3. **PERSONNEL USERS** (Field Workers)
- **Portal**: portal = 'personnel'
- **Role**: personnel (Spatie)
- **Database**: Full user record in users table
- **Capabilities**:
  - View assigned tickets
  - Update ticket status
  - Add field notes
  - Upload progress photos
  - View task dashboard
  - Receive task notifications

### 4. **ADMIN USERS** (System Administrators)
- **Portal**: portal = 'admin'
- **Role**: dmin (Spatie)
- **Database**: Full user record in users table
- **Capabilities**:
  - Full system access
  - View all tickets
  - Assign tickets to personnel
  - Manage users (create, edit, delete)
  - View analytics dashboard
  - Manage system settings
  - View all notifications

---

## 🔄 COMPLETE USER FLOWS

### FLOW 1: CIVIC/GUEST USER JOURNEY

```
┌─────────────────────────────────────────────────────────────────┐
│                    CIVIC/GUEST USER FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. LANDING PAGE
   ↓
   User visits: http://localhost:5173/
   - Views hero section
   - Sees "Report a Concern" button
   
2. REPORT CONCERN
   ↓
   User clicks "Report a Concern"
   Route: /report-concern
   
   Form Fields:
   ├─ Guest Name* (guest_name)
   ├─ Email* (guest_email)
   ├─ Phone* (guest_phone)
   ├─ Address* (guest_address)
   ├─ Concern Title* (title)
   ├─ Description* (description)
   ├─ Category* (category)
   ├─ Location* (location)
   ├─ Severity (severity: Low/Medium/High)
   └─ Photos (up to 5 images)
   
3. FORM SUBMISSION
   ↓
   POST /api/v1/tickets
   
   Backend Process:
   ├─ Validate input (SubmitGuestTicketRequest)
   ├─ Generate tracking_id (e.g., SVR-001)
   ├─ Upload photos to storage
   ├─ Create ticket record
   │  ├─ resident_id = NULL
   │  ├─ guest_name = "John Doe"
   │  ├─ guest_email = "john@example.com"
   │  ├─ guest_phone = "+63 912 345 6789"
   │  ├─ guest_address = "123 Main St"
   │  ├─ status = "Pending"
   │  └─ progress = 10
   ├─ Create ticket_photos records
   ├─ Create ticket_timeline entry
   └─ Return tracking_id
   
4. SUCCESS PAGE
   ↓
   Route: /success
   
   Display:
   ├─ ✅ Success message
   ├─ 📋 Tracking ID: SVR-001
   ├─ 📧 Confirmation email sent
   ├─ 🔍 "Track Your Concern" button
   └─ 🏠 "Return to Home" button
   
5. TRACK CONCERN
   ↓
   User clicks "Track Your Concern"
   Route: /track-concern
   
   Input: Tracking ID (SVR-001)
   ↓
   GET /api/v1/tickets/track/{tracking_id}
   
   Backend Process:
   ├─ Find ticket by tracking_id
   ├─ Load ticket_timeline
   ├─ Load ticket_photos
   └─ Return ticket details
   
   Display:
   ├─ Ticket Information
   │  ├─ Title
   │  ├─ Description
   │  ├─ Category
   │  ├─ Location
   │  ├─ Status (Pending/Under Review/In Progress/Completed/Rejected)
   │  ├─ Progress Bar (10%, 30%, 60%, 100%)
   │  └─ Submitted Date
   ├─ Timeline
   │  ├─ [2026-05-07 10:00] Ticket submitted
   │  ├─ [2026-05-07 11:30] Under review by Admin
   │  ├─ [2026-05-07 14:00] Assigned to Personnel: Juan Dela Cruz
   │  └─ [2026-05-08 09:00] In Progress - Field work started
   └─ Photos (if any)

DATABASE RECORDS CREATED:
┌─────────────────────────────────────────────────────────────┐
│ tickets                                                      │
├─────────────────────────────────────────────────────────────┤
│ id: 1                                                        │
│ tracking_id: "SVR-001"                                       │
│ title: "Pothole on Main Street"                             │
│ description: "Large pothole causing traffic issues"         │
│ category: "Road Repair"                                      │
│ location: "Main Street, Brgy San Vicente"                   │
│ severity: "High"                                             │
│ status: "Pending"                                            │
│ progress: 10                                                 │
│ resident_id: NULL                                            │
│ assigned_to: NULL                                            │
│ guest_name: "John Doe"                                       │
│ guest_email: "john@example.com"                              │
│ guest_phone: "+63 912 345 6789"                              │
│ guest_address: "123 Main St"                                 │
│ latitude: 14.5995                                            │
│ longitude: 120.9842                                          │
│ created_at: 2026-05-07 10:00:00                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ticket_photos                                                │
├─────────────────────────────────────────────────────────────┤
│ id: 1                                                        │
│ ticket_id: 1                                                 │
│ file_path: "tickets/SVR-001/photo1.jpg"                     │
│ file_name: "pothole_photo.jpg"                              │
│ mime_type: "image/jpeg"                                      │
│ file_size: 245678                                            │
│ created_at: 2026-05-07 10:00:00                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ticket_timeline                                              │
├─────────────────────────────────────────────────────────────┤
│ id: 1                                                        │
│ ticket_id: 1                                                 │
│ status: "Pending"                                            │
│ note: "Ticket submitted by guest"                            │
│ updated_by: NULL                                             │
│ created_at: 2026-05-07 10:00:00                              │
└─────────────────────────────────────────────────────────────┘
```

---


### 7. **personal_access_tokens** (Laravel Sanctum)

API authentication tokens for all users.

```sql
CREATE TABLE personal_access_tokens (
    -- Primary Key
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Polymorphic Relationship
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT UNSIGNED NOT NULL,
    
    -- Token Information
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) UNIQUE NOT NULL,
    abilities       TEXT NULL,
    
    -- Token Lifecycle
    last_used_at    TIMESTAMP NULL,
    expires_at      TIMESTAMP NULL,
    
    -- Timestamps
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    
    -- Indexes
    INDEX (tokenable_type, tokenable_id)
);
```

---

### 8. **permissions** (Spatie Permission)

System permissions.

```sql
CREATE TABLE permissions (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    guard_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    UNIQUE KEY (name, guard_name)
);
```

---

### 9. **roles** (Spatie Permission)

User roles (admin, personnel, resident).

```sql
CREATE TABLE roles (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    guard_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    UNIQUE KEY (name, guard_name)
);
```

---

### 10. **model_has_roles** (Spatie Permission)

Links users to their roles.

```sql
CREATE TABLE model_has_roles (
    role_id         BIGINT UNSIGNED NOT NULL,
    model_type      VARCHAR(255) NOT NULL,
    model_id        BIGINT UNSIGNED NOT NULL,
    
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

---

## 🔗 DATABASE RELATIONSHIPS

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USERS TABLE                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ id, first_name, last_name, email, password                 │    │
│  │ portal: ['admin', 'resident', 'personnel']                 │    │
│  │ status: ['active', 'inactive', 'suspended']                │    │
│  │ phone, address, bio, avatar                                │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ (resident_id)      │ (assigned_to)      │ (updated_by)
         ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        TICKETS TABLE                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ id, tracking_id, reference_code                             │    │
│  │ title, description, category, location                      │    │
│  │ latitude, longitude, geocoded_address                       │    │
│  │ severity, status, progress, rejection_reason                │    │
│  │ resident_id (FK → users.id) [nullable for guests]           │    │
│  │ assigned_to (FK → users.id) [personnel]                     │    │
│  │ guest_name, guest_email, guest_phone, guest_address         │    │
│  │ field_note, images                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ (ticket_id)        │ (ticket_id)        │ (ticket_id)
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ TICKET       │    │ TICKET_PHOTOS    │    │ TICKET_STATUS_LOGS  │
│ TIMELINE     │    │                  │    │                     │
│              │    │ file_path        │    │ from_status         │
│ status       │    │ file_name        │    │ to_status           │
│ note         │    │ mime_type        │    │ changed_by (FK)     │
│ updated_by   │    │ file_size        │    │ note                │
└──────────────┘    └──────────────────┘    └─────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATIONS TABLE                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ id, user_id (FK → users.id)                                 │    │
│  │ type, title, body, link, portal                             │    │
│  │ read, read_at                                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION & AUTHORIZATION                      │
│  ┌─────────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ personal_access_    │  │ roles        │  │ permissions      │   │
│  │ tokens              │  │              │  │                  │   │
│  │ (Sanctum)           │  │ (Spatie)     │  │ (Spatie)         │   │
│  └─────────────────────┘  └──────────────┘  └──────────────────┘   │
│           │                      │                    │              │
│           └──────────────────────┴────────────────────┘              │
│                                  │                                   │
│                         ┌────────▼────────┐                          │
│                         │ model_has_roles │                          │
│                         │ (User → Role)   │                          │
│                         └─────────────────┘                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 👥 USER TYPES & ROLES

### 1. **CIVIC/GUEST USER** (Unauthenticated)

**Portal**: None (Public Access)  
**Database Record**: No user record created  
**Ticket Submission**: Uses `guest_*` fields in tickets table

**Capabilities**:
- ✅ Submit concerns/tickets (without login)
- ✅ Upload photos (up to 5 per ticket)
- ✅ Track ticket status using tracking code
- ✅ View ticket timeline/history
- ❌ Cannot edit submitted tickets
- ❌ Cannot view other tickets
- ❌ No dashboard access

**Database Fields Used**:
```sql
tickets.guest_name
tickets.guest_email
tickets.guest_phone
tickets.guest_address
tickets.tracking_id  -- For tracking without login
```

---

### 2. **RESIDENT USER** (Authenticated)

**Portal**: `portal = 'resident'`  
**Role**: `resident` (Spatie)  
**Database Record**: Full user record in `users` table

**Capabilities**:
- ✅ All guest capabilities
- ✅ Login to personal dashboard
- ✅ View all own submitted tickets
- ✅ Edit/update own tickets (before assignment)
- ✅ Receive notifications
- ✅ Manage profile
- ✅ View ticket statistics
- ❌ Cannot assign tickets
- ❌ Cannot change ticket status
- ❌ Cannot access admin features

**Database Fields Used**:
```sql
users.id
users.portal = 'resident'
tickets.resident_id = users.id  -- Links ticket to resident
notifications.user_id = users.id
```

---

### 3. **PERSONNEL USER** (Field Worker)

**Portal**: `portal = 'personnel'`  
**Role**: `personnel` (Spatie)  
**Database Record**: Full user record in `users` table

**Capabilities**:
- ✅ Login to personnel dashboard
- ✅ View assigned tickets only
- ✅ Update ticket status (Pending → In Progress → Completed)
- ✅ Add field notes to tickets
- ✅ Upload field photos
- ✅ View task statistics
- ✅ Receive task notifications
- ✅ Manage own profile
- ❌ Cannot assign tickets to others
- ❌ Cannot view unassigned tickets
- ❌ Cannot access admin features
- ❌ Cannot delete tickets

**Database Fields Used**:
```sql
users.id
users.portal = 'personnel'
tickets.assigned_to = users.id  -- Tickets assigned to this personnel
ticket_timeline.updated_by = users.id  -- Status changes made by personnel
notifications.user_id = users.id
```

---

### 4. **ADMIN USER** (System Administrator)

**Portal**: `portal = 'admin'`  
**Role**: `admin` (Spatie)  
**Database Record**: Full user record in `users` table

**Capabilities**:
- ✅ Full system access
- ✅ View ALL tickets (map view, list view, analytics)
- ✅ Assign tickets to personnel
- ✅ Change any ticket status
- ✅ Approve/Reject tickets
- ✅ Create/manage users (admin, personnel, resident)
- ✅ View system analytics and reports
- ✅ Manage personnel workload
- ✅ Send notifications
- ✅ Export data (PDF, CSV)
- ✅ View audit logs
- ✅ Manage system settings

**Database Fields Used**:
```sql
users.id
users.portal = 'admin'
tickets.assigned_to  -- Can assign to any personnel
ticket_timeline.updated_by = users.id  -- Admin status changes
ticket_status_logs.changed_by = users.id  -- Audit trail
notifications.user_id = users.id
```

---

## 🔄 COMPLETE USER FLOWS

### FLOW 1: CIVIC/GUEST USER JOURNEY

```
┌─────────────────────────────────────────────────────────────────┐
│                    CIVIC/GUEST USER FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. LANDING PAGE
   ↓
   User visits: http://localhost:5173/
   - Views hero section
   - Sees "Report a Concern" button
   - No login required

2. REPORT CONCERN PAGE
   ↓
   User clicks "Report a Concern"
   Route: /report-concern
   
   Form Fields:
   ┌──────────────────────────────────────────┐
   │ • Full Name (guest_name)                 │
   │ • Email (guest_email)                    │
   │ • Phone (guest_phone)                    │
   │ • Address (guest_address)                │
   │ • Concern Title (title)                  │
   │ • Description (description)              │
   │ • Category (category) - dropdown         │
   │ • Location (location) - with map picker  │
   │ • Severity (severity) - Low/Med/High     │
   │ • Photos (up to 5) - drag & drop         │
   └──────────────────────────────────────────┘

3. FORM SUBMISSION
   ↓
   POST /api/v1/tickets
   
   Backend Process:
   ┌──────────────────────────────────────────┐
   │ 1. Validate input (SubmitGuestTicket     │
   │    Request)                              │
   │ 2. Generate tracking_id (e.g., SVR-001)  │
   │ 3. Upload photos to storage              │
   │ 4. Geocode location (lat/lng)            │
   │ 5. Create ticket record:                 │
   │    - resident_id = NULL (guest)          │
   │    - guest_* fields populated            │
   │    - status = 'Pending'                  │
   │    - progress = 10                       │
   │ 6. Create ticket_photos records          │
   │ 7. Create initial timeline entry         │
   │ 8. Send confirmation email (optional)    │
   └──────────────────────────────────────────┘

4. SUCCESS PAGE
   ↓
   Route: /success
   
   Display:
   ┌──────────────────────────────────────────┐
   │ ✅ Concern Submitted Successfully!       │
   │                                          │
   │ Your Tracking Code:                      │
   │ ┌────────────────────────────────────┐  │
   │ │        SVR-001                     │  │
   │ └────────────────────────────────────┘  │
   │                                          │
   │ Save this code to track your concern!    │
   │                                          │
   │ [Track My Concern] [Submit Another]      │
   └──────────────────────────────────────────┘

5. TRACK CONCERN PAGE
   ↓
   User clicks "Track My Concern"
   Route: /track-concern
   
   Input:
   ┌──────────────────────────────────────────┐
   │ Enter Tracking Code:                     │
   │ ┌────────────────────────────────────┐  │
   │ │ SVR-001                            │  │
   │ └────────────────────────────────────┘  │
   │ [Track]                                  │
   └──────────────────────────────────────────┘

6. TRACKING RESULTS
   ↓
   GET /api/v1/tickets/track/{tracking_id}
   
   Display:
   ┌──────────────────────────────────────────┐
   │ Concern Details                          │
   │ ────────────────────────────────────     │
   │ Tracking ID: SVR-001                     │
   │ Title: Broken Street Light               │
   │ Category: Infrastructure                 │
   │ Status: In Progress (60%)                │
   │ Submitted: May 7, 2026                   │
   │                                          │
   │ Timeline:                                │
   │ • May 7, 10:00 AM - Submitted            │
   │ • May 7, 11:30 AM - Under Review         │
   │ • May 7, 2:00 PM - Assigned to Personnel │
   │ • May 7, 3:15 PM - In Progress           │
   │                                          │
   │ Photos: [View 3 photos]                  │
   │ Location: [View on Map]                  │
   └──────────────────────────────────────────┘

DATABASE RECORDS CREATED:
┌──────────────────────────────────────────┐
│ tickets:                                 │
│   id: 1                                  │
│   tracking_id: 'SVR-001'                 │
│   resident_id: NULL                      │
│   guest_name: 'Juan Dela Cruz'           │
│   guest_email: 'juan@email.com'          │
│   status: 'Pending'                      │
│                                          │
│ ticket_photos: (3 records)               │
│   ticket_id: 1                           │
│   file_path: 'tickets/1/photo1.jpg'      │
│                                          │
│ ticket_timeline: (1 record)              │
│   ticket_id: 1                           │
│   status: 'Pending'                      │
│   note: 'Ticket submitted'               │
└──────────────────────────────────────────┘
```

---

### FLOW 2: ADMIN USER JOURNEY

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN USER FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   ↓
   Route: /login
   POST /api/v1/auth/login
   
   Credentials:
   ┌──────────────────────────────────────────┐
   │ Email: admin@barangay.gov                │
   │ Password: Admin@123                      │
   │ Portal: admin                            │
   └──────────────────────────────────────────┘
   
   Backend:
   - Validates credentials
   - Checks portal = 'admin'
   - Checks status = 'active'
   - Creates Sanctum token
   - Returns user + token

2. ADMIN DASHBOARD
   ↓
   Route: /admin/dashboard
   GET /api/v1/admin/dashboard
   
   Display:
   ┌──────────────────────────────────────────┐
   │ Dashboard Overview                       │
   │ ────────────────────────────────────     │
   │ 📊 Statistics:                           │
   │   • Total Tickets: 150                   │
   │   • Pending: 25                          │
   │   • In Progress: 45                      │
   │   • Completed: 75                        │
   │   • Urgent: 5                            │
   │                                          │
   │ 👥 Users:                                │
   │   • Total Users: 50                      │
   │   • Personnel: 10                        │
   │   • Residents: 40                        │
   │                                          │
   │ Recent Tickets: [List of 10]             │
   │ Map View: [Interactive map]              │
   └──────────────────────────────────────────┘

3. VIEW ALL TICKETS
   ↓
   Route: /admin/requests
   GET /api/v1/admin/tickets
   
   Filters:
   ┌──────────────────────────────────────────┐
   │ Status: [All ▼] Category: [All ▼]        │
   │ Severity: [All ▼] Search: [_______]      │
   └──────────────────────────────────────────┘
   
   Ticket List:
   ┌──────────────────────────────────────────┐
   │ SVR-001 | Broken Street Light            │
   │ Status: Pending | Severity: High         │
   │ Submitted by: Juan Dela Cruz (Guest)     │
   │ Date: May 7, 2026                        │
   │ [View] [Assign] [Update Status]          │
   │ ────────────────────────────────────     │
   │ SVR-002 | Garbage Collection Issue       │
   │ Status: In Progress | Severity: Medium   │
   │ Assigned to: Pedro Santos (Personnel)    │
   │ Date: May 6, 2026                        │
   │ [View] [Reassign] [Update Status]        │
   └──────────────────────────────────────────┘

4. ASSIGN TICKET TO PERSONNEL
   ↓
   Click [Assign] on SVR-001
   
   Modal:
   ┌──────────────────────────────────────────┐
   │ Assign Ticket: SVR-001                   │
   │ ────────────────────────────────────     │
   │ Select Personnel:                        │
   │ ┌────────────────────────────────────┐  │
   │ │ Pedro Santos (5 active tasks)      │  │
   │ │ Maria Garcia (3 active tasks)      │  │
   │ │ Jose Reyes (7 active tasks)        │  │
   │ └────────────────────────────────────┘  │
   │                                          │
   │ Note (optional):                         │
   │ ┌────────────────────────────────────┐  │
   │ │ Urgent - needs immediate attention │  │
   │ └────────────────────────────────────┘  │
   │                                          │
   │ [Cancel] [Assign Ticket]                 │
   └──────────────────────────────────────────┘
   
   POST /api/v1/admin/tickets/1/assign
   
   Backend Process:
   ┌──────────────────────────────────────────┐
   │ 1. Update ticket:                        │
   │    - assigned_to = personnel_id          │
   │    - status = 'Under Review'             │
   │    - progress = 30                       │
   │ 2. Create timeline entry                 │
   │ 3. Create notification for personnel     │
   │ 4. Create notification for submitter     │
   │    (if email provided)                   │
   └──────────────────────────────────────────┘

5. UPDATE TICKET STATUS
   ↓
   Click [Update Status] on SVR-001
   
   Modal:
   ┌──────────────────────────────────────────┐
   │ Update Status: SVR-001                   │
   │ ────────────────────────────────────     │
   │ Current Status: Under Review             │
   │                                          │
   │ New Status:                              │
   │ ┌────────────────────────────────────┐  │
   │ │ • Pending                          │  │
   │ │ • Under Review                     │  │
   │ │ ✓ In Progress                      │  │
   │ │ • Completed                        │  │
   │ │ • Rejected                         │  │
   │ └────────────────────────────────────┘  │
   │                                          │
   │ Field Note:                              │
   │ ┌────────────────────────────────────┐  │
   │ │ Personnel dispatched to location   │  │
   │ └────────────────────────────────────┘  │
   │                                          │
   │ [Cancel] [Update Status]                 │
   └──────────────────────────────────────────┘
   
   PATCH /api/v1/admin/tickets/1/status
   
   Backend Process:
   ┌──────────────────────────────────────────┐
   │ 1. Update ticket:                        │
   │    - status = 'In Progress'              │
   │    - progress = 60                       │
   │    - field_note = note                   │
   │ 2. Create timeline entry                 │
   │ 3. Create status log entry               │
   │ 4. Send notifications                    │
   └──────────────────────────────────────────┘

6. VIEW MAP (GEOSPATIAL VIEW)
   ↓
   Route: /admin/map
   GET /api/v1/admin/map
   
   Display:
   ┌──────────────────────────────────────────┐
   │ Interactive Map View                     │
   │ ────────────────────────────────────     │
   │ Filters: Status [All ▼] Category [All ▼] │
   │                                          │
   │ [Interactive Leaflet Map]                │
   │ • Red markers: Pending/Urgent            │
   │ • Yellow markers: Under Review           │
   │ • Blue markers: In Progress              │
   │ • Green markers: Completed               │
   │                                          │
   │ Click marker to view ticket details      │
   └──────────────────────────────────────────┘

7. MANAGE PERSONNEL
   ↓
   Route: /admin/personnel
   GET /api/v1/admin/personnel
   
   Display:
   ┌──────────────────────────────────────────┐
   │ Personnel Management                     │
   │ ────────────────────────────────────     │
   │ [+ Create New Personnel]                 │
   │                                          │
   │ Pedro Santos                             │
   │ Email: pedro@barangay.gov                │
   │ Active Tasks: 5                          │
   │ Status: Active                           │
   │ [View] [Edit] [Deactivate]               │
   │ ────────────────────────────────────     │
   │ Maria Garcia                             │
   │ Email: maria@barangay.gov                │
   │ Active Tasks: 3                          │
   │ Status: Active                           │
   │ [View] [Edit] [Deactivate]               │
   └──────────────────────────────────────────┘

8. ANALYTICS & REPORTS
   ↓
   Route: /admin/analytics
   GET /api/v1/admin/analytics
   
   Display:
   ┌──────────────────────────────────────────┐
   │ System Analytics                         │
   │ ────────────────────────────────────     │
   │ 📊 Charts:                               │
   │   • Tickets by Status (Pie Chart)        │
   │   • Tickets by Category (Bar Chart)      │
   │   • Tickets Over Time (Line Chart)       │
   │   • Response Time Analysis               │
   │                                          │
   │ 📈 Metrics:                              │
   │   • Avg Resolution Time: 3.5 days        │
   │   • Completion Rate: 85%                 │
   │   • Customer Satisfaction: 4.2/5         │
   │                                          │
   │ [Export PDF] [Export CSV]                │
   └──────────────────────────────────────────┘

DATABASE QUERIES USED:
┌──────────────────────────────────────────┐
│ Dashboard:                               │
│   SELECT COUNT(*) FROM tickets           │
│   WHERE status = 'Pending'               │
│                                          │
│ Assign Ticket:                           │
│   UPDATE tickets                         │
│   SET assigned_to = ?, status = ?        │
│   WHERE id = ?                           │
│                                          │
│ Personnel List:                          │
│   SELECT u.*, COUNT(t.id) as tasks       │
│   FROM users u                           │
│   LEFT JOIN tickets t                    │
│     ON u.id = t.assigned_to              │
│   WHERE u.portal = 'personnel'           │
│   GROUP BY u.id                          │
└──────────────────────────────────────────┘
```

---


### 7. **personal_access_tokens** (Laravel Sanctum)

Manages API authentication tokens for all users.

```sql
CREATE TABLE personal_access_tokens (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) UNIQUE NOT NULL,
    abilities       TEXT NULL,
    last_used_at    TIMESTAMP NULL,
    expires_at      TIMESTAMP NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    
    INDEX (tokenable_type, tokenable_id)
);
```

---

### 8. **permissions** (Spatie Permission)

Defines system permissions.

```sql
CREATE TABLE permissions (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    guard_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    UNIQUE (name, guard_name)
);
```

---

### 9. **roles** (Spatie Permission)

Defines user roles (admin, personnel, resident).

```sql
CREATE TABLE roles (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    guard_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    
    UNIQUE (name, guard_name)
);
```

---

### 10. **model_has_roles** (Spatie Permission)

Links users to their roles.

```sql
CREATE TABLE model_has_roles (
    role_id         BIGINT UNSIGNED NOT NULL,
    model_type      VARCHAR(255) NOT NULL,
    model_id        BIGINT UNSIGNED NOT NULL,
    
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

---

## 🔗 ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BARANGAY CONNECT ERD                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │◄─────────┐
│ first_name   │          │
│ last_name    │          │ One-to-Many
│ email        │          │ (resident_id)
│ portal       │          │
│ status       │          │
└──────────────┘          │
       │                  │
       │ One-to-Many      │
       │ (assigned_to)    │
       │                  │
       ▼                  │
┌──────────────┐          │
│   tickets    │◄─────────┘
│──────────────│
│ id (PK)      │
│ tracking_id  │
│ title        │
│ description  │
│ category     │
│ status       │
│ resident_id  │ (FK → users.id) [nullable for guests]
│ assigned_to  │ (FK → users.id) [personnel]
│ guest_name   │ [for non-authenticated]
│ guest_email  │
│ latitude     │
│ longitude    │
└──────────────┘
       │
       │ One-to-Many
       ├─────────────────────┬─────────────────────┬──────────────────────┐
       │                     │                     │                      │
       ▼                     ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ticket_timeline│     │ticket_photos │     │ticket_status │     │notifications │
│──────────────│      │──────────────│     │    _logs     │     │──────────────│
│ id (PK)      │      │ id (PK)      │     │──────────────│     │ id (PK)      │
│ ticket_id(FK)│      │ ticket_id(FK)│     │ id (PK)      │     │ user_id (FK) │
│ status       │      │ file_path    │     │ ticket_id(FK)│     │ type         │
│ note         │      │ file_name    │     │ changed_by   │     │ title        │
│ updated_by   │      │ mime_type    │     │ from_status  │     │ body         │
└──────────────┘      └──────────────┘     │ to_status    │     │ read         │
                                            │ note         │     │ portal       │
                                            └──────────────┘     └──────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    roles     │      │ permissions  │      │model_has_roles│
│──────────────│      │──────────────│      │──────────────│
│ id (PK)      │      │ id (PK)      │      │ role_id (FK) │
│ name         │      │ name         │      │ model_type   │
│ guard_name   │      │ guard_name   │      │ model_id     │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                      │
       └─────────────────────┴──────────────────────┘
                             │
                    Many-to-Many
                             │
                             ▼
                      ┌──────────────┐
                      │    users     │
                      └──────────────┘
```

---

## 👥 COMPLETE USER FLOWS

### 🌐 FLOW 1: CIVIC/GUEST USER (Public - No Authentication)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CIVIC/GUEST USER JOURNEY                     │
└─────────────────────────────────────────────────────────────────┘

Step 1: LANDING PAGE
┌────────────────────────────────────┐
│  🏠 Landing Page (Public Access)   │
│  ─────────────────────────────────│
│  • View hero section               │
│  • Read about services             │
│  • Click "Report a Concern"        │
└────────────────────────────────────┘
                 │
                 ▼
Step 2: SUBMIT CONCERN FORM
┌────────────────────────────────────┐
│  📝 Report Concern Form            │
│  ─────────────────────────────────│
│  Required Fields:                  │
│  • Full Name                       │
│  • Email Address                   │
│  • Phone Number                    │
│  • Address                         │
│  • Category (dropdown)             │
│  • Description (textarea)          │
│  • Location (text/map)             │
│                                    │
│  Optional:                         │
│  • Upload Photos (max 5)           │
│  • Mark location on map            │
│                                    │
│  [Submit Concern Button]           │
└────────────────────────────────────┘
                 │
                 ▼
Step 3: BACKEND PROCESSING
┌────────────────────────────────────┐
│  ⚙️ System Processing               │
│  ─────────────────────────────────│
│  1. Validate input                 │
│  2. Generate tracking_id (SVR-XXX) │
│  3. Store in tickets table:        │
│     - guest_name                   │
│     - guest_email                  │
│     - guest_phone                  │
│     - guest_address                │
│     - resident_id = NULL           │
│     - status = 'Pending'           │
│  4. Upload photos to storage       │
│  5. Create ticket_photos records   │
│  6. Create timeline entry          │
│  7. Geocode location (lat/lng)     │
└────────────────────────────────────┘
                 │
                 ▼
Step 4: SUCCESS PAGE
┌────────────────────────────────────┐
│  ✅ Success Page                    │
│  ─────────────────────────────────│
│  "Concern Submitted Successfully!" │
│                                    │
│  Your Tracking Code:               │
│  ┌──────────────────────────────┐ │
│  │       SVR-001                │ │
│  └──────────────────────────────┘ │
│                                    │
│  Save this code to track your      │
│  concern's progress.               │
│                                    │
│  [Track My Concern]                │
│  [Submit Another Concern]          │
└────────────────────────────────────┘
                 │
                 ▼
Step 5: TRACK CONCERN (Anytime)
┌────────────────────────────────────┐
│  🔍 Track Concern Page             │
│  ─────────────────────────────────│
│  Enter Tracking Code:              │
│  ┌──────────────────────────────┐ │
│  │ SVR-001                      │ │
│  └──────────────────────────────┘ │
│  [Track]                           │
└────────────────────────────────────┘
                 │
                 ▼
Step 6: VIEW STATUS
┌────────────────────────────────────┐
│  📊 Concern Details                │
│  ─────────────────────────────────│
│  Tracking Code: SVR-001            │
│  Status: In Progress (60%)         │
│  Category: Road Repair             │
│  Location: Main Street             │
│  Submitted: May 1, 2026            │
│                                    │
│  Timeline:                         │
│  • May 1 - Submitted               │
│  • May 2 - Under Review            │
│  • May 3 - Assigned to Personnel   │
│  • May 5 - In Progress             │
│                                    │
│  Photos: [View Gallery]            │
│  Map: [View Location]              │
└────────────────────────────────────┘
```

**Database Operations (Guest Flow)**:
1. INSERT INTO tickets (guest_name, guest_email, tracking_id, status='Pending')
2. INSERT INTO ticket_photos (ticket_id, file_path)
3. INSERT INTO ticket_timeline (ticket_id, status='Pending')

---


### 👨‍💼 FLOW 2: ADMIN USER (Authenticated - Full System Access)

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN USER JOURNEY                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: LOGIN
┌────────────────────────────────────┐
│  🔐 Login Page                     │
│  ─────────────────────────────────│
│  Email: admin@barangay.gov         │
│  Password: ********                │
│  Portal: Admin                     │
│  [Login Button]                    │
└────────────────────────────────────┘
                 │
                 ▼
Step 2: AUTHENTICATION
┌────────────────────────────────────┐
│  ⚙️ Backend Auth                    │
│  ─────────────────────────────────│
│  1. Validate credentials           │
│  2. Check portal = 'admin'         │
│  3. Check status = 'active'        │
│  4. Generate Sanctum token         │
│  5. Return user + token            │
└────────────────────────────────────┘
                 │
                 ▼
Step 3: DASHBOARD
┌────────────────────────────────────┐
│  📊 Admin Dashboard                │
│  ─────────────────────────────────│
│  Statistics:                       │
│  • Total Tickets: 150              │
│  • Pending: 25                     │
│  • In Progress: 40                 │
│  • Completed: 80                   │
│  • Urgent: 5                       │
│                                    │
│  Recent Tickets (last 100):        │
│  [Table with filters]              │
│                                    │
│  Quick Actions:                    │
│  • View All Tickets                │
│  • View Map                        │
│  • Manage Personnel                │
│  • View Analytics                  │
└────────────────────────────────────┘
                 │
                 ├─────────────────┬─────────────────┬─────────────────┐
                 │                 │                 │                 │
                 ▼                 ▼                 ▼                 ▼
         ┌───────────┐     ┌───────────┐   ┌───────────┐     ┌───────────┐
         │  TICKETS  │     │    MAP    │   │ PERSONNEL │     │ ANALYTICS │
         └───────────┘     └───────────┘   └───────────┘     └───────────┘

FLOW 3A: MANAGE TICKETS
┌────────────────────────────────────┐
│  📋 All Tickets Page               │
│  ─────────────────────────────────│
│  Filters:                          │
│  • Status: [All ▼]                 │
│  • Category: [All ▼]               │
│  • Severity: [All ▼]               │
│  • Search: [________]              │
│                                    │
│  Tickets List:                     │
│  ┌──────────────────────────────┐ │
│  │ SVR-001 | Road Repair         │ │
│  │ Status: Pending | High        │ │
│  │ [View] [Assign] [Update]     │ │
│  ├──────────────────────────────┤ │
│  │ SVR-002 | Garbage Collection  │ │
│  │ Status: In Progress | Medium  │ │
│  │ [View] [Assign] [Update]     │ │
│  └──────────────────────────────┘ │
│                                    │
│  Pagination: [1] 2 3 ... 10        │
└────────────────────────────────────┘
                 │
                 ▼
FLOW 3B: ASSIGN TICKET
┌────────────────────────────────────┐
│  👤 Assign Ticket Modal            │
│  ─────────────────────────────────│
│  Ticket: SVR-001 - Road Repair     │
│                                    │
│  Select Personnel:                 │
│  ┌──────────────────────────────┐ │
│  │ Juan Dela Cruz               │ │
│  │ Active Tasks: 3              │ │
│  │ [Select]                     │ │
│  ├──────────────────────────────┤ │
│  │ Maria Santos                 │ │
│  │ Active Tasks: 5              │ │
│  │ [Select]                     │ │
│  └──────────────────────────────┘ │
│                                    │
│  Note (optional):                  │
│  [Urgent - needs immediate action] │
│                                    │
│  [Assign Ticket]                   │
└────────────────────────────────────┘
                 │
                 ▼
FLOW 3C: UPDATE STATUS
┌────────────────────────────────────┐
│  ✏️ Update Ticket Status            │
│  ─────────────────────────────────│
│  Ticket: SVR-001                   │
│  Current Status: Pending           │
│                                    │
│  New Status:                       │
│  ○ Pending                         │
│  ● Under Review                    │
│  ○ In Progress                     │
│  ○ Completed                       │
│  ○ Rejected                        │
│                                    │
│  Field Note:                       │
│  [Reviewed and approved for work]  │
│                                    │
│  [Update Status]                   │
└────────────────────────────────────┘
                 │
                 ▼
BACKEND PROCESSING (Admin Actions)
┌────────────────────────────────────┐
│  ⚙️ System Updates                  │
│  ─────────────────────────────────│
│  1. UPDATE tickets SET              │
│     assigned_to = personnel_id,    │
│     status = 'Under Review'        │
│  2. INSERT INTO ticket_timeline    │
│     (status, note, updated_by)     │
│  3. INSERT INTO ticket_status_logs │
│     (from_status, to_status)       │
│  4. INSERT INTO notifications      │
│     (user_id=personnel_id)         │
│  5. Return success                 │
└────────────────────────────────────┘

FLOW 3D: MAP VIEW
┌────────────────────────────────────┐
│  🗺️ Map View                        │
│  ─────────────────────────────────│
│  Filters:                          │
│  • Status: [All ▼]                 │
│  • Category: [All ▼]               │
│  • Date Range: [Last 30 days ▼]   │
│                                    │
│  [Interactive Map with Markers]    │
│  • Red pins: Pending               │
│  • Yellow pins: In Progress        │
│  • Green pins: Completed           │
│                                    │
│  Click marker to view details      │
│  Total markers: 45                 │
└────────────────────────────────────┘

FLOW 3E: MANAGE PERSONNEL
┌────────────────────────────────────┐
│  👥 Personnel Management            │
│  ─────────────────────────────────│
│  [+ Create New Personnel]          │
│                                    │
│  Personnel List:                   │
│  ┌──────────────────────────────┐ │
│  │ Juan Dela Cruz               │ │
│  │ Email: juan@barangay.gov     │ │
│  │ Active Tasks: 3              │ │
│  │ Status: Active               │ │
│  │ [View] [Edit] [Deactivate]  │ │
│  ├──────────────────────────────┤ │
│  │ Maria Santos                 │ │
│  │ Email: maria@barangay.gov    │ │
│  │ Active Tasks: 5              │ │
│  │ Status: Active               │ │
│  │ [View] [Edit] [Deactivate]  │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘

FLOW 3F: ANALYTICS
┌────────────────────────────────────┐
│  📈 Analytics Dashboard             │
│  ─────────────────────────────────│
│  Date Range: [Last 30 days ▼]     │
│                                    │
│  Charts:                           │
│  • Tickets by Status (Pie Chart)   │
│  • Tickets by Category (Bar Chart) │
│  • Tickets Over Time (Line Chart)  │
│  • Resolution Time (Bar Chart)     │
│                                    │
│  [Export PDF] [Export CSV]         │
└────────────────────────────────────┘
```

**Database Operations (Admin Flow)**:
1. SELECT * FROM tickets WHERE status='Pending' LIMIT 100
2. UPDATE tickets SET assigned_to=X, status='Under Review' WHERE id=Y
3. INSERT INTO ticket_timeline (ticket_id, status, note, updated_by)
4. INSERT INTO notifications (user_id, type, title, body, portal)
5. SELECT * FROM users WHERE portal='personnel' AND status='active'

---


### 👷 FLOW 3: PERSONNEL USER (Authenticated - Field Worker)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERSONNEL USER JOURNEY                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: LOGIN
┌────────────────────────────────────┐
│  🔐 Login Page                     │
│  ─────────────────────────────────│
│  Email: personnel@barangay.gov     │
│  Password: ********                │
│  Portal: Personnel                 │
│  [Login Button]                    │
└────────────────────────────────────┘
                 │
                 ▼
Step 2: AUTHENTICATION
┌────────────────────────────────────┐
│  ⚙️ Backend Auth                    │
│  ─────────────────────────────────│
│  1. Validate credentials           │
│  2. Check portal = 'personnel'     │
│  3. Check status = 'active'        │
│  4. Generate Sanctum token         │
│  5. Return user + token            │
└────────────────────────────────────┘
                 │
                 ▼
Step 3: DASHBOARD
┌────────────────────────────────────┐
│  📊 Personnel Dashboard            │
│  ─────────────────────────────────│
│  Welcome, Juan Dela Cruz!          │
│                                    │
│  My Task Summary:                  │
│  • Assigned Tasks: 8               │
│  • In Progress: 3                  │
│  • Completed Today: 2              │
│  • Urgent Tasks: 1                 │
│                                    │
│  Recent Notifications:             │
│  • New task assigned: SVR-045      │
│  • Task SVR-042 marked urgent      │
│                                    │
│  Quick Actions:                    │
│  • View My Tasks                   │
│  • View Task History               │
│  • Update Profile                  │
└────────────────────────────────────┘
                 │
                 ▼
Step 4: MY TASKS
┌────────────────────────────────────┐
│  📋 My Assigned Tasks              │
│  ─────────────────────────────────│
│  Filter: [All ▼] [Sort: Priority] │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 🔴 SVR-045 - Water Leak       │ │
│  │ Status: Pending | High        │ │
│  │ Location: Purok 3             │ │
│  │ Assigned: May 7, 2026         │ │
│  │ [View Details] [Start Work]  │ │
│  ├──────────────────────────────┤ │
│  │ 🟡 SVR-042 - Road Repair      │ │
│  │ Status: In Progress | Medium  │ │
│  │ Location: Main Street         │ │
│  │ Started: May 5, 2026          │ │
│  │ [View Details] [Update]      │ │
│  ├──────────────────────────────┤ │
│  │ 🟢 SVR-038 - Streetlight      │ │
│  │ Status: In Progress | Low     │ │
│  │ Location: Purok 1             │ │
│  │ Started: May 3, 2026          │ │
│  │ [View Details] [Update]      │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
                 │
                 ▼
Step 5: VIEW TASK DETAILS
┌────────────────────────────────────┐
│  📄 Task Details: SVR-042          │
│  ─────────────────────────────────│
│  Title: Road Repair Needed         │
│  Category: Infrastructure          │
│  Severity: Medium                  │
│  Status: In Progress (60%)         │
│                                    │
│  Description:                      │
│  Large pothole on Main Street      │
│  causing traffic issues.           │
│                                    │
│  Location: Main Street, Purok 2    │
│  [View on Map]                     │
│                                    │
│  Submitted by: Juan Santos         │
│  Email: juan@email.com             │
│  Phone: 0912-345-6789              │
│                                    │
│  Photos: [View 3 photos]           │
│                                    │
│  Timeline:                         │
│  • May 1 - Submitted               │
│  • May 2 - Assigned to you         │
│  • May 5 - Started work            │
│                                    │
│  [Update Status] [Add Note]        │
└────────────────────────────────────┘
                 │
                 ▼
Step 6: UPDATE TASK STATUS
┌────────────────────────────────────┐
│  ✏️ Update Task Status              │
│  ─────────────────────────────────│
│  Task: SVR-042 - Road Repair       │
│  Current Status: In Progress       │
│                                    │
│  New Status:                       │
│  ○ In Progress                     │
│  ● Completed                       │
│                                    │
│  Field Note (required):            │
│  ┌──────────────────────────────┐ │
│  │ Pothole filled and road       │ │
│  │ surface leveled. Work         │ │
│  │ completed successfully.       │ │
│  │ Materials used: 2 bags cement │ │
│  └──────────────────────────────┘ │
│                                    │
│  Upload Photos (optional):         │
│  [Choose Files] (0 selected)       │
│                                    │
│  [Update Task]                     │
└────────────────────────────────────┘
                 │
                 ▼
Step 7: BACKEND PROCESSING
┌────────────────────────────────────┐
│  ⚙️ System Updates                  │
│  ─────────────────────────────────│
│  1. UPDATE tickets SET              │
│     status = 'Completed',          │
│     progress = 100,                │
│     field_note = '...'             │
│  2. INSERT INTO ticket_timeline    │
│     (status, note, updated_by)     │
│  3. INSERT INTO ticket_status_logs │
│     (from_status, to_status)       │
│  4. INSERT INTO notifications      │
│     (user_id=admin_id)             │
│  5. INSERT INTO notifications      │
│     (user_id=resident_id)          │
│  6. Return success                 │
└────────────────────────────────────┘
                 │
                 ▼
Step 8: SUCCESS CONFIRMATION
┌────────────────────────────────────┐
│  ✅ Task Updated Successfully       │
│  ─────────────────────────────────│
│  Task SVR-042 marked as Completed  │
│                                    │
│  Notifications sent to:            │
│  • Admin                           │
│  • Resident (Juan Santos)          │
│                                    │
│  [View My Tasks]                   │
│  [View Task History]               │
└────────────────────────────────────┘

Step 9: TASK HISTORY
┌────────────────────────────────────┐
│  📜 My Task History                │
│  ─────────────────────────────────│
│  Filter: [Last 30 days ▼]         │
│                                    │
│  Completed Tasks:                  │
│  ┌──────────────────────────────┐ │
│  │ SVR-042 - Road Repair         │ │
│  │ Completed: May 7, 2026        │ │
│  │ Duration: 2 days              │ │
│  │ [View Details]                │ │
│  ├──────────────────────────────┤ │
│  │ SVR-038 - Streetlight         │ │
│  │ Completed: May 6, 2026        │ │
│  │ Duration: 3 days              │ │
│  │ [View Details]                │ │
│  └──────────────────────────────┘ │
│                                    │
│  Total Completed: 45               │
│  Average Duration: 2.5 days        │
└────────────────────────────────────┘
```

**Database Operations (Personnel Flow)**:
1. SELECT * FROM tickets WHERE assigned_to=personnel_id AND status!='Completed'
2. SELECT * FROM tickets WHERE id=X AND assigned_to=personnel_id
3. UPDATE tickets SET status='Completed', progress=100, field_note='...'
4. INSERT INTO ticket_timeline (ticket_id, status, note, updated_by)
5. INSERT INTO ticket_status_logs (ticket_id, from_status, to_status, changed_by)
6. INSERT INTO notifications (user_id, type, title, body, portal)

---

## 📊 DATABASE RELATIONSHIPS SUMMARY

### Primary Relationships

| Parent Table | Child Table | Relationship | Foreign Key | On Delete |
|--------------|-------------|--------------|-------------|-----------|
| users | tickets | One-to-Many | resident_id | CASCADE |
| users | tickets | One-to-Many | assigned_to | SET NULL |
| tickets | ticket_timeline | One-to-Many | ticket_id | CASCADE |
| tickets | ticket_photos | One-to-Many | ticket_id | CASCADE |
| tickets | ticket_status_logs | One-to-Many | ticket_id | CASCADE |
| users | ticket_timeline | One-to-Many | updated_by | SET NULL |
| users | ticket_status_logs | One-to-Many | changed_by | SET NULL |
| users | notifications | One-to-Many | user_id | CASCADE |
| roles | model_has_roles | One-to-Many | role_id | CASCADE |
| users | model_has_roles | One-to-Many | model_id | CASCADE |

### Key Constraints

1. **tickets.tracking_id** - UNIQUE, NOT NULL
2. **tickets.resident_id** - NULLABLE (allows guest submissions)
3. **tickets.assigned_to** - NULLABLE (unassigned tickets)
4. **users.email** - UNIQUE, NOT NULL
5. **users.portal** - ENUM('admin', 'resident', 'personnel')
6. **tickets.status** - ENUM('Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected')

---

## 🔄 TICKET STATUS WORKFLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    TICKET STATUS LIFECYCLE                      │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   PENDING    │ ← Guest/Resident submits
                    │  (Progress:  │
                    │     10%)     │
                    └──────┬───────┘
                           │
                           │ Admin reviews
                           ▼
                    ┌──────────────┐
                    │UNDER REVIEW  │
                    │  (Progress:  │
                    │     30%)     │
                    └──────┬───────┘
                           │
                           │ Admin assigns to Personnel
                           ▼
                    ┌──────────────┐
                    │ IN PROGRESS  │ ← Personnel working
                    │  (Progress:  │
                    │   30-90%)    │
                    └──────┬───────┘
                           │
                           │ Personnel completes
                           ▼
                    ┌──────────────┐
                    │  COMPLETED   │
                    │  (Progress:  │
                    │    100%)     │
                    └──────────────┘

                    Alternative Path:
                    ┌──────────────┐
                    │   PENDING    │
                    └──────┬───────┘
                           │
                           │ Admin rejects
                           ▼
                    ┌──────────────┐
                    │   REJECTED   │
                    │  (Progress:  │
                    │      0%)     │
                    └──────────────┘
```

### Status Transitions

| From Status | To Status | Who Can Change | Notes |
|-------------|-----------|----------------|-------|
| Pending | Under Review | Admin | Initial review |
| Pending | Rejected | Admin | Invalid/duplicate |
| Under Review | In Progress | Admin/Personnel | Work started |
| Under Review | Rejected | Admin | After review |
| In Progress | Completed | Personnel | Work finished |
| In Progress | Pending | Admin | Reassignment needed |
| Any | Any | Admin | Full control |

---

## 🔐 KEY BUSINESS RULES

### Authentication & Authorization
1. **Guest Users**: Can submit tickets and track using tracking_id (no authentication)
2. **Registered Users**: Must login with email/password
3. **Portal Enforcement**: Users can only access their designated portal
4. **Token-Based Auth**: Laravel Sanctum for API authentication
5. **Role-Based Access**: Spatie Permission for role management

### Ticket Management
1. **Tracking ID**: Auto-generated unique code (e.g., SVR-001)
2. **Guest Submissions**: resident_id is NULL, guest fields populated
3. **Registered Submissions**: resident_id populated, guest fields NULL
4. **Assignment**: Only Admin can assign tickets to Personnel
5. **Status Updates**: Personnel can only update their assigned tickets
6. **Soft Deletes**: Tickets and users can be restored

### Notifications
1. **Status Changes**: Trigger notifications to relevant users
2. **Assignment**: Notify personnel when ticket assigned
3. **Completion**: Notify admin and resident when completed
4. **Portal-Specific**: Notifications filtered by portal

### Data Integrity
1. **Cascade Deletes**: Deleting ticket removes timeline, photos, logs
2. **Set NULL**: Deleting user sets assigned_to/updated_by to NULL
3. **Unique Constraints**: tracking_id, email must be unique
4. **Required Fields**: title, description, category, location

### Performance
1. **Indexes**: 15+ indexes for fast queries
2. **Pagination**: Limit results to 50-100 records
3. **Eager Loading**: Load relationships to prevent N+1 queries
4. **Caching**: Use Laravel cache for frequently accessed data

---

## 📈 DATA FLOW EXAMPLES

### Example 1: Guest Submits Ticket

```
1. Guest fills form on Landing page
   ↓
2. POST /api/v1/tickets
   {
     "guest_name": "Juan Santos",
     "guest_email": "juan@email.com",
     "title": "Road Repair",
     "category": "Infrastructure",
     "description": "Large pothole",
     "location": "Main Street",
     "photos": [file1, file2]
   }
   ↓
3. Backend Processing:
   - Generate tracking_id: SVR-001
   - INSERT INTO tickets (guest_name, guest_email, tracking_id, status='Pending')
   - Upload photos to storage
   - INSERT INTO ticket_photos (ticket_id, file_path)
   - INSERT INTO ticket_timeline (ticket_id, status='Pending')
   - Geocode location (latitude, longitude)
   ↓
4. Return Response:
   {
     "success": true,
     "tracking_id": "SVR-001",
     "message": "Ticket submitted successfully"
   }
   ↓
5. Guest receives tracking code
```

### Example 2: Admin Assigns Ticket

```
1. Admin views ticket SVR-001
   ↓
2. Admin clicks "Assign" and selects Personnel
   ↓
3. PATCH /api/v1/admin/tickets/1/assign
   {
     "personnel_id": 5,
     "note": "Urgent - needs immediate attention"
   }
   ↓
4. Backend Processing:
   - UPDATE tickets SET assigned_to=5, status='Under Review', progress=30
   - INSERT INTO ticket_timeline (ticket_id, status='Under Review', note, updated_by=admin_id)
   - INSERT INTO ticket_status_logs (ticket_id, from_status='Pending', to_status='Under Review', changed_by=admin_id)
   - INSERT INTO notifications (user_id=5, type='info', title='New Task Assigned', body='SVR-001 assigned to you', portal='personnel')
   ↓
5. Personnel receives notification
```

### Example 3: Personnel Completes Task

```
1. Personnel views assigned task SVR-001
   ↓
2. Personnel updates status to "Completed"
   ↓
3. PATCH /api/v1/personnel/tasks/1/status
   {
     "status": "Completed",
     "field_note": "Work completed successfully"
   }
   ↓
4. Backend Processing:
   - UPDATE tickets SET status='Completed', progress=100, field_note='...'
   - INSERT INTO ticket_timeline (ticket_id, status='Completed', note, updated_by=personnel_id)
   - INSERT INTO ticket_status_logs (ticket_id, from_status='In Progress', to_status='Completed', changed_by=personnel_id)
   - INSERT INTO notifications (user_id=admin_id, type='success', title='Task Completed', body='SVR-001 completed', portal='admin')
   - INSERT INTO notifications (user_id=resident_id, type='success', title='Your Concern Resolved', body='SVR-001 completed', portal='resident')
   ↓
5. Admin and Resident receive notifications
```

---

## 🎯 CONCLUSION

This database schema supports a complete civic engagement platform with:

✅ **3 User Types**: Civic/Guest (public), Admin (management), Personnel (field workers)  
✅ **Guest Submissions**: No authentication required for public concerns  
✅ **Comprehensive Tracking**: Full audit trail with timeline and status logs  
✅ **Role-Based Access**: Spatie Permission for granular control  
✅ **Geolocation**: Latitude/longitude for map visualization  
✅ **Notifications**: Real-time updates for all stakeholders  
✅ **Performance Optimized**: 15+ indexes for fast queries  
✅ **Data Integrity**: Foreign keys, constraints, soft deletes  
✅ **Scalable Architecture**: Clean separation of concerns  

**Total Tables**: 15  
**Total Indexes**: 20+  
**Total Relationships**: 10+  

---

**Document Version**: 1.0  
**Last Updated**: May 7, 2026  
**Status**: Production Ready ✅

