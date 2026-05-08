# reCAPTCHA Form & Text Visibility Test Guide

## Quick Start

### 1. Access the Application
- **Frontend URL:** http://localhost:5174
- **Backend URL:** http://localhost:8000
- **Note:** Port is 5174 (not 5173) because 5173 was already in use

### 2. Test reCAPTCHA Form Submission

#### Step-by-Step Test:

1. **Navigate to Submit Form**
   - Go to http://localhost:5174/submit
   - Or click "Submit a Concern" from the homepage

2. **Fill in Personal Information**
   ```
   Full Name: Juan Dela Cruz
   Contact Number: 09123456789
   Address: Purok 1, San Vicente, Palawan
   Email: juan@example.com
   ```

3. **Fill in Concern Details**
   ```
   Category: Infrastructure (or any category)
   Description: The road near the barangay hall has a large pothole that needs immediate repair. It's causing traffic issues and is dangerous for motorcycles.
   Location: Corner of Main St. and 2nd Ave.
   Urgency Level: Medium
   ```

4. **Optional: Add Photos**
   - Click the upload area
   - Select 1-3 images (JPEG, PNG, or WebP)
   - Each file must be under 10MB

5. **Complete reCAPTCHA**
   - Check the "I'm not a robot" box
   - Complete any image challenges if prompted
   - Wait for the green checkmark

6. **Submit the Form**
   - Click "Submit Concern" button
   - Button should show "Submitting..." with a spinner
   - Should redirect to success page within 2-5 seconds

7. **Verify Success Page**
   - Should see a large green checkmark
   - Should display a tracking code (format: SV-2024-XXXXX)
   - Should have a "Copy" button next to the tracking code
   - Should have "Track Status" and "Back to Home" buttons

#### Expected Results:
✅ Form submits successfully
✅ No validation errors about category
✅ Success page displays with tracking code
✅ No console errors in browser (F12 → Console)
✅ Network request shows 201 status code (F12 → Network → tickets)

#### Common Issues:
❌ **"Invalid category selected"** - This was the bug we fixed
❌ **"Cannot connect to server"** - Backend is not running
❌ **"Request timeout"** - Backend is slow or unresponsive
❌ **"Please complete the reCAPTCHA"** - Forgot to check the box

---

### 3. Test Text Visibility

#### All Portals to Check:

**Civic Portal (Public)**
- [ ] Landing Page (http://localhost:5174/)
  - All text clearly visible
  - Headings are black
  - Body text is dark gray
  - Buttons have white text on colored backgrounds
  
- [ ] Submit Form (http://localhost:5174/submit)
  - Form labels are black
  - Input text is black
  - Placeholder text is medium gray
  - Error messages are red
  - All text readable on white background

- [ ] Track Page (http://localhost:5174/track)
  - Search input text is black
  - Status badges have good contrast
  - Timeline text is readable
  - All information clearly visible

**Admin Portal**
- [ ] Login (http://localhost:5174/login)
- [ ] Dashboard (http://localhost:5174/admin/dashboard)
- [ ] Tickets (http://localhost:5174/admin/tickets)
- [ ] Users (http://localhost:5174/admin/users)
- [ ] Personnel (http://localhost:5174/admin/personnel)
- [ ] Analytics (http://localhost:5174/admin/analytics)
- [ ] Map (http://localhost:5174/admin/map)

**Personnel Portal**
- [ ] Dashboard (http://localhost:5174/personnel/dashboard)
- [ ] Tasks (http://localhost:5174/personnel/tasks)
- [ ] History (http://localhost:5174/personnel/history)
- [ ] Field Work (http://localhost:5174/personnel/field-work)

**Resident Portal**
- [ ] Dashboard (http://localhost:5174/resident/dashboard)
- [ ] Requests (http://localhost:5174/resident/requests)
- [ ] History (http://localhost:5174/resident/history)

#### Visibility Checklist:
- [ ] All headings are clearly visible (black or dark navy)
- [ ] All body text is readable (black or dark gray)
- [ ] All form inputs have visible text
- [ ] All buttons have sufficient contrast
- [ ] All borders are visible
- [ ] All status badges are readable
- [ ] No light gray text on white backgrounds
- [ ] No invisible or barely visible elements

---

### 4. Test Responsive Design

#### Desktop (1920x1080)
- [ ] All text clearly visible
- [ ] Layout looks professional
- [ ] No overlapping elements

#### Tablet (768x1024)
- [ ] Text remains readable
- [ ] Layout adapts properly
- [ ] Navigation works correctly

#### Mobile (375x667)
- [ ] Text is large enough to read
- [ ] Buttons are easy to tap
- [ ] Form inputs are accessible
- [ ] No horizontal scrolling

---

### 5. Test Accessibility

#### Keyboard Navigation
- [ ] Can tab through all form fields
- [ ] Can submit form with Enter key
- [ ] Focus indicators are visible
- [ ] No keyboard traps

#### Screen Reader
- [ ] Form labels are announced
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] All interactive elements are accessible

#### Color Contrast
- [ ] All text meets WCAG AA standards (4.5:1 for normal text)
- [ ] All interactive elements meet WCAG AA standards
- [ ] No reliance on color alone for information

---

## Troubleshooting

### Form Submission Issues

**Problem:** Form shows "Invalid category selected"
**Solution:** This was the bug we fixed. Clear browser cache and reload.

**Problem:** Form shows "Cannot connect to server"
**Solution:** 
1. Check if backend is running: http://localhost:8000
2. Check if frontend is running: http://localhost:5174
3. Check browser console for CORS errors

**Problem:** Form shows "reCAPTCHA verification failed"
**Solution:**
1. Check if reCAPTCHA keys are correct in .env files
2. Check if internet connection is working
3. Try refreshing the page and completing reCAPTCHA again

**Problem:** Form hangs on "Submitting..."
**Solution:**
1. Check browser console for errors
2. Check network tab for failed requests
3. Check Laravel logs: `LARAVEL-BACK-END/storage/logs/laravel.log`
4. Increase timeout in axios config if needed

### Text Visibility Issues

**Problem:** Text is too light to read
**Solution:** 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload (Ctrl+Shift+R)
3. Check if CSS files were updated correctly
4. Verify CSS variables in browser DevTools

**Problem:** Dark mode is still showing
**Solution:**
1. We removed dark mode support
2. Clear browser cache completely
3. Check if browser is forcing dark mode (disable in browser settings)

---

## Browser Testing

Test in multiple browsers to ensure compatibility:

- [ ] **Chrome** (latest version)
- [ ] **Firefox** (latest version)
- [ ] **Safari** (latest version)
- [ ] **Edge** (latest version)
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

---

## Performance Testing

### Form Submission Speed
- **Expected:** 1-3 seconds for successful submission
- **Acceptable:** Up to 5 seconds with photos
- **Slow:** More than 5 seconds (investigate backend)

### Page Load Speed
- **Expected:** Under 2 seconds for initial load
- **Acceptable:** 2-4 seconds
- **Slow:** More than 4 seconds (check network tab)

---

## Security Testing

### reCAPTCHA
- [ ] Cannot submit without completing reCAPTCHA
- [ ] reCAPTCHA token expires after 2 minutes
- [ ] Cannot reuse old reCAPTCHA tokens

### Input Validation
- [ ] Cannot submit with empty required fields
- [ ] Cannot submit with invalid email format
- [ ] Cannot submit with invalid phone format
- [ ] Cannot upload files larger than 10MB
- [ ] Cannot upload non-image files
- [ ] Cannot upload more than 3 photos

### Rate Limiting
- [ ] Cannot submit more than 15 forms per minute
- [ ] Rate limit error message is clear

---

## Success Criteria

### reCAPTCHA Form
✅ Form submits successfully with valid data
✅ Success page displays with tracking code
✅ Tracking code can be copied to clipboard
✅ No validation errors with correct category format
✅ Photos upload successfully (if provided)
✅ Email confirmation sent (if configured)

### Text Visibility
✅ All text is clearly readable on all pages
✅ No light gray text on white backgrounds
✅ All borders are visible
✅ All buttons have sufficient contrast
✅ All status badges are readable
✅ No dark mode artifacts

### Overall System
✅ No console errors
✅ No network errors
✅ Fast page loads
✅ Responsive on all devices
✅ Accessible with keyboard
✅ Works in all major browsers

---

## Reporting Issues

If you find any issues during testing:

1. **Take a screenshot** of the issue
2. **Copy the error message** from browser console (F12 → Console)
3. **Note the steps to reproduce** the issue
4. **Check the browser and OS** you're using
5. **Check the network tab** for failed requests (F12 → Network)

Include all this information when reporting the issue.

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Fix any issues found
3. ✅ Re-test after fixes
4. ✅ Get user acceptance
5. ✅ Deploy to production
6. ✅ Monitor production logs
7. ✅ Collect user feedback

---

## Contact

For questions or issues:
- Check documentation in `docs/` folder
- Review Laravel logs in `LARAVEL-BACK-END/storage/logs/`
- Check browser console for frontend errors
- Review network tab for API errors
