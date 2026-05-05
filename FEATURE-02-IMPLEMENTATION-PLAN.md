# Feature 02: Real-Time Ticket Tracking and Status Management
## Implementation Plan

**Status**: 🚧 IN PROGRESS  
**Priority**: HIGH  
**Complexity**: Moderate to High

---

## 📋 Overview

Implement comprehensive real-time ticket tracking and status management system with:
- Real-time WebSocket updates using Laravel Reverb
- Role-based status transitions
- Priority-based queue management
- Complete audit trail
- Photo upload support
- Interactive map integration
- Analytics dashboard

---

## 🎯 Core Requirements

### 1. Ticket Lifecycle (6 Statuses)

| Status | Description | Who Can Set | Next Status |
|--------|-------------|-------------|-------------|
| **Pending** | Default on submission | System | Under Review |
| **Under Review** | Admin reviewing | Admin | In Progress, Rejected |
| **In Progress** | Work underway | Admin, Personnel | Completed |
| **Completed** | Work done | Personnel | Verification |
| **Verification** | Awaiting confirmation | System | Closed |
| **Rejected** | Invalid/Out of scope | Admin | - |

### 2. Role-Based Permissions

| Role | Permissions |
|------|-------------|
| **Guest** | View own ticket via tracking code, Confirm resolution |
| **Admin** | View all tickets, Assign to personnel, Change any status, Reject with reason, Monitor overdue |
| **Personnel** | View assigned tickets, Update to In Progress/Completed, Add work notes |

### 3. Priority System

- **High**: Emergency (ambulance, flooding, public safety) - Auto-flagged, top of queue
- **Medium**: Standard requests - Normal queue order
- **Low**: Non-urgent - Lower priority

---

## 🛠️ Technical Implementation

### Phase 1: Backend Infrastructure

#### 1.1 Database Schema Updates
```sql
-- Add new fields to tickets table
ALTER TABLE tickets ADD COLUMN priority VARCHAR(10) DEFAULT 'Medium';
ALTER TABLE tickets ADD COLUMN assigned_at TIMESTAMP NULL;
ALTER TABLE tickets ADD COLUMN completed_at TIMESTAMP NULL;
ALTER TABLE tickets ADD COLUMN verified_at TIMESTAMP NULL;
ALTER TABLE tickets ADD COLUMN rejection_reason TEXT NULL;
ALTER TABLE tickets ADD COLUMN work_notes TEXT NULL;
ALTER TABLE tickets ADD COLUMN estimated_completion TIMESTAMP NULL;

-- Create ticket_status_history table for audit trail
CREATE TABLE ticket_status_history (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_created_at (created_at)
);

-- Create ticket_photos table
CREATE TABLE ticket_photos (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    photo_path VARCHAR(255) NOT NULL,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket_id (ticket_id)
);
```

#### 1.2 Laravel Reverb Setup
```bash
# Install Laravel Reverb
composer require laravel/reverb

# Publish configuration
php artisan reverb:install

# Update .env
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

# Start Reverb server
php artisan reverb:start
```

#### 1.3 Broadcasting Events
```php
// app/Events/TicketStatusChanged.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticket;
    public $oldStatus;
    public $newStatus;
    public $changedBy;

    public function __construct($ticket, $oldStatus, $newStatus, $changedBy)
    {
        $this->ticket = $ticket;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->changedBy = $changedBy;
    }

    public function broadcastOn()
    {
        return [
            new Channel('tickets'),
            new Channel('ticket.' . $this->ticket->id),
        ];
    }

    public function broadcastAs()
    {
        return 'status.changed';
    }
}
```

#### 1.4 Status Transition Logic
```php
// app/Services/TicketStatusService.php
namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Events\TicketStatusChanged;
use Illuminate\Support\Facades\DB;

class TicketStatusService
{
    protected $allowedTransitions = [
        'Pending' => ['Under Review', 'Rejected'],
        'Under Review' => ['In Progress', 'Rejected'],
        'In Progress' => ['Completed', 'Under Review'],
        'Completed' => ['Verification', 'In Progress'],
        'Verification' => ['Closed'],
        'Rejected' => [],
        'Closed' => [],
    ];

    public function changeStatus(Ticket $ticket, string $newStatus, $user, ?string $reason = null, ?string $notes = null)
    {
        $oldStatus = $ticket->status;

        // Validate transition
        if (!$this->canTransition($oldStatus, $newStatus)) {
            throw new \Exception("Invalid status transition from {$oldStatus} to {$newStatus}");
        }

        // Validate permissions
        if (!$this->hasPermission($user, $oldStatus, $newStatus)) {
            throw new \Exception("User does not have permission to change status");
        }

        DB::beginTransaction();
        try {
            // Update ticket
            $ticket->status = $newStatus;
            if ($newStatus === 'Completed') {
                $ticket->completed_at = now();
            }
            if ($newStatus === 'Closed') {
                $ticket->verified_at = now();
            }
            if ($newStatus === 'Rejected') {
                $ticket->rejection_reason = $reason;
            }
            $ticket->save();

            // Log status change
            TicketStatusHistory::create([
                'ticket_id' => $ticket->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $user->id,
                'reason' => $reason,
                'notes' => $notes,
            ]);

            // Broadcast event
            broadcast(new TicketStatusChanged($ticket, $oldStatus, $newStatus, $user));

            DB::commit();
            return $ticket;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function canTransition(string $from, string $to): bool
    {
        return in_array($to, $this->allowedTransitions[$from] ?? []);
    }

    protected function hasPermission($user, string $from, string $to): bool
    {
        // Admin can do anything
        if ($user->portal === 'admin') {
            return true;
        }

        // Personnel can only update their assigned tickets
        if ($user->portal === 'personnel') {
            return in_array($to, ['In Progress', 'Completed']);
        }

        return false;
    }
}
```

### Phase 2: Frontend Real-Time Updates

#### 2.1 WebSocket Connection
```javascript
// REACT-FRONT-END/src/lib/websocket.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
});

export default echo;
```

#### 2.2 Real-Time Tracking Component
```javascript
// REACT-FRONT-END/src/pages/TrackRequest.jsx (enhanced)
import { useEffect } from 'react';
import echo from '../lib/websocket';

export default function TrackRequest() {
    // ... existing code ...

    useEffect(() => {
        if (ticket) {
            // Subscribe to ticket-specific channel
            const channel = echo.channel(`ticket.${ticket.id}`);
            
            channel.listen('.status.changed', (event) => {
                console.log('Status changed:', event);
                // Update ticket state
                setTicket(prev => ({
                    ...prev,
                    status: event.newStatus,
                    timeline: [...prev.timeline, {
                        status: event.newStatus,
                        note: event.notes,
                        updated_by: event.changedBy.name,
                        created_at: new Date().toISOString(),
                    }],
                }));
                
                // Show notification
                showNotification(`Status updated to ${event.newStatus}`);
            });

            return () => {
                channel.stopListening('.status.changed');
                echo.leave(`ticket.${ticket.id}`);
            };
        }
    }, [ticket]);

    // ... rest of component ...
}
```

### Phase 3: Photo Upload

#### 3.1 Backend Photo Upload
```php
// app/Http/Controllers/Api/V1/Guest/GuestController.php (enhanced)
public function uploadPhoto(Request $request, $ticketId)
{
    $request->validate([
        'photo' => 'required|image|max:5120', // 5MB max
    ]);

    $ticket = Ticket::where('tracking_id', $ticketId)->firstOrFail();

    $path = $request->file('photo')->store('ticket-photos', 'public');

    TicketPhoto::create([
        'ticket_id' => $ticket->id,
        'photo_path' => $path,
        'uploaded_by' => auth()->id(),
    ]);

    return response()->json([
        'success' => true,
        'photo_url' => Storage::url($path),
    ]);
}
```

#### 3.2 Frontend Photo Upload
```javascript
// REACT-FRONT-END/src/components/PhotoUpload.jsx
import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function PhotoUpload({ onUpload, maxFiles = 5 }) {
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > maxFiles) {
            alert(`Maximum ${maxFiles} photos allowed`);
            return;
        }

        setUploading(true);
        const uploaded = [];

        for (const file of files) {
            // Compress image
            const compressed = await compressImage(file);
            
            // Convert to base64
            const base64 = await fileToBase64(compressed);
            uploaded.push(base64);
        }

        setPhotos([...photos, ...uploaded]);
        onUpload([...photos, ...uploaded]);
        setUploading(false);
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Max dimensions
                    const maxWidth = 1200;
                    const maxHeight = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }, 'image/jpeg', 0.8);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index) => {
        const updated = photos.filter((_, i) => i !== index);
        setPhotos(updated);
        onUpload(updated);
    };

    return (
        <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                <ImageIcon size={14} style={{ display: 'inline', marginRight: 6 }} />
                Photos (Optional, max {maxFiles})
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                {photos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={photo} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                            onClick={() => removePhoto(idx)}
                            style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.7)',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {photos.length < maxFiles && (
                    <label style={{
                        aspectRatio: '1/1',
                        border: '2px dashed var(--border)',
                        borderRadius: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: 'var(--surface)',
                    }}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Uploading...</div>
                        ) : (
                            <>
                                <Upload size={24} color="var(--muted)" />
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Add Photo</div>
                            </>
                        )}
                    </label>
                )}
            </div>
        </div>
    );
}
```

### Phase 4: Interactive Map Integration

#### 4.1 Map Location Picker
```javascript
// REACT-FRONT-END/src/components/MapLocationPicker.jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function MapLocationPicker({ onLocationSelect, initialPosition }) {
    const [position, setPosition] = useState(initialPosition || {
        lat: 14.9547, // San Vicente, Apalit, Pampanga
        lng: 120.7584,
    });

    useEffect(() => {
        if (position) {
            // Reverse geocode to get address
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
                .then(res => res.json())
                .then(data => {
                    onLocationSelect({
                        latitude: position.lat,
                        longitude: position.lng,
                        address: data.display_name,
                    });
                });
        }
    }, [position]);

    return (
        <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                Location (Click on map to select)
            </label>
            <div style={{ height: 300, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
        </div>
    );
}
```

### Phase 5: Analytics Dashboard

#### 5.1 Guest Submission Analytics
```javascript
// REACT-FRONT-END/src/pages/admin/GuestAnalytics.jsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, MapPin } from 'lucide-react';

const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export default function GuestAnalytics() {
    const [dateRange, setDateRange] = useState('7d');

    // Mock data - replace with API call
    const categoryData = [
        { name: 'Streetlight', value: 45 },
        { name: 'Drainage', value: 32 },
        { name: 'Road', value: 28 },
        { name: 'Waste', value: 18 },
        { name: 'Water', value: 12 },
        { name: 'Other', value: 8 },
    ];

    const statusData = [
        { name: 'Pending', value: 23 },
        { name: 'Under Review', value: 18 },
        { name: 'In Progress', value: 45 },
        { name: 'Completed', value: 56 },
        { name: 'Rejected', value: 1 },
    ];

    const dailySubmissions = [
        { date: 'Mon', count: 12 },
        { date: 'Tue', count: 19 },
        { date: 'Wed', count: 15 },
        { date: 'Thu', count: 22 },
        { date: 'Fri', count: 18 },
        { date: 'Sat', count: 8 },
        { date: 'Sun', count: 6 },
    ];

    return (
        <div style={{ padding: 28 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--txt)', marginBottom: 8 }}>
                    Guest Submission Analytics
                </h1>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                    Track and analyze guest ticket submissions
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="#7C3AED" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Total Submissions</p>
                            <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--txt)' }}>143</p>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--green)' }}>
                        <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                        +12% from last week
                    </p>
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={20} color="#10B981" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Avg. Resolution Time</p>
                            <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--txt)' }}>14.2h</p>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--green)' }}>
                        <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                        -2.3h from last week
                    </p>
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={20} color="#F59E0B" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Active Tickets</p>
                            <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--txt)' }}>86</p>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        60% completion rate
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--txt)', marginBottom: 20 }}>
                        Submissions by Category
                    </h3>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={categoryData}
                            cx={200}
                            cy={150}
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--txt)', marginBottom: 20 }}>
                        Daily Submissions
                    </h3>
                    <BarChart width={400} height={300} data={dailySubmissions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#7C3AED" />
                    </BarChart>
                </div>
            </div>
        </div>
    );
}
```

---

## 📅 Implementation Timeline

### Week 1: Backend Infrastructure
- [ ] Database migrations (status history, photos)
- [ ] Laravel Reverb setup
- [ ] Broadcasting events
- [ ] Status transition service
- [ ] Photo upload API

### Week 2: Frontend Real-Time
- [ ] WebSocket connection
- [ ] Real-time tracking component
- [ ] Status update notifications
- [ ] Photo upload component
- [ ] Map location picker

### Week 3: Analytics & Polish
- [ ] Analytics dashboard
- [ ] Priority queue management
- [ ] Audit trail viewer
- [ ] Testing and bug fixes
- [ ] Documentation

---

## 🧪 Testing Checklist

### Status Transitions
- [ ] Pending → Under Review (Admin only)
- [ ] Under Review → In Progress (Admin only)
- [ ] In Progress → Completed (Personnel)
- [ ] Completed → Verification (System)
- [ ] Verification → Closed (Guest confirmation)
- [ ] Any → Rejected (Admin with reason)

### Real-Time Updates
- [ ] Status change broadcasts to all viewers
- [ ] Timeline updates in real-time
- [ ] Notifications appear immediately
- [ ] WebSocket reconnection on disconnect

### Photo Upload
- [ ] Image compression works
- [ ] Max 5 photos enforced
- [ ] Photos display in ticket view
- [ ] Photos stored securely

### Map Integration
- [ ] Map loads correctly
- [ ] Click to select location
- [ ] Reverse geocoding works
- [ ] Coordinates saved to database

### Analytics
- [ ] Category distribution chart
- [ ] Daily submissions chart
- [ ] Status breakdown
- [ ] Resolution time metrics

---

## 🚀 Deployment

### Environment Variables
```env
# Laravel Reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

# Frontend
VITE_REVERB_APP_KEY=your-app-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### Production Deployment
1. Run migrations
2. Start Reverb server
3. Build frontend
4. Deploy to Render
5. Configure WebSocket proxy

---

## ✅ Success Criteria

- [x] Commit and push current work
- [ ] All 6 statuses implemented
- [ ] Role-based permissions enforced
- [ ] Real-time updates working
- [ ] Photo upload functional
- [ ] Map integration complete
- [ ] Analytics dashboard live
- [ ] Audit trail complete
- [ ] Priority queue working
- [ ] All tests passing

---

**Status**: 🚧 Phase 1 Complete (Commit & Push)  
**Next**: Phase 2 - Backend Infrastructure  
**ETA**: 3 weeks
