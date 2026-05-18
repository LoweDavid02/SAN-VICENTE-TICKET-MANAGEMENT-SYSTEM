# Testing Instructions - reCAPTCHA Form Submission Fix

## Issue Fixed
✅ **Form submission failing after completing reCAPTCHA**  
✅ **SSL certificate verification error resolved**

## What Was Fixed
The backend was unable to verify reCAPTCHA tokens with Google's API due to SSL certificate issues on Windows. This has been fixed by implementing environment-aware SSL verification that:
- Bypasses SSL verification in local/development environments
- Maintains full SSL verification in production
- Works automatically without additional configuration

## How to Test

### Prerequisites
- Both servers should be running:
  - Frontend: http://localhost:5173
  - Backend: http://localhost:8000

### Step-by-Step Testing

#### 1. Navigate to Submit Form
Open your browser and go to: **http://localhost:5173/submit**

#### 2. Fill Out the Form
Complete all required fields:

**Personal Information:**
- Full Name: `Juan Dela Cruz` (min 3 characters)
- Contact Number: `09123456789` (PH format)
- Address: `Purok 1, San Vicente` (min 5 characters)
- Email: `juan@example.com` (valid email)

**Concern Details:**
- Category: Select any (e.g., "Infrastructure")
- Description: Enter at least 20 characters (e.g., "There is a large pothole on Main Street that needs repair. It's causing traffic issues and is dangerous for motorcycles.")
- Location: Enter location or click "Locate Me"
- Urgency Level: Select any (Low/Medium/High)

**Media Evidence (Optional):**
- Upload up to 3 photos if desired

#### 3. Complete reCAPTCHA
- ✅ Check the "I'm not a robot" checkbox
- Wait for the checkmark to appear
- The Submit button should become enabled

#### 4. Submit the Form
- Click the **"Submit Concern"** button
- Watch for the loading state ("Submitting...")

#### 5. Verify Success
You should see:
- ✅ Redirect to success page (`/report/success`)
- ✅ Large green checkmark icon
- ✅ "Concern Submitted Successfully!" message
- ✅ Reference code displayed (format: `SV-2024-XXXXX`)
- ✅ Copy button next to reference code
- ✅ "Track Status" and "Back to Home" buttons

#### 6. Verify Backend Logs
Check the Laravel logs for successful submission:
```powershell
Get-Content LARAVEL-BACK-END/storage/logs/laravel.log -Tail 20
```

You should see:
- ✅ "Guest ticket submitted" log entry
- ✅ No SSL certificate errors
- ✅ No "cURL error 60" messages

### Expected Results

#### ✅ Success Indicators
- Form submits without errors
- Success page displays with reference code
- Reference code format: `SV-YYYY-XXXXX`
- No error messages in browser console
- No SSL errors in Laravel logs

#### ❌ If Still Failing
If you still see errors, check:

1. **Backend Running?**
   ```powershell
   curl http://localhost:8000/api/v1/tickets -Method POST -UseBasicParsing
   ```
   Should return 422 (validation error) not 404 or connection error

2. **Environment Variable?**
   Check `LARAVEL-BACK-END/.env`:
   ```env
   APP_ENV=local
   ```

3. **reCAPTCHA Keys?**
   Verify keys match in both `.env` files:
   - Frontend: `VITE_RECAPTCHA_SITE_KEY`
   - Backend: `NOCAPTCHA_SITEKEY` and `NOCAPTCHA_SECRET`

4. **Clear Laravel Cache?**
   ```powershell
   cd LARAVEL-BACK-END
   php artisan config:clear
   php artisan cache:clear
   ```

## Browser Console Testing

### Open Developer Tools
Press `F12` or right-click → "Inspect"

### Check Console Tab
You should see:
```
=== ReportConcern Component Rendered ===
Current pathname: /submit
reCAPTCHA token received: Valid
Submit button clicked - starting validation
Validation passed - submitting form
Sending request to API...
API response: {success: true, tracking_id: "SV-2024-00001", ...}
Navigating to success page with tracking ID: SV-2024-00001
```

### Check Network Tab
1. Filter by "tickets"
2. Find the POST request to `/api/v1/tickets`
3. Check:
   - Status: `201 Created`
   - Response: `{success: true, tracking_id: "SV-2024-XXXXX", ...}`

## Testing Different Scenarios

### Test 1: Valid Submission
- Fill all fields correctly
- Complete reCAPTCHA
- Submit
- **Expected**: Success page with reference code

### Test 2: Missing reCAPTCHA
- Fill all fields correctly
- Do NOT complete reCAPTCHA
- Try to submit
- **Expected**: Button disabled, message "Complete reCAPTCHA to Submit"

### Test 3: Invalid Email
- Enter invalid email (e.g., "notanemail")
- Complete reCAPTCHA
- Submit
- **Expected**: Validation error "Invalid email address"

### Test 4: Short Description
- Enter description less than 20 characters
- Complete reCAPTCHA
- Submit
- **Expected**: Validation error "Description must be at least 20 characters"

### Test 5: Photo Upload
- Upload 1-3 photos (JPEG/PNG/WebP, max 10MB each)
- Complete form and reCAPTCHA
- Submit
- **Expected**: Success with photos included

## Tracking the Submitted Concern

After successful submission:

1. Copy the reference code (e.g., `SV-2024-00001`)
2. Click "Track Status" or navigate to: http://localhost:5173/track
3. Enter the reference code
4. Click "Track Concern"
5. **Expected**: See concern details, status, and timeline

## Common Issues and Solutions

### Issue: "Cannot connect to server"
**Solution**: Ensure Laravel backend is running
```powershell
cd LARAVEL-BACK-END
php artisan serve
```

### Issue: "reCAPTCHA expired"
**Solution**: Complete the reCAPTCHA again (tokens expire after 2 minutes)

### Issue: "Invalid or expired reCAPTCHA"
**Solution**: 
1. Check reCAPTCHA keys in `.env` files
2. Ensure keys match between frontend and backend
3. Verify internet connection (reCAPTCHA requires online verification)

### Issue: Still seeing SSL errors
**Solution**:
1. Verify `APP_ENV=local` in `LARAVEL-BACK-END/.env`
2. Clear Laravel config cache:
   ```powershell
   cd LARAVEL-BACK-END
   php artisan config:clear
   ```
3. Restart Laravel server

## Success Criteria

✅ All of the following should work:
- [ ] Form loads without errors
- [ ] All fields accept input
- [ ] reCAPTCHA widget displays and works
- [ ] Validation errors show for invalid input
- [ ] Submit button enables after reCAPTCHA completion
- [ ] Form submits successfully
- [ ] Success page displays with reference code
- [ ] Reference code can be copied
- [ ] Track Status button works
- [ ] No errors in browser console
- [ ] No SSL errors in Laravel logs

## Need Help?

If you encounter any issues:

1. Check browser console for JavaScript errors
2. Check Laravel logs: `LARAVEL-BACK-END/storage/logs/laravel.log`
3. Verify both servers are running
4. Clear browser cache and try again
5. Review the fix documentation: `docs/implementation/RECAPTCHA-SSL-FIX-COMPLETE.md`

---

**Fix Applied**: 2024-01-XX  
**Status**: ✅ Ready for Testing  
**Expected Result**: Form submission works correctly after completing reCAPTCHA
