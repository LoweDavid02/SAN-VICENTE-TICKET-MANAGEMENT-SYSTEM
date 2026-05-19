# Sidebar Layout Guide

## Overview
The application uses a responsive sidebar layout that adapts to different screen sizes and sidebar states (expanded/collapsed).

## Layout Structure

```
AppShell
├── Sidebar (fixed position, left side)
├── Topbar (fixed position, top)
└── Main Content Area
    └── app-content (dynamic padding)
```

## Sidebar States

### Desktop (≥ 1024px)
- **Expanded:** 240px width
- **Collapsed:** 64px width
- **Toggle:** Click anywhere on sidebar to toggle

### Tablet/Mobile (< 1024px)
- Sidebar hidden by default
- Mobile drawer slides in from left
- Hamburger menu in topbar

## Content Area Behavior

### Dynamic Width
The content area automatically adjusts based on:
1. Sidebar state (expanded/collapsed)
2. Viewport width
3. Screen size breakpoint

### Padding Logic

```css
/* Desktop */
padding-left: max(28px, calc((100vw - 1400px) / 2));
padding-right: max(28px, calc((100vw - 1400px) / 2));
```

**What this means:**
- Minimum 28px padding on each side
- Content centers when viewport > 1400px
- Content expands to full width when viewport < 1400px

### Width Calculations

| Viewport | Sidebar | Available Width | Content Width | Padding Each Side |
|----------|---------|-----------------|---------------|-------------------|
| 1920px   | 240px   | 1680px          | 1400px        | 140px             |
| 1920px   | 64px    | 1856px          | 1400px        | 228px             |
| 1440px   | 240px   | 1200px          | 1144px        | 28px              |
| 1440px   | 64px    | 1376px          | 1320px        | 28px              |
| 1280px   | 240px   | 1040px          | 984px         | 28px              |
| 1280px   | 64px    | 1216px          | 1160px        | 28px              |

## CSS Variables

```css
:root {
  --sidebar-w: 240px;      /* Expanded sidebar width */
  --sidebar-w-sm: 64px;    /* Collapsed sidebar width */
  --topbar-h: 64px;        /* Topbar height */
}
```

## Responsive Breakpoints

### Desktop (≥ 1024px)
```css
.app-content {
  padding: 28px;
  padding-left: max(28px, calc((100vw - 1400px) / 2));
  padding-right: max(28px, calc((100vw - 1400px) / 2));
}
```

### Tablet (768px - 1023px)
```css
.app-content {
  padding: 24px 20px;
  padding-left: max(20px, calc((100vw - 1200px) / 2));
  padding-right: max(20px, calc((100vw - 1200px) / 2));
}
```

### Mobile (≤ 767px)
```css
.app-content {
  padding: 16px 14px;
}
```

## Component Integration

### AppShell.jsx
```jsx
<main
  className="app-main"
  style={{
    marginLeft: sidebarW,  // Dynamic based on sidebar state
    paddingTop: 'var(--topbar-h)',
    minHeight: '100vh',
    transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
  }}
>
  <div className="app-content">
    <Outlet />
  </div>
</main>
```

### Sidebar.jsx
```jsx
<aside
  className="sidebar"
  style={{
    width: sidebarCollapsed ? 'var(--sidebar-w-sm)' : 'var(--sidebar-w)',
    // ... other styles
  }}
>
  {/* Sidebar content */}
</aside>
```

## Best Practices

### ✅ Do
- Use the `app-content` wrapper for all page content
- Let the layout system handle spacing
- Design for both sidebar states
- Test on different viewport sizes

### ❌ Don't
- Override `app-content` padding in individual pages
- Set fixed widths on page containers
- Assume sidebar width is constant
- Use absolute positioning for main content

## Common Patterns

### Full-Width Sections
If you need a section to break out of the content padding:

```jsx
<div style={{ margin: '0 -28px' }}>
  {/* Full-width content */}
</div>
```

### Grid Layouts
Use responsive grid columns:

```jsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 20 
}}>
  {/* Grid items */}
</div>
```

### Two-Column Layouts
```jsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: '1.45fr 1fr',
  gap: 20 
}}>
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

## Debugging

### Check Sidebar State
```javascript
const { sidebarCollapsed } = useApp();
console.log('Sidebar collapsed:', sidebarCollapsed);
```

### Inspect Content Width
```javascript
const contentEl = document.querySelector('.app-content');
console.log('Content width:', contentEl.offsetWidth);
console.log('Padding left:', getComputedStyle(contentEl).paddingLeft);
```

### Viewport Info
```javascript
console.log('Viewport width:', window.innerWidth);
console.log('Available width:', window.innerWidth - sidebarWidth);
```

## Troubleshooting

### Content Not Expanding
- Check if page has custom max-width
- Verify `app-content` class is present
- Inspect for overriding styles

### White Space on Sides
- Ensure no fixed max-width on page containers
- Check viewport width calculation
- Verify CSS is loaded correctly

### Sidebar Overlap
- Check z-index values
- Verify sidebar position is fixed
- Ensure main content has correct margin-left

## Related Files
- `REACT-FRONT-END/src/index.css` - Layout styles
- `REACT-FRONT-END/src/components/AppShell.jsx` - Layout wrapper
- `REACT-FRONT-END/src/components/Sidebar.jsx` - Sidebar component
- `REACT-FRONT-END/src/context/AppContext.jsx` - Sidebar state management

## References
- [Sidebar Collapse Content Expansion Fix](../implementation/SIDEBAR-COLLAPSE-CONTENT-EXPANSION-FIX.md)
- [Visual Explanation](../implementation/SIDEBAR-COLLAPSE-VISUAL-EXPLANATION.md)
