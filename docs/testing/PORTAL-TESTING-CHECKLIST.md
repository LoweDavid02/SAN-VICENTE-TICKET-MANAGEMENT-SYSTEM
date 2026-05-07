# Portal Testing Checklist

## Quick Verification Guide

Use this checklist to verify all three portals are working correctly after the CSS fix.

---

## 🟢 Guest Submission Portal

### Landing Page (`/` or `/home`)
- [ ] Hero section displays with building background
- [ ] White text is visible on dark background
- [ ] "Submit a Request" button is green (#22a83a)
- [ ] "Staff Login" button has outline style
- [ ] Navigation bar is white with proper styling
- [ ] Stats grid displays correctly (4 columns)
- [ ] About section cards display with colored backgrounds
- [ ] Features section displays in grid layout
- [ ] Contact section displays correctly
- [ ] Footer displays with dark background
- [ ] Mobile hamburger menu works (on mobile)
- [ ] Scroll to top button appears when scrolling

### Report Concern Page (`/report`)
- [ ] Page background is light gray (#F3F4F6)
- [ ] Form card has white background with shadow
- [ ] "Back to Home" button displays correctly
- [ ] Personal Information section displays
- [ ] All input fields are visible and styled
- [ ] Input fields have proper borders (#E5E7EB)
- [ ] Input focus shows navy border (#1E2D4E)
- [ ] Required field asterisks are red
- [ ] Category dropdown is styled correctly
- [ ] Description textarea is visible and styled
- [ ] Character counter displays (0 / 1000)
- [ ] "Locate Me" button is teal (#0D9488)
- [ ] Urgency level buttons display (Low/Medium/High)
- [ ] Selected urgency button has colored border
- [ ] Photo upload zone displays with dashed border
- [ ] Photo previews display correctly
- [ ] Remove photo button (X) works
- [ ] "Submit Concern" button is navy (#1E2D4E)
- [ ] Error messages display in red
- [ ] Form validation works correctly

### Report Success Page (`/report/success`)
- [ ] Success icon displays (green checkmark)
- [ ] Reference code displays in large monospace font
- [ ] Copy to clipboard button works
- [ ] Info box displays with teal border
- [ ] "Track Status" button is navy
- [ ] "Back to Home" button has outline style
- [ ] Building banner displays at bottom

### Track Concern Page (`/track` or `/track/:code`)
- [ ] Page background is light gray
- [ ] Search card displays with white background
- [ ] Reference code input is styled correctly
- [ ] "Track Status" button is navy
- [ ] Ticket card displays with proper styling
- [ ] Status badge shows correct color:
  - Pending: Gray (#6B7280)
  - Under Review: Amber (#F59E0B)
  - In Progress: Blue (#3B82F6)
  - Completed: Green (#10B981)
  - Verified: Teal (#0D9488)
  - Rejected: Red (#EF4444)
- [ ] Status dot matches badge color
- [ ] Progress bar displays correctly
- [ ] Latest update box displays with teal background
- [ ] Timeline displays when expanded
- [ ] Photo gallery displays correctly
- [ ] Location card displays with teal icon
- [ ] Submitted date card displays
- [ ] Assigned to card displays (if assigned)
- [ ] Confirmation buttons display (if completed)
- [ ] "Need Help" section displays

---

## 🟣 Admin Portal

### Login Page (`/login`)
- [ ] Dark background displays
- [ ] Login card has dark surface color
- [ ] Input fields are visible with dark styling
- [ ] "Sign In" button is purple (#7B6CF6)
- [ ] Portal selector displays correctly

### Dashboard (`/admin/dashboard`)
- [ ] Dark theme is applied
- [ ] Sidebar displays on left
- [ ] Sidebar items are visible
- [ ] Active nav item has purple background
- [ ] Topbar displays at top
- [ ] Stat cards display with dark background
- [ ] Charts display correctly
- [ ] Data tables are visible and styled
- [ ] Badge colors are correct
- [ ] Hover states work on cards

### Requests Page (`/admin/requests`)
- [ ] Dark theme is applied
- [ ] Request cards display correctly
- [ ] Status badges show correct colors
- [ ] Filter buttons work
- [ ] Search input is styled correctly
- [ ] Modal displays correctly when opening request

### Personnel Page (`/admin/personnel`)
- [ ] Dark theme is applied
- [ ] Personnel cards display correctly
- [ ] Avatar displays correctly
- [ ] Status indicators work
- [ ] Add personnel button is styled

### Analytics Page (`/admin/analytics`)
- [ ] Dark theme is applied
- [ ] Charts display correctly
- [ ] Stat cards display correctly
- [ ] Date range picker works
- [ ] Export button is styled

---

## 🟠 Personnel Portal

### Login Page (`/login`)
- [ ] Same as admin login
- [ ] Portal selector shows "Personnel" option

### Dashboard (`/personnel/dashboard`)
- [ ] Dark theme is applied
- [ ] Sidebar displays correctly
- [ ] Task cards display correctly
- [ ] Status badges are visible
- [ ] Quick stats display correctly

### Tasks Page (`/personnel/tasks`)
- [ ] Dark theme is applied
- [ ] Task list displays correctly
- [ ] Task cards are styled properly
- [ ] Status update buttons work
- [ ] Task details modal displays correctly

### History Page (`/personnel/history`)
- [ ] Dark theme is applied
- [ ] History timeline displays correctly
- [ ] Completed tasks show correctly
- [ ] Date filters work

---

## 🔧 Cross-Portal Tests

### CSS Isolation
- [ ] Guest portal styles don't affect admin portal
- [ ] Admin portal styles don't affect guest portal
- [ ] Personnel portal styles don't affect guest portal

### Navigation
- [ ] Can navigate from guest to admin (via login)
- [ ] Can navigate from admin to guest (via logout)
- [ ] Can switch between admin and personnel portals

### Responsive Design
- [ ] All portals work on desktop (≥1024px)
- [ ] All portals work on tablet (768px-1023px)
- [ ] All portals work on mobile (≤767px)
- [ ] Hamburger menu works on mobile (all portals)

### Build & Performance
- [ ] `npm run build` succeeds without errors
- [ ] No console errors in browser
- [ ] No missing CSS classes warnings
- [ ] Page load time is acceptable
- [ ] CSS file size is reasonable (~68KB, ~14KB gzipped)

---

## 🐛 Known Issues to Watch For

### If Guest Portal Breaks:
- Check if `.civic-card` class is defined in `index.css`
- Check if `.btn-primary` class is defined
- Check if `--color-primary` variable is defined
- Verify `index.css` is imported in `main.jsx`

### If Admin Portal Breaks:
- Check if `.card` class is defined in `index.css`
- Check if `.btn-brand` class is defined
- Check if `--accent` variable is defined
- Verify dark theme variables are defined

### If Both Break:
- Check if `index.css` import is correct in `main.jsx`
- Check if build completed successfully
- Clear browser cache and hard reload
- Check browser console for errors

---

## ✅ Success Criteria

All checkboxes above should be checked for a successful fix. If any fail:

1. Check browser console for errors
2. Verify CSS classes are defined in `index.css`
3. Check if correct CSS file is imported in `main.jsx`
4. Run `npm run build` to verify build succeeds
5. Clear browser cache and test again

---

## 📝 Testing Notes

**Date Tested:** _________________

**Tested By:** _________________

**Browser:** _________________

**Screen Size:** _________________

**Issues Found:**
- 
- 
- 

**Additional Comments:**


