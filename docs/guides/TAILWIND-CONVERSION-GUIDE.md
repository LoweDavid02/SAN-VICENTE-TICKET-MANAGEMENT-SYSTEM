# Tailwind CSS Conversion Guide

## Overview
This guide shows how to convert inline styles to Tailwind CSS classes for consistency across the application.

---

## Conversion Patterns

### 1. Layout & Spacing

#### Inline Style → Tailwind
```jsx
// Before
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

// After
<div className="flex items-center gap-2">
```

#### Common Conversions
- `display: 'flex'` → `flex`
- `display: 'grid'` → `grid`
- `alignItems: 'center'` → `items-center`
- `justifyContent: 'center'` → `justify-center`
- `gap: 8` → `gap-2` (8px = 0.5rem = 2 in Tailwind)
- `gap: 12` → `gap-3`
- `gap: 16` → `gap-4`
- `gap: 20` → `gap-5`
- `gap: 24` → `gap-6`
- `padding: 16` → `p-4`
- `margin: 24` → `m-6`

### 2. Colors

#### Inline Style → Tailwind
```jsx
// Before
<div style={{ background: '#0058be', color: 'white' }}>

// After
<div className="bg-blue-600 text-white">
```

#### Color Palette
- `#0058be` (Primary Blue) → `bg-blue-600` or `text-blue-600`
- `#ffffff` (White) → `bg-white` or `text-white`
- `#000000` (Black) → `bg-black` or `text-black`
- `#6B7280` (Gray) → `bg-gray-500` or `text-gray-500`
- `#10B981` (Green) → `bg-green-500` or `text-green-500`
- `#EF4444` (Red) → `bg-red-500` or `text-red-500`
- `#F59E0B` (Amber) → `bg-amber-500` or `text-amber-500`

### 3. Typography

#### Inline Style → Tailwind
```jsx
// Before
<h1 style={{ fontSize: 32, fontWeight: 600, color: '#000000' }}>

// After
<h1 className="text-3xl font-semibold text-black">
```

#### Font Sizes
- `fontSize: 12` → `text-xs`
- `fontSize: 14` → `text-sm`
- `fontSize: 16` → `text-base`
- `fontSize: 18` → `text-lg`
- `fontSize: 20` → `text-xl`
- `fontSize: 24` → `text-2xl`
- `fontSize: 32` → `text-3xl`
- `fontSize: 36` → `text-4xl`

#### Font Weights
- `fontWeight: 400` → `font-normal`
- `fontWeight: 500` → `font-medium`
- `fontWeight: 600` → `font-semibold`
- `fontWeight: 700` → `font-bold`

### 4. Borders & Radius

#### Inline Style → Tailwind
```jsx
// Before
<div style={{ border: '1px solid #E5E7EB', borderRadius: 12 }}>

// After
<div className="border border-gray-200 rounded-xl">
```

#### Border Radius
- `borderRadius: 4` → `rounded`
- `borderRadius: 6` → `rounded-md`
- `borderRadius: 8` → `rounded-lg`
- `borderRadius: 12` → `rounded-xl`
- `borderRadius: 16` → `rounded-2xl`
- `borderRadius: '50%'` → `rounded-full`

### 5. Buttons

#### Inline Style → Tailwind
```jsx
// Before
<button style={{
  padding: '14px 32px',
  borderRadius: 12,
  border: 'none',
  background: '#0058be',
  color: 'white',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}}>

// After
<button className="px-8 py-3.5 rounded-xl border-none bg-blue-600 text-white text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-all duration-200">
```

### 6. Hover & Transitions

#### Inline Style → Tailwind
```jsx
// Before
<button 
  style={{ transition: 'all 0.2s ease' }}
  onMouseEnter={(e) => e.currentTarget.style.background = '#004a9f'}
  onMouseLeave={(e) => e.currentTarget.style.background = '#0058be'}
>

// After
<button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200">
```

### 7. Positioning

#### Inline Style → Tailwind
```jsx
// Before
<div style={{ position: 'relative', zIndex: 1 }}>

// After
<div className="relative z-10">
```

### 8. Sizing

#### Inline Style → Tailwind
```jsx
// Before
<div style={{ width: 48, height: 48, minWidth: 200 }}>

// After
<div className="w-12 h-12 min-w-[200px]">
```

#### Common Sizes
- `width: 24` → `w-6`
- `width: 48` → `w-12`
- `width: 96` → `w-24`
- `width: '100%'` → `w-full`
- `maxWidth: 900` → `max-w-4xl`
- `minHeight: '100vh'` → `min-h-screen`

---

## Example: Complete Button Conversion

### Before (Inline Styles)
```jsx
<button
  onClick={() => navigate('/')}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    background: 'white',
    fontSize: 14,
    color: '#6B7280',
    cursor: 'pointer',
    marginBottom: 24,
    transition: 'all 0.2s ease',
  }}
  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
>
  <span className="material-symbols-outlined" style={{ fontSize: 16, pointerEvents: 'none' }}>
    arrow_back
  </span>
  <span style={{ pointerEvents: 'none' }}>Back to Home</span>
</button>
```

### After (Tailwind CSS)
```jsx
<button
  onClick={() => navigate('/')}
  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 cursor-pointer mb-6 transition-all duration-200 hover:bg-gray-50"
>
  <span className="material-symbols-outlined text-base pointer-events-none">
    arrow_back
  </span>
  <span className="pointer-events-none">Back to Home</span>
</button>
```

---

## Example: Form Input Conversion

### Before (Inline Styles)
```jsx
<input
  type="text"
  style={{
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    fontSize: 15,
    color: '#000000',
    background: 'white',
  }}
  placeholder="Enter your name"
/>
```

### After (Tailwind CSS)
```jsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-black bg-white placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
  placeholder="Enter your name"
/>
```

---

## Example: Card Conversion

### Before (Inline Styles)
```jsx
<div style={{
  background: 'white',
  borderRadius: 16,
  padding: 32,
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  marginBottom: 24,
}}>
  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000000', marginBottom: 12 }}>
    Card Title
  </h3>
  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
    Card content goes here
  </p>
</div>
```

### After (Tailwind CSS)
```jsx
<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md mb-6">
  <h3 className="text-lg font-semibold text-black mb-3">
    Card Title
  </h3>
  <p className="text-sm text-gray-500 leading-relaxed">
    Card content goes here
  </p>
</div>
```

---

## Custom Tailwind Classes Needed

Add these to `tailwind.config.js` for custom values:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0058be',
        'primary-blue-dark': '#004a9f',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'button': '0 2px 4px rgba(0, 88, 190, 0.2)',
        'button-hover': '0 4px 8px rgba(0, 88, 190, 0.3)',
      },
    },
  },
}
```

---

## Grid Layouts

### Before (Inline Styles)
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 20,
}}>
```

### After (Tailwind CSS)
```jsx
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
```

Or use responsive classes:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
```

---

## Responsive Design

### Before (Inline Styles + Media Queries)
```jsx
<div style={{ padding: window.innerWidth < 640 ? 16 : 32 }}>
```

### After (Tailwind CSS)
```jsx
<div className="p-4 md:p-8">
```

#### Breakpoints
- `sm:` → 640px and up
- `md:` → 768px and up
- `lg:` → 1024px and up
- `xl:` → 1280px and up

---

## Animation Classes

### Before (Inline Styles)
```jsx
<div style={{ animation: 'scaleIn 0.5s ease-out' }}>
```

### After (Tailwind CSS)
```jsx
<div className="animate-[scaleIn_0.5s_ease-out]">
```

Or define in config:
```javascript
// tailwind.config.js
animation: {
  'scale-in': 'scaleIn 0.5s ease-out',
}

// Component
<div className="animate-scale-in">
```

---

## Arbitrary Values

For one-off values not in Tailwind's scale:

```jsx
// Specific pixel values
<div className="w-[350px] h-[450px]">

// Specific colors
<div className="bg-[#0058be]">

// Specific transforms
<div className="translate-x-[calc(50%-10px)]">
```

---

## Quick Reference Table

| Inline Style | Tailwind Class |
|-------------|----------------|
| `display: flex` | `flex` |
| `display: grid` | `grid` |
| `flexDirection: column` | `flex-col` |
| `alignItems: center` | `items-center` |
| `justifyContent: space-between` | `justify-between` |
| `gap: 16px` | `gap-4` |
| `padding: 16px` | `p-4` |
| `paddingLeft: 16px` | `pl-4` |
| `margin: 16px` | `m-4` |
| `marginTop: 16px` | `mt-4` |
| `width: 100%` | `w-full` |
| `height: 100%` | `h-full` |
| `maxWidth: 1200px` | `max-w-7xl` |
| `fontSize: 16px` | `text-base` |
| `fontWeight: 600` | `font-semibold` |
| `color: #000` | `text-black` |
| `background: #fff` | `bg-white` |
| `border: 1px solid #E5E7EB` | `border border-gray-200` |
| `borderRadius: 8px` | `rounded-lg` |
| `cursor: pointer` | `cursor-pointer` |
| `opacity: 0.5` | `opacity-50` |
| `position: relative` | `relative` |
| `position: absolute` | `absolute` |
| `zIndex: 10` | `z-10` |
| `overflow: hidden` | `overflow-hidden` |
| `textAlign: center` | `text-center` |
| `textTransform: uppercase` | `uppercase` |
| `letterSpacing: 0.1em` | `tracking-wider` |
| `lineHeight: 1.6` | `leading-relaxed` |
| `boxShadow: ...` | `shadow-md` |
| `transition: all 0.2s` | `transition-all duration-200` |

---

## Next Steps

1. **Update tailwind.config.js** with custom colors and values
2. **Convert components one by one** starting with the most used
3. **Test responsiveness** on different screen sizes
4. **Remove unused CSS** from index.css after conversion
5. **Use Tailwind IntelliSense** VSCode extension for autocomplete

---

## Benefits of Tailwind

✅ **Consistency** - All components use the same design system
✅ **Maintainability** - Easier to update styles globally
✅ **Performance** - Smaller CSS bundle (unused classes purged)
✅ **Responsive** - Built-in responsive utilities
✅ **Developer Experience** - Faster development with utility classes
✅ **No CSS conflicts** - Scoped utility classes prevent conflicts

---

**Ready to convert?** Start with small components and work your way up!
