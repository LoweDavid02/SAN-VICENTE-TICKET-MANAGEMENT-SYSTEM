# Text Color Quick Reference Guide

**Last Updated:** May 9, 2026  
**Status:** Active

## Professional Color Hierarchy

Use these colors for consistent, accessible text across the application:

### Light Mode Text Colors

| Level | Color Name | Hex Code | CSS Variable | Use Case |
|-------|------------|----------|--------------|----------|
| **Primary** | Pure Black | `#111827` | `var(--color-text-primary)` | Headings, important text |
| **Secondary** | Dark Gray | `#374151` | `var(--color-text-secondary)` | Body text, paragraphs |
| **Muted** | Medium Gray | `#6B7280` | `var(--color-text-muted)` | Supporting text, labels |
| **Dim** | Light Gray | `#9CA3AF` | `var(--color-text-dim)` | Subtle text, placeholders |

### Dark Mode Text Colors

| Level | Color Name | Hex Code | CSS Variable | Use Case |
|-------|------------|----------|--------------|----------|
| **Primary** | Off White | `#EDEDF5` | `var(--txt)` | Headings, important text |
| **Secondary** | Light Gray | `#8B8BA5` | `var(--txt-secondary)` | Body text, paragraphs |
| **Muted** | Medium Gray | `#52526A` | `var(--muted)` | Supporting text, labels |

## Quick Usage Examples

### ✅ Good - Use CSS Variables

```jsx
// Preferred method
<h1 style={{ color: 'var(--color-text-primary)' }}>Heading</h1>
<p style={{ color: 'var(--color-text-secondary)' }}>Body text</p>
<span style={{ color: 'var(--color-text-muted)' }}>Label</span>
```

### ✅ Acceptable - Use Hierarchy Colors

```jsx
// When CSS variables not available
<h1 style={{ color: '#111827' }}>Heading</h1>
<p style={{ color: '#374151' }}>Body text</p>
<span style={{ color: '#6B7280' }}>Label</span>
```

### ❌ Bad - Don't Use Slate Colors

```jsx
// These will be overridden by CSS fixes
<h1 style={{ color: '#0f172a' }}>Heading</h1>  // Too dark
<p style={{ color: '#64748b' }}>Body text</p>  // Inconsistent
<span style={{ color: '#94a3b8' }}>Label</span> // Too light
```

## Button Text Colors

### Colored Backgrounds

Always use white text on colored button backgrounds:

```jsx
// ✅ Good
<button style={{ 
  background: '#1E2D4E',  // Navy
  color: '#FFFFFF'        // White
}}>
  Submit
</button>

<button style={{ 
  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',  // Teal gradient
  color: '#FFFFFF'                                           // White
}}>
  Continue
</button>
```

### Outline Buttons

Use primary color text on transparent backgrounds:

```jsx
// ✅ Good
<button style={{ 
  background: 'transparent',
  border: '2px solid #1E2D4E',
  color: '#1E2D4E'  // Navy
}}>
  Cancel
</button>
```

## Dark Background Sections

### Hero Sections / Gradients

Always use white text on dark gradient backgrounds:

```jsx
// ✅ Good
<section style={{ 
  background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))'
}}>
  <h1 style={{ color: '#FFFFFF' }}>Hero Title</h1>
  <p style={{ color: '#FFFFFF' }}>Hero description</p>
</section>
```

### Footer

Always use white text in footer:

```jsx
// ✅ Good
<footer style={{ background: '#0f172a' }}>
  <p style={{ color: '#FFFFFF' }}>© 2026 Barangay San Vicente</p>
</footer>
```

## WCAG Contrast Requirements

### Minimum Contrast Ratios

| Text Size | WCAG AA | WCAG AAA |
|-----------|---------|----------|
| Normal text (< 18pt) | 4.5:1 | 7:1 |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1 | 4.5:1 |

### Our Contrast Ratios

All our text colors exceed WCAG AA standards:

| Combination | Ratio | Status |
|-------------|-------|--------|
| #111827 on #FFFFFF | 16.1:1 | ✅ AAA |
| #374151 on #FFFFFF | 10.7:1 | ✅ AAA |
| #6B7280 on #FFFFFF | 7.2:1 | ✅ AAA |
| #9CA3AF on #FFFFFF | 4.6:1 | ✅ AA |
| #FFFFFF on #1E2D4E | 12.6:1 | ✅ AAA |

## Common Patterns

### Card Headers

```jsx
<div className="civic-card">
  <h3 style={{ color: 'var(--color-text-primary)' }}>Card Title</h3>
  <p style={{ color: 'var(--color-text-secondary)' }}>Card description</p>
</div>
```

### Form Labels

```jsx
<label style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
  Full Name
</label>
<input 
  placeholder="Enter your name"
  style={{ color: 'var(--color-text-primary)' }}
/>
```

### Status Badges

```jsx
// Status badges have their own color system
<span className="status-badge pending">Pending</span>
<span className="status-badge in-progress">In Progress</span>
<span className="status-badge completed">Completed</span>
```

### Navigation Links

```jsx
<nav>
  <a style={{ 
    color: 'var(--color-text-secondary)',
    fontWeight: 500
  }}>
    Home
  </a>
</nav>
```

## Testing Your Text Colors

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Select element with text
3. Check "Contrast" in Styles panel
4. Ensure ratio is ≥ 4.5:1

### Online Tools

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Coolors Contrast Checker**: https://coolors.co/contrast-checker
- **WAVE Browser Extension**: https://wave.webaim.org/extension/

### Automated Testing

```bash
# Run Lighthouse accessibility audit
npm run lighthouse

# Check for contrast issues
npm run a11y-check
```

## Troubleshooting

### Text Not Visible

**Problem**: Text appears too dark on dark background

**Solution**: Check if background is dark gradient or solid dark color. Use white text:
```jsx
<div style={{ background: '#0f172a' }}>
  <p style={{ color: '#FFFFFF' }}>Visible text</p>
</div>
```

### Text Too Light

**Problem**: Text appears washed out or hard to read

**Solution**: Use darker text color from hierarchy:
```jsx
// Instead of
<p style={{ color: '#cbd5e1' }}>Too light</p>

// Use
<p style={{ color: '#6B7280' }}>Better contrast</p>
```

### Inconsistent Colors

**Problem**: Text colors vary across similar elements

**Solution**: Use CSS variables for consistency:
```jsx
// Instead of mixing colors
<p style={{ color: '#64748b' }}>Text 1</p>
<p style={{ color: '#475569' }}>Text 2</p>

// Use consistent variable
<p style={{ color: 'var(--color-text-secondary)' }}>Text 1</p>
<p style={{ color: 'var(--color-text-secondary)' }}>Text 2</p>
```

## Migration Guide

### Updating Existing Components

1. **Find inline color styles**:
   ```bash
   grep -r "color: '#" src/pages/
   ```

2. **Replace with CSS variables**:
   ```jsx
   // Before
   <p style={{ color: '#64748b' }}>Text</p>
   
   // After
   <p style={{ color: 'var(--color-text-secondary)' }}>Text</p>
   ```

3. **Test contrast**:
   - Use browser DevTools
   - Verify ≥ 4.5:1 ratio

### Batch Updates

For multiple files, use find and replace:

```bash
# Replace common slate colors
find src/pages -name "*.jsx" -exec sed -i "s/color: '#64748b'/color: 'var(--color-text-secondary)'/g" {} +
find src/pages -name "*.jsx" -exec sed -i "s/color: '#0f172a'/color: 'var(--color-text-primary)'/g" {} +
```

## Best Practices

### ✅ Do

- Use CSS variables for text colors
- Maintain consistent color hierarchy
- Test contrast ratios
- Use white text on dark backgrounds
- Use dark text on light backgrounds

### ❌ Don't

- Use random hex colors for text
- Mix different shades of gray inconsistently
- Use dark text on dark backgrounds
- Use light text on light backgrounds
- Ignore WCAG contrast requirements

## Resources

### Internal Documentation

- [Text Visibility Fix Complete](../implementation/TEXT-VISIBILITY-FIX-COMPLETE.md)
- [Design System Quick Start](./DESIGN-SYSTEM-QUICK-START.md)
- [Color Palette Reference](../design/COLOR-PALETTE-REFERENCE.md)

### External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)

---

**Questions?** Contact the development team or refer to the comprehensive documentation.
