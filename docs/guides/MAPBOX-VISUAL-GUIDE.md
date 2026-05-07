# Mapbox Integration - Visual Guide

## 🗺️ What You'll See

### Dashboard with Mapbox Map

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                          [Refresh]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Total    │  │ Pending  │  │ In       │  │ Active   │       │
│  │ Tickets  │  │ Urgent   │  │ Progress │  │ Personnel│       │
│  │   245    │  │    12    │  │    45    │  │    18    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌────────────────────────────────────┐  ┌──────────────────┐  │
│  │  Complaint Map                     │  │  Dept Workload   │  │
│  │  Barangay San Vicente · Mapbox     │  │                  │  │
│  ├────────────────────────────────────┤  │  ▓▓▓▓▓▓▓░░░ 75%  │  │
│  │                                    │  │  ▓▓▓▓▓░░░░░ 50%  │  │
│  │         ╔═══════════════╗          │  │  ▓▓▓▓▓▓▓▓░░ 80%  │  │
│  │         ║               ║          │  │  ▓▓▓▓░░░░░░ 40%  │  │
│  │         ║   🔴 🟠 🟢   ║          │  └──────────────────┘  │
│  │         ║               ║          │                        │
│  │         ║  San Vicente  ║          │                        │
│  │         ║               ║          │                        │
│  │         ╚═══════════════╝          │                        │
│  │                                    │                        │
│  │  [+] [-] [📍] [🧭]                │                        │
│  └────────────────────────────────────┘                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Incident Log                                           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  🚨 TKT-001  Street Light Repair      [Pending]        │   │
│  │  ⚠️  TKT-002  Pothole on Main St      [In Progress]    │   │
│  │  📋 TKT-003  Garbage Collection       [Completed]      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Map Features

### 1. Interactive Markers

```
Marker Colors by Status:

🔴 Pending       - Red (#EF4444)
🟠 In Progress   - Orange (#F59E0B)
🟢 Completed     - Green (#10B981)
⚫ Rejected      - Gray (#6B7280)

Marker Behavior:
• Hover: Scale up (1.5x)
• Click: Show popup
• Smooth animations
```

### 2. Popup on Marker Click

```
┌─────────────────────────────────────┐
│  TKT-001  [Pending]            [×]  │
├─────────────────────────────────────┤
│  Street Light Repair                │
│                                     │
│  📍 Main Street, San Vicente        │
│  👤 Juan Dela Cruz                  │
└─────────────────────────────────────┘
```

### 3. Map Controls

```
Top Right Corner:

┌───┐
│ + │  Zoom In
├───┤
│ - │  Zoom Out
├───┤
│ 🧭 │  Geolocate (Find My Location)
└───┘

Bottom Right Corner:

┌───┐
│ 📍 │  Fly to My Location
├───┤
│ 🗺️ │  Show All Tickets
└───┘
```

### 4. Barangay Boundary

```
Map View:

    ╔═══════════════════════════╗
    ║                           ║
    ║    - - - - - - - - -      ║
    ║   |               |       ║
    ║   |  San Vicente  |       ║
    ║   |               |       ║
    ║    - - - - - - - - -      ║
    ║                           ║
    ╚═══════════════════════════╝

Legend:
- - - -  Barangay boundary (teal dashed line)
|     |  Boundary fill (transparent teal)
```

### 5. Geofence Alert

```
When Outside Boundary:

┌─────────────────────────────────────┐
│  ⚠️  You are outside Barangay       │
│      San Vicente                    │
└─────────────────────────────────────┘
     ↓ (appears at top of map)
```

## 📱 Mobile View

```
┌─────────────────────┐
│  Dashboard     [≡]  │
├─────────────────────┤
│  ┌───────┐ ┌───────┐│
│  │ Total │ │Pending││
│  │  245  │ │  12   ││
│  └───────┘ └───────┘│
│                     │
│  ┌─────────────────┐│
│  │  Complaint Map  ││
│  ├─────────────────┤│
│  │                 ││
│  │   ╔═══════╗     ││
│  │   ║ 🔴🟠🟢 ║     ││
│  │   ╚═══════╝     ││
│  │                 ││
│  │  [+][-][📍][🧭] ││
│  └─────────────────┘│
│                     │
│  ┌─────────────────┐│
│  │  Incident Log   ││
│  ├─────────────────┤│
│  │  🚨 TKT-001     ││
│  │  ⚠️  TKT-002     ││
│  └─────────────────┘│
└─────────────────────┘
```

## 🎬 User Interactions

### Scenario 1: View Ticket on Map

```
1. User opens Dashboard
   ↓
2. Map loads with markers
   ↓
3. User clicks red marker (🔴)
   ↓
4. Popup appears with ticket details
   ↓
5. User reads details
   ↓
6. User clicks [×] to close popup
```

### Scenario 2: Find My Location

```
1. User clicks geolocate button (🧭)
   ↓
2. Browser asks for permission
   ↓
3. User grants permission
   ↓
4. Map flies to user's location
   ↓
5. Blue dot appears at location
   ↓
6. If outside boundary:
   → Red alert appears
```

### Scenario 3: View All Tickets

```
1. User clicks "Show All Tickets" button
   ↓
2. Map calculates bounds of all markers
   ↓
3. Map animates to fit all markers
   ↓
4. All tickets are visible on screen
```

## 🎨 Color Scheme

### Map Colors

```
Primary Colors:
┌────────────────────────────────────┐
│  Teal (#14b8a6)    - Brand color   │
│  Red (#EF4444)     - Pending       │
│  Orange (#F59E0B)  - In Progress   │
│  Green (#10B981)   - Completed     │
│  Gray (#6B7280)    - Rejected      │
└────────────────────────────────────┘

Background Colors:
┌────────────────────────────────────┐
│  White (#FFFFFF)   - Popups        │
│  Light Gray (#F8FAFC) - Controls   │
│  Dark Gray (#1E293B) - Dark mode   │
└────────────────────────────────────┘
```

### Status Colors

```
Ticket Status Colors:

Pending:
┌─────────────────┐
│ ████████████    │  Red (#EF4444)
└─────────────────┘

In Progress:
┌─────────────────┐
│ ████████████    │  Orange (#F59E0B)
└─────────────────┘

Completed:
┌─────────────────┐
│ ████████████    │  Green (#10B981)
└─────────────────┘

Rejected:
┌─────────────────┐
│ ████████████    │  Gray (#6B7280)
└─────────────────┘
```

## 📐 Layout Dimensions

### Desktop Layout

```
Dashboard Grid:
┌─────────────────────────────────────────────────────────┐
│  KPI Cards (4 columns)                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ 245  │ │  12  │ │  45  │ │  18  │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                         │
│  Map + Workload (2 columns: 1.45fr + 1fr)              │
│  ┌────────────────────────┐ ┌──────────────┐          │
│  │                        │ │              │          │
│  │  Map (60%)             │ │  Workload    │          │
│  │  Height: 340px         │ │  (40%)       │          │
│  │                        │ │              │          │
│  └────────────────────────┘ └──────────────┘          │
│                                                         │
│  Incident Log (full width)                             │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Height: 420px                                  │  │
│  │  Scrollable                                     │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
Mobile Stack:
┌─────────────────┐
│  KPI Cards      │
│  (2 columns)    │
│  ┌────┐ ┌────┐  │
│  │245 │ │ 12 │  │
│  └────┘ └────┘  │
│  ┌────┐ ┌────┐  │
│  │ 45 │ │ 18 │  │
│  └────┘ └────┘  │
│                 │
│  Map            │
│  ┌─────────────┐│
│  │             ││
│  │  Height:    ││
│  │  300px      ││
│  │             ││
│  └─────────────┘│
│                 │
│  Workload       │
│  ┌─────────────┐│
│  │             ││
│  └─────────────┘│
│                 │
│  Incident Log   │
│  ┌─────────────┐│
│  │             ││
│  └─────────────┘│
└─────────────────┘
```

## 🎯 Interactive Elements

### Hover States

```
Marker Hover:
Normal:  ●  (14px)
Hover:   ●  (21px, 1.5x scale)

Button Hover:
Normal:  [Button]  (white background)
Hover:   [Button]  (light gray background)

Control Hover:
Normal:  [+]  (white background)
Hover:   [+]  (light gray background)
```

### Click States

```
Marker Click:
Before:  ●  (14px, normal)
After:   ●  (18px, selected)
         ↓
      [Popup appears]

Button Click:
Before:  [Button]  (normal)
During:  [Button]  (pressed, scale 0.95)
After:   [Button]  (normal)
         ↓
      [Action executes]
```

## 🔄 Loading States

### Map Loading

```
Initial Load:
┌─────────────────────────────────┐
│                                 │
│         ⟳  Loading map...       │
│                                 │
└─────────────────────────────────┘

Loaded:
┌─────────────────────────────────┐
│                                 │
│      ╔═══════════════╗          │
│      ║   🔴 🟠 🟢   ║          │
│      ╚═══════════════╝          │
│                                 │
└─────────────────────────────────┘
```

### Geolocation Loading

```
Getting Location:
┌─────────────────────────────────┐
│  ℹ️  Getting your location...   │
└─────────────────────────────────┘

Location Found:
┌─────────────────────────────────┐
│      ╔═══════════════╗          │
│      ║       ●       ║          │
│      ║   (you are    ║          │
│      ║    here)      ║          │
│      ╚═══════════════╝          │
└─────────────────────────────────┘
```

## 🎨 Animation Effects

### Map Animations

```
Fly To Location:
Start:  [Map at position A]
        ↓ (smooth animation, 1.5s)
End:    [Map at position B]

Fit Bounds:
Start:  [Map showing partial area]
        ↓ (smooth animation, 1s)
End:    [Map showing all markers]

Marker Hover:
Start:  ●  (14px)
        ↓ (scale animation, 0.2s)
End:    ●  (21px)
```

### Popup Animations

```
Popup Open:
Start:  [Hidden, scale 0.8, opacity 0]
        ↓ (cubic-bezier animation, 0.22s)
End:    [Visible, scale 1, opacity 1]

Popup Close:
Start:  [Visible, scale 1, opacity 1]
        ↓ (fade out, 0.15s)
End:    [Hidden, scale 0.8, opacity 0]
```

## 📊 Data Flow Visualization

```
API → Dashboard → Map → Markers
                    ↓
                  Popups
                    ↓
              User Interaction
                    ↓
              Event Handler
                    ↓
            Update State
                    ↓
              Re-render
```

## 🎓 For Academic Defense

### Key Visual Points

```
1. Modern UI/UX
   ✅ Clean, professional design
   ✅ Intuitive interactions
   ✅ Responsive layout

2. Interactive Features
   ✅ Clickable markers
   ✅ Informative popups
   ✅ Smooth animations

3. Geolocation
   ✅ Real-time tracking
   ✅ Visual feedback
   ✅ Error handling

4. Geofencing
   ✅ Boundary visualization
   ✅ Inside/outside detection
   ✅ Alert system

5. Performance
   ✅ Fast loading
   ✅ Smooth interactions
   ✅ Optimized rendering
```

---

**Visual Guide Version**: 1.0.0  
**Last Updated**: May 1, 2026  
**Status**: Complete

**Note**: This is a text-based visual guide. Actual implementation will have full colors, animations, and interactive elements as described.
