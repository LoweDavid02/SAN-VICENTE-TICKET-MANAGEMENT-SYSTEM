# reCAPTCHA Form Submission Fix

## Issue Description
After checking the reCAPTCHA checkbox in the "Submit Concern" form, clicking the submit button didn't work properly.

## Root Cause
The issue was with how FormData was being sent to the backend. When sending multipart/form-data with axios, we were manually setting the `Content-Type` header to `'multipart/form-data'`, which prevented the browser from adding the required `boundary` parameter.

## Fix Applied

### 1. Updated ReportConcern.jsx
**File:** `REACT-FRONT-END/src/pages/ReportConcern.jsx`

**Change:** Removed the manual Content-Type header when posting FormData
```javascript
// BEFORE:
const response = await api.post(
  '/tickets',
  formDataToSend,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
);

// AFTER:
// Note: Don't set Content-Type for FormData - axios will set it with the correct boundary
const response = await api.post('/tickets', formDataToSend);
```

### 2. Updated axios.js
**File:** `REACT-FRONT-END/src/lib/axios.js`

**Change:** Added FormData detection in the request interceptor to ensure Content-Type is not set
```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If sending FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Why This Fix Works

When sending FormData with file uploads, the browser needs to set the Content-Type header as:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

The `boundary` parameter is crucial for the server to parse the multipart data correctly. When we manually set `Content-Type: multipart/form-data` without the boundary, the server cannot parse the request properly.

By letting axios (and the browser) handle the Content-Type header automatically, the correct boundary is included.

## Testing Instructions

### 1. Start the Backend
```bash
cd LARAVEL-BACK-END
php artisan serve
```
Backend should be running on http://127.0.0.1:8000

### 2. Start the Frontend
```bash
cd REACT-FRONT-END
npm run dev
```
Frontend should be running on http://localhost:5173 or http://localhost:5174

### 3. Test the Form Submission

1. Navigate to http://localhost:5174/submit (or the port shown in your terminal)

2. Fill out the form with test data:
   - **Full Name:** Juan Dela Cruz
   - **Contact Number:** 09123456789
   - **Address:** Purok 1, San Vicente
   - **Email:** juan@example.com
   - **Category:** Select any category (e.g., Infrastructure)
   - **Description:** Enter at least 20 characters describing the concern
   - **Location:** Enter a specific location or click "Locate Me"
   - **Urgency Level:** Select Low, Medium, or High
   - **Photos (Optional):** Upload 1-3 images if desired

3. **Check the reCAPTCHA checkbox** - The submit button should become enabled

4. **Click "Submit Concern"** - The form should:
   - Show a loading spinner
   - Submit successfully
   - Redirect to the success page with a reference code

5. **Verify Success:**
   - You should see a success page with a reference code (format: SV-YYYY-XXXXX)
   - The reference code should be displayed prominently
   - You should be able to copy the reference code
   - You should be able to track the concern using the reference code

### 4. Check Browser Console

Open the browser's Developer Tools (F12) and check the Console tab:
- You should see logs like:
  - "reCAPTCHA token received: Valid"
  - "Submit button clicked - starting validation"
  - "Validation passed - submitting form"
  - "Sending request to API..."
  - "API response: {success: true, ...}"

### 5. Check Backend Logs

In the Laravel terminal, you should see:
```
[timestamp] local.INFO: Guest ticket submitted {"tracking_id":"SV-2024-00001","category":"infrastructure","severity":"Medium","photos_count":0}
```

### 6. Verify Database

Check the PostgreSQL database to confirm the ticket was created:
```sql
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 1;
```

## Additional Notes

### reCAPTCHA Configuration
- **Site Key:** 6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL
- **Secret Key:** 6Lfpzt8sAAAAALiJPQuYI7S_814y5bq9j00W9alj
- **Environment:** Test keys (work on localhost)

### Rate Limiting
The form submission endpoint has rate limiting:
- **Limit:** 5 requests per minute per IP address
- **Purpose:** Prevent storage exhaustion from excessive uploads

If you hit the rate limit, you'll see:
```json
{
  "success": false,
  "message": "Too many upload attempts. Please try again in a minute."
}
```

### File Upload Limits
- **Maximum files:** 3 photos
- **Maximum file size:** 10MB per photo
- **Allowed formats:** JPEG, PNG, WebP

## Troubleshooting

### Issue: Button still disabled after checking reCAPTCHA
**Solution:** Check the browser console for reCAPTCHA errors. Ensure the site key is correct in `.env`:
```
VITE_RECAPTCHA_SITE_KEY=6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL
```

### Issue: Form submits but returns 422 error
**Solution:** Check the validation errors in the response. Common issues:
- Phone number format (must be 09XXXXXXXXX)
- Description too short (minimum 20 characters)
- Invalid category value

### Issue: Network error or timeout
**Solution:** 
1. Verify the backend is running on port 8000
2. Check the Vite proxy configuration in `vite.config.js`
3. Ensure PostgreSQL database is running and accessible

### Issue: reCAPTCHA not loading
**Solution:**
1. Check internet connection (reCAPTCHA loads from Google's servers)
2. Verify the site key is correct
3. Check browser console for CORS or loading errors

## Files Modified

1. `REACT-FRONT-END/src/pages/ReportConcern.jsx` - Removed manual Content-Type header
2. `REACT-FRONT-END/src/lib/axios.js` - Added FormData detection in interceptor

## Related Documentation

- [Task 10: Google reCAPTCHA v2 Implementation](docs/implementation/)
- [Task 11: SSL Certificate Fix for Windows](docs/implementation/)
- [reCAPTCHA Testing Guide](docs/testing/RECAPTCHA-TESTING-GUIDE.md)

## Status

✅ **FIXED** - Form submission now works correctly after checking reCAPTCHA checkbox

The fix has been applied and tested. Users can now successfully submit concerns through the form after completing the reCAPTCHA verification.
