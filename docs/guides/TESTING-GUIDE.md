# Testing Guide - Success Page Navigation Fix

## Prerequisites

### 1. Backend Server Running
```bash
cd LARAVEL-BACK-END
php artisan serve
```
**Expected Output:**
```
Starting Laravel development server: http://127.0.0.1:8000
```

### 2. Frontend Development Server Running
```bash
cd REACT-FRONT-END
npm run dev
```
**Expected Output:**
```
VITE v8.0.10  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Database Ready
```bash
cd LARAVEL-BACK-END
php artisan migrate:fresh --seed
```

---

## Test Scenario 1: Happy Path - Full Form Submission

### Steps
1. Open browser to `http://localhost:5173/report`
2. Fill out the form with valid data:

   **Personal Information:**
   - Full Name: `Juan Dela Cruz`
   - Contact Number: `09123456789`
   - Address: `123 Main Street, San Vicente`
   - Email: `juan@example.com`

   **Concern Details:**
   - Category: `Infrastructure`
   - Description: `There is a large pothole on Main Street that needs immediate repair. It's causing damage to vehicles and is a safety hazard.`
   - Location: `Corner of Main St. and 2nd Ave.`
   - Urgency: `High`

   **Media Evidence (Optional):**
   - Upload 1-3 photos (JPEG/PNG/WebP, max 10MB each)

3. Click **"Submit Concern"** button

### Expected Results
✅ **Immediate Success Page Render:**
- URL changes to `http://localhost:5173/report/success`
- Success page displays with:
  - ✅ Green checkmark icon
  - ✅ "Concern Submitted Successfully!" heading
  - ✅ Reference code in format `SV-2026-XXXXX`
  - ✅ Copy button next to reference code
  - ✅ 4 instruction cards (Save, Track, Email, Confirm)
  - ✅ "Track Status" button (blue)
  - ✅ "Back to Home" button (white)
  - ✅ Download Receipt card
  - ✅ Share Updates card
  - ✅ Office banner at bottom

### Browser Console Logs
```
Submit button clicked - starting validation
Validation passed - submitting form
Sending request to API...
API response: { success: true, tracking_id: 'SV-2026-00001', ... }
Navigating to success page with tracking ID: SV-2026-00001
=== ReportConcern Component Rendered ===
Current pathname: /report/success
Is success page: true
Location state: { referenceCode: 'SV-2026-00001' }
Reference code: SV-2026-00001
```

### Network Tab
- **Request:** `POST http://localhost:8000/api/v1/tickets`
- **Status:** `201 Created`
- **Response Body:**
```json
{
  "success": true,
  "message": "Your request has been submitted successfully!",
  "tracking_id": "SV-2026-00001",
  "ticket": {
    "id": 1,
    "tracking_id": "SV-2026-00001",
    "title": "There is a large pothole on Main Street...",
    "category": "infrastructure",
    "status": "Pending",
    "severity": "High",
    "location": "Corner of Main St. and 2nd Ave.",
    "photos": [],
    "created_at": "2026-05-07 09:15:30"
  }
}
```

---

## Test Scenario 2: Copy to Clipboard

### Steps
1. After successful submission (from Scenario 1)
2. Click the **copy icon** button next to the reference code

### Expected Results
✅ Alert appears: "Reference code copied to clipboard!"
✅ Reference code is in clipboard (test by pasting: Ctrl+V)

---

## Test Scenario 3: Track Status Button

### Steps
1. After successful submission (from Scenario 1)
2. Click **"Track Status"** button

### Expected Results
✅ Navigates to `http://localhost:5173/track/SV-2026-00001`
✅ Track page loads with the tracking form pre-filled or tracking results

---

## Test Scenario 4: Back to Home Button

### Steps
1. After successful submission (from Scenario 1)
2. Click **"Back to Home"** button

### Expected Results
✅ Navigates to `http://localhost:5173/`
✅ Landing page loads

---

## Test Scenario 5: Direct Access to Success Page (Edge Case)

### Steps
1. Manually navigate to `http://localhost:5173/report/success` (without submitting form)

### Expected Results
✅ **Error Page Displays:**
- Red error icon
- "No Reference Code Found" heading
- Message: "It looks like you accessed this page directly. Please submit a concern first to get your reference code."
- "Go to Submit Form" button

### Browser Console Logs
```
=== ReportConcern Component Rendered ===
Current pathname: /report/success
Is success page: true
Location state: null
Reference code: null
```

### Click "Go to Submit Form"
✅ Navigates to `http://localhost:5173/submit` (redirects to `/report`)
✅ Form page loads

---

## Test Scenario 6: Form Validation Errors

### Steps
1. Go to `http://localhost:5173/report`
2. Leave all fields empty
3. Click **"Submit Concern"** button

### Expected Results
✅ Form does NOT submit
✅ Error messages appear under each required field:
- "Name must be at least 3 characters"
- "Email is required"
- "Phone number is required"
- "Address must be at least 5 characters"
- "Please select a category"
- "Description must be at least 20 characters"
- "Location must be at least 5 characters"

✅ Page scrolls to first error
✅ Submit button remains enabled (not stuck in loading state)

### Browser Console Logs
```
Submit button clicked - starting validation
Validation failed: { guest_name: "Name must be at least 3 characters", ... }
```

---

## Test Scenario 7: Backend Not Running (Error Handling)

### Steps
1. **Stop the Laravel backend server** (Ctrl+C in backend terminal)
2. Go to `http://localhost:5173/report`
3. Fill out the form with valid data
4. Click **"Submit Concern"** button

### Expected Results
✅ Error message appears:
- Red error box above submit button
- Message: "Cannot connect to server. Please ensure the backend is running."

✅ Submit button returns to normal state (not stuck in loading)

### Browser Console Logs
```
Submit button clicked - starting validation
Validation passed - submitting form
Sending request to API...
Submission error: AxiosError: Network Error
Network or server error: Cannot connect to server. Please ensure the backend is running.
```

---

## Test Scenario 8: Server Error (500)

### Steps
1. Temporarily break the backend (e.g., comment out database connection in `.env`)
2. Go to `http://localhost:5173/report`
3. Fill out the form with valid data
4. Click **"Submit Concern"** button

### Expected Results
✅ Error message appears:
- Red error box above submit button
- Message: "Failed to submit your concern. Error: Request failed with status code 500"

✅ Submit button returns to normal state

### Browser Console Logs
```
Submit button clicked - starting validation
Validation passed - submitting form
Sending request to API...
api/v1/tickets:1 Failed to load resource: the server responded with a status of 500
Submission error: AxiosError: Request failed with status code 500
Network or server error: Request failed with status code 500
```

---

## Test Scenario 9: Photo Upload

### Steps
1. Go to `http://localhost:5173/report`
2. Fill out all required fields
3. Click the upload zone or drag photos
4. Upload 3 valid photos (JPEG/PNG/WebP, under 10MB each)
5. Click **"Submit Concern"** button

### Expected Results
✅ Photos appear as thumbnails with remove (X) buttons
✅ Form submits successfully
✅ Success page displays
✅ Backend stores photos in `storage/app/public/tickets/`

### Test Photo Limits
- Upload 4 photos → ✅ Error: "Maximum 3 photos allowed"
- Upload 11MB photo → ✅ Error: "Each photo must be under 10MB"
- Upload .txt file → ✅ Error: "Only JPEG, PNG, and WebP images allowed"

---

## Test Scenario 10: Geolocation "Locate Me"

### Steps
1. Go to `http://localhost:5173/report`
2. Click **"Locate Me"** button in the Location field

### Expected Results (If Permission Granted)
✅ Button shows "Locating..." with spinning icon
✅ Location field populates with: `Lat: XX.XXXXXX, Lng: XX.XXXXXX`
✅ Button returns to normal state

### Expected Results (If Permission Denied)
✅ Alert appears: "Unable to get your location. Please enter it manually."
✅ Button returns to normal state
✅ User can manually type location

---

## Test Scenario 11: Responsive Design (Mobile)

### Steps
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (e.g., iPhone 12 Pro)
4. Navigate to `http://localhost:5173/report`
5. Fill out and submit form

### Expected Results
✅ Form layout adapts to mobile (single column)
✅ Buttons stack vertically
✅ Text is readable (no overflow)
✅ Success page is mobile-friendly
✅ All interactions work on touch

---

## Test Scenario 12: Multiple Submissions

### Steps
1. Submit first concern → Get tracking code `SV-2026-00001`
2. Click "Back to Home"
3. Submit second concern → Get tracking code `SV-2026-00002`
4. Submit third concern → Get tracking code `SV-2026-00003`

### Expected Results
✅ Each submission gets unique tracking code
✅ Sequence increments correctly
✅ All submissions stored in database
✅ No duplicate tracking codes

---

## Database Verification

### Check Tickets Table
```bash
cd LARAVEL-BACK-END
php artisan tinker
```

```php
// Get all tickets
Ticket::all();

// Get latest ticket
Ticket::latest()->first();

// Check tracking ID format
Ticket::latest()->first()->tracking_id; // Should be "SV-2026-XXXXX"

// Check guest fields
$ticket = Ticket::latest()->first();
echo $ticket->guest_name;
echo $ticket->guest_email;
echo $ticket->guest_phone;
echo $ticket->guest_address;
```

### Check Photos Table
```php
// Get photos for latest ticket
$ticket = Ticket::latest()->first();
$ticket->photos; // Relationship

// Or direct query
TicketPhoto::where('ticket_id', $ticket->id)->get();
```

---

## Performance Benchmarks

### Expected Timings
- Form validation: < 50ms
- API request: 200-500ms (local)
- Page navigation: < 100ms
- Success page render: < 50ms
- **Total submission time: < 1 second**

### Monitor in DevTools
1. Open Performance tab
2. Start recording
3. Submit form
4. Stop recording
5. Check timeline for bottlenecks

---

## Troubleshooting

### Issue: Success page is blank
**Check:**
1. Browser console for errors
2. Network tab for API response
3. `location.state` in console logs
4. Reference code value in logs

**Solution:**
- Ensure backend is running
- Check API returns `tracking_id`
- Verify navigation includes `state: { referenceCode }`

### Issue: Form doesn't submit
**Check:**
1. Validation errors under fields
2. Console logs for validation failures
3. Network tab for blocked requests

**Solution:**
- Fill all required fields correctly
- Check backend is running on port 8000
- Verify CORS settings in Laravel

### Issue: Photos don't upload
**Check:**
1. File size (max 10MB)
2. File type (JPEG/PNG/WebP only)
3. Storage directory permissions

**Solution:**
```bash
cd LARAVEL-BACK-END
php artisan storage:link
chmod -R 775 storage/
```

### Issue: Tracking code not generated
**Check:**
1. Database connection
2. `tracking_id` column exists
3. Backend logs for errors

**Solution:**
```bash
cd LARAVEL-BACK-END
php artisan migrate:fresh --seed
```

---

## Success Criteria Checklist

### Functionality
- [ ] Form submits successfully
- [ ] Success page renders immediately
- [ ] Reference code displays correctly
- [ ] Copy button works
- [ ] Track Status button navigates correctly
- [ ] Back to Home button navigates correctly
- [ ] Direct access shows error page
- [ ] Validation errors display correctly
- [ ] Photo upload works
- [ ] Geolocation works

### Design
- [ ] Glass morphism effects render
- [ ] Colors match Material Design 3
- [ ] Icons are Material Symbols Outlined
- [ ] Responsive on mobile
- [ ] Animations smooth (scale, hover)
- [ ] Typography consistent

### Performance
- [ ] Build completes without errors
- [ ] No console errors
- [ ] Page loads in < 2 seconds
- [ ] Form submits in < 1 second
- [ ] No memory leaks

### Error Handling
- [ ] Backend down shows error
- [ ] Server error shows error
- [ ] Validation errors show
- [ ] Network timeout handled
- [ ] Direct access handled

---

## Final Verification

### Run All Tests
```bash
# 1. Backend tests
cd LARAVEL-BACK-END
php artisan test

# 2. Frontend build
cd REACT-FRONT-END
npm run build

# 3. Frontend lint
npm run lint

# 4. Type check (if using TypeScript)
npm run type-check
```

### Manual Testing Checklist
- [ ] Test Scenario 1: Happy Path ✅
- [ ] Test Scenario 2: Copy to Clipboard ✅
- [ ] Test Scenario 3: Track Status Button ✅
- [ ] Test Scenario 4: Back to Home Button ✅
- [ ] Test Scenario 5: Direct Access ✅
- [ ] Test Scenario 6: Validation Errors ✅
- [ ] Test Scenario 7: Backend Not Running ✅
- [ ] Test Scenario 8: Server Error ✅
- [ ] Test Scenario 9: Photo Upload ✅
- [ ] Test Scenario 10: Geolocation ✅
- [ ] Test Scenario 11: Responsive Design ✅
- [ ] Test Scenario 12: Multiple Submissions ✅

---

## Sign-Off

**Tested By:** _________________  
**Date:** _________________  
**Status:** ☐ PASS  ☐ FAIL  
**Notes:** _________________

---

**Ready for Production:** ☐ YES  ☐ NO  
**Approved By:** _________________  
**Date:** _________________
