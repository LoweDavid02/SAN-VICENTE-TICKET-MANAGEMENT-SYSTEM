# Design System Quick Start Guide

**Project:** Barangay San Vicente Ticket Management System  
**Date:** May 8, 2026  
**Version:** 1.0

---

## Overview

This guide helps developers quickly start using the new Barangay San Vicente Design System. All components are built with Tailwind CSS, follow WCAG AA accessibility standards, and use a consistent variant system.

---

## Installation

The design system is already installed and configured. No additional setup required!

**Dependencies:**
- ✅ `clsx` - Conditional className utility
- ✅ `tailwind-merge` - Tailwind class merging
- ✅ `class-variance-authority` - Variant management
- ✅ `@tailwindcss/forms` - Form styling
- ✅ `@tailwindcss/typography` - Typography utilities

---

## Quick Start

### 1. Import Components

```jsx
// Import individual components
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui';

// Or import multiple at once
import { Button, Input, Card, Badge, Alert } from '@/components/ui';
```

### 2. Use Components

```jsx
function MyComponent() {
  return (
    <div>
      <Button variant="primary" size="md">
        Click Me
      </Button>
      
      <Input type="text" placeholder="Enter name" />
      
      <Card variant="elevated">
        <p>Card content</p>
      </Card>
    </div>
  );
}
```

### 3. Customize with className

```jsx
<Button variant="primary" className="mt-4 w-full">
  Custom Button
</Button>
```

---

## Available Components

### Button

**Variants:** primary, secondary, outline, ghost, danger, success, warning, link  
**Sizes:** xs, sm, md, lg, xl

```jsx
// Basic usage
<Button variant="primary" size="md">Submit</Button>

// With loading state
<Button variant="primary" loading>Processing...</Button>

// With icons
<Button variant="outline" leftIcon={<Icon />}>Edit</Button>

// Full width
<Button variant="primary" fullWidth>Sign In</Button>

// Disabled
<Button variant="primary" disabled>Disabled</Button>
```

---

### Input

**Variants:** default, error, success  
**Sizes:** sm, md, lg

```jsx
// Basic usage
<Input type="text" placeholder="Enter name" />

// With error state
<Input type="email" error placeholder="Email" />

// Different sizes
<Input type="text" size="lg" placeholder="Large input" />

// Disabled
<Input type="text" disabled placeholder="Disabled" />
```

---

### Card

**Variants:** default, elevated, outlined, interactive  
**Padding:** none, sm, md, lg

```jsx
// Basic card
<Card variant="elevated">
  <p>Simple card content</p>
</Card>

// Card with composition
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>

// Interactive card (clickable)
<Card variant="interactive" onClick={() => {}}>
  <p>Click me!</p>
</Card>
```

---

### Badge

**Variants:** default, primary, secondary, success, warning, error, info, outline  
**Sizes:** sm, md, lg

```jsx
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Rejected</Badge>

// Different sizes
<Badge variant="primary" size="sm">Small</Badge>
<Badge variant="primary" size="lg">Large</Badge>
```

---

### Alert

**Variants:** default, info, success, warning, error

```jsx
// Basic alert
<Alert variant="success">
  Your changes have been saved successfully.
</Alert>

// Alert with title
<Alert variant="error" title="Error Occurred">
  Please check your input and try again.
</Alert>

// Dismissible alert
<Alert 
  variant="warning" 
  dismissible 
  onDismiss={() => console.log('Dismissed')}
>
  This is a warning message.
</Alert>
```

---

### Spinner

**Variants:** default, primary, white  
**Sizes:** xs, sm, md, lg, xl

```jsx
// Basic spinner
<Spinner size="md" variant="primary" />

// In a button
<Button variant="primary" disabled>
  <Spinner size="sm" variant="white" />
  Loading...
</Button>

// Centered loading state
<div className="flex items-center justify-center h-screen">
  <Spinner size="xl" variant="primary" />
</div>
```

---

## Using Theme Tokens

### Colors

Use Tailwind classes with theme colors:

```jsx
// Background colors
<div className="bg-primary-600">Primary background</div>
<div className="bg-success-500">Success background</div>
<div className="bg-error-600">Error background</div>

// Text colors
<p className="text-primary-700">Primary text</p>
<p className="text-gray-600">Gray text</p>

// Border colors
<div className="border border-primary-500">Primary border</div>
```

### Spacing

Use the spacing scale (4px base unit):

```jsx
// Padding
<div className="p-4">Padding 16px</div>
<div className="px-6 py-4">Padding X: 24px, Y: 16px</div>

// Margin
<div className="mt-8">Margin top 32px</div>
<div className="mb-6">Margin bottom 24px</div>

// Gap
<div className="flex gap-4">Gap 16px</div>
```

### Typography

Use the typography scale:

```jsx
// Font sizes
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<p className="text-base">Body text</p>
<span className="text-sm">Small text</span>

// Font weights
<p className="font-normal">Normal weight</p>
<p className="font-medium">Medium weight</p>
<p className="font-semibold">Semibold weight</p>
<p className="font-bold">Bold weight</p>
```

### Shadows

Use the shadow system:

```jsx
// Card shadows
<div className="shadow-card">Card shadow</div>
<div className="shadow-card-hover">Card hover shadow</div>

// Button shadows
<button className="shadow-button hover:shadow-button-hover">
  Button with shadow
</button>

// Standard shadows
<div className="shadow-sm">Small shadow</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>
```

---

## Common Patterns

### Form with Validation

```jsx
import { Input, Button, Alert } from '@/components/ui';
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // API call here
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={!!error}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={!!error}
          required
        />
      </div>
      
      <Button variant="primary" fullWidth loading={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

---

### Dashboard Card

```jsx
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

function StatsCard({ title, value, status, trend }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant={status === 'up' ? 'success' : 'error'}>
            {trend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}
```

---

### Loading State

```jsx
import { Spinner } from '@/components/ui';

function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="xl" variant="primary" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

---

### Action Buttons

```jsx
import { Button } from '@/components/ui';
import { Save, X, Trash2 } from 'lucide-react';

function ActionButtons({ onSave, onCancel, onDelete }) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="primary" 
        leftIcon={<Save className="h-4 w-4" />}
        onClick={onSave}
      >
        Save
      </Button>
      
      <Button 
        variant="outline" 
        leftIcon={<X className="h-4 w-4" />}
        onClick={onCancel}
      >
        Cancel
      </Button>
      
      <Button 
        variant="danger" 
        leftIcon={<Trash2 className="h-4 w-4" />}
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
}
```

---

## Best Practices

### 1. Use Semantic Variants

```jsx
// ✅ Good - semantic variant
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// ❌ Bad - custom styling
<Button className="bg-red-600 text-white">Delete</Button>
```

### 2. Use Theme Colors

```jsx
// ✅ Good - theme colors
<div className="bg-primary-600 text-white">Primary</div>

// ❌ Bad - hardcoded colors
<div className="bg-[#0058be] text-white">Primary</div>
```

### 3. Use Spacing Scale

```jsx
// ✅ Good - spacing scale
<div className="p-4 mt-6 mb-8">Content</div>

// ❌ Bad - arbitrary values
<div className="p-[17px] mt-[23px]">Content</div>
```

### 4. Extend with className

```jsx
// ✅ Good - extend with className
<Button variant="primary" className="mt-4 w-full">Submit</Button>

// ❌ Bad - override variant styles
<Button variant="primary" className="bg-red-600">Submit</Button>
```

### 5. Use Composition

```jsx
// ✅ Good - composition pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Bad - custom structure
<div className="rounded-lg border p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

---

## Accessibility Guidelines

### 1. Always Add Labels

```jsx
// ✅ Good
<label htmlFor="email" className="block text-sm font-medium mb-2">
  Email
</label>
<Input id="email" type="email" />

// ❌ Bad
<Input type="email" placeholder="Email" />
```

### 2. Use Semantic HTML

```jsx
// ✅ Good
<button type="submit">Submit</button>

// ❌ Bad
<div onClick={handleSubmit}>Submit</div>
```

### 3. Provide Alt Text

```jsx
// ✅ Good
<img src="logo.png" alt="Company Logo" />

// ❌ Bad
<img src="logo.png" />
```

### 4. Use ARIA When Needed

```jsx
// ✅ Good
<Button aria-label="Close dialog" onClick={onClose}>
  <X className="h-4 w-4" />
</Button>

// ❌ Bad
<Button onClick={onClose}>
  <X className="h-4 w-4" />
</Button>
```

---

## Troubleshooting

### Import Errors

**Problem:** `Cannot find module '@/components/ui'`

**Solution:** Make sure path aliases are configured in `vite.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

---

### Styling Not Applied

**Problem:** Component styles not showing

**Solution:** 
1. Check Tailwind content paths in `tailwind.config.js`
2. Restart dev server
3. Clear build cache: `rm -rf dist node_modules/.vite`

---

### TypeScript Errors

**Problem:** Type errors with component props

**Solution:** Components are JavaScript. For TypeScript, add type definitions or use JSDoc comments.

---

## Resources

### Documentation
- [Phase 1 Complete](../implementation/PHASE-1-FOUNDATION-COMPLETE.md)
- [Phase 2 Complete](../implementation/PHASE-2-CORE-COMPONENTS-COMPLETE.md)
- [Progress Report](../status/FRONTEND-REFACTOR-PROGRESS.md)

### External Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Class Variance Authority](https://cva.style/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Support

### Questions?
- Check the documentation in `docs/`
- Review component source code in `src/components/ui/`
- Ask in team chat

### Found a Bug?
- Check existing issues
- Create detailed bug report
- Include code example

### Feature Request?
- Discuss with team first
- Create feature proposal
- Follow contribution guidelines

---

**Happy Coding! 🚀**

---

**Last Updated:** May 8, 2026  
**Version:** 1.0  
**Maintainer:** Development Team

