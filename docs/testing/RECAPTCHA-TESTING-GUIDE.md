# Google reCAPTCHA v2 Testing Guide

**Date**: May 8, 2026  
**Feature**: Google reCAPTCHA v2 on Guest Submission Form  
**Status**: Ready for Testing

---

## 🚀 Quick Start Testing

### 1. Start Backend Server

```bash
cd LARAVEL-BACK-END
php artisan serve
```

Expected output:
```
INFO  Server running on [http://127.0.0.1:8000].
```

### 2. Start Frontend Server

```bash
cd REACT-FRONT-END
npm run dev
```

Expected output:
```
VITE v8.0.10  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 3. Navigate to Form

Open browser: **http://localhost:5173/submit**

---

## ✅ Test Scenarios

### Scenario 1: Submit Without CAPTCHA
**Steps**:
1. Fill out all form fields
2. Do NOT check the reCAPTCHA box
3. Click "Submit Concern" button

**Expected Result**:
- ❌ Button should be DISABLED (gray color)
- ❌ Button text: "Complete reCAPTCHA to Submit"
- ❌ Lock icon displayed
- ❌ Cannot submit form

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Scenario 2: Complete CAPTCHA and Submit
**Steps**:
1. Fill out all form fields correctly:
   - Full Name: "Juan Dela Cruz"
   - Contact Number: "09123456789"
   - Address: "Purok 1, San Vicente"
   - Email: "juan@example.com"
   - Category: "Infrastructure"
   - Description: "There is a large pothole on Main Street that needs repair"
   - Location: "Corner of Main St. and 2nd Ave."
   - Urgency: "Medium"
2. Check the reCAPTCHA box ("I'm not a robot")
3. Wait for green checkmark
4. Click "Submit Concern" button

**Expected Result**:
- ✅ Button becomes ENABLED (blue color)
- ✅ Button text: "Submit Concern"
- ✅ Form submits successfully
- ✅ Redirects to success page with reference code
- ✅ Reference code format: `SV-2026-XXXXX`

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Scenario 3: CAPTCHA Expiry
**Steps**:
1. Fill out form fields
2. Check the reCAPTCHA box
3. Wait 2 minutes WITHOUT submitting
4. Try to submit the form

**Expected Result**:
- ⚠️ Error message: "reCAPTCHA expired. Please verify again."
- ⚠️ CAPTCHA widget resets automatically
- ⚠️ Submit button becomes disabled again
- ⚠️ User must re-verify CAPTCHA

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Scenario 4: Invalid CAPTCHA Token
**Steps**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Fill out form and complete CAPTCHA
4. Before submitting, manually change `captchaToken` state to invalid value
5. Submit form

**Expected Result**:
- ❌ Server returns 422 error
- ❌ Error message: "reCAPTCHA verification failed. Please try again."
- ❌ CAPTCHA widget resets
- ❌ Form not submitted

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Scenario 5: Network Error During Submission
**Steps**:
1. Fill out form and complete CAPTCHA
2. Stop the Laravel backend server
3. Try to submit form

**Expected Result**:
- ❌ Error message: "Cannot connect to server. Please ensure the backend is running."
- ❌ CAPTCHA widget resets
- ❌ Form not submitted
- ❌ User can retry after backend is back online

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Scenario 6: Successful Submission with Photos
**Steps**:
1. Fill out all form fields
2. Upload 1-3 photos (JPEG, PNG, or WebP, under 10MB each)
3. Complete reCAPTCHA
4. Submit form

**Expected Result**:
- ✅ Form submits successfully
- ✅ Photos uploaded to server
- ✅ Redirects to success page
- ✅ Reference code displayed
- ✅ CAPTCHA token verified on backend

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Scenario 7: Multiple Submissions
**Steps**:
1. Submit a form successfully
2. Click "Back to Home"
3. Navigate to submit form again
4. Fill out and submit another form

**Expected Result**:
- ✅ CAPTCHA widget loads fresh
- ✅ New CAPTCHA verification required
- ✅ Second submission succeeds
- ✅ Different reference code generated

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 🔍 Backend Verification

### Check Laravel Logs

```bash
cd LARAVEL-BACK-END
tail -f storage/logs/laravel.log
```

**Look for**:
- ✅ "Guest ticket submitted" with tracking_id
- ❌ "reCAPTCHA verification failed" with IP address (for failed attempts)

### Check Database

```bash
php artisan tinker
```

```php
// Get latest ticket
$ticket = \App\Models\Ticket::latest()->first();
echo $ticket->tracking_id;
echo $ticket->guest_name;
echo $ticket->guest_email;
```

**Expected**:
- ✅ Ticket created in database
- ✅ All fields populated correctly
- ✅ Photos stored in `storage/app/public/tickets/`

---

## 🌐 Browser Console Checks

### Open DevTools (F12) → Console Tab

**Expected Console Logs**:
```
reCAPTCHA token received: Valid
Submit button clicked - starting validation
Validation passed - submitting form
Sending request to API...
API response: {success: true, tracking_id: "SV-2026-00001", ...}
Navigating to success page with tracking ID: SV-2026-00001
```

**No Errors Expected**:
- ❌ No CORS errors
- ❌ No 500 Internal Server Errors
- ❌ No JavaScript errors
- ❌ No network errors

---

## 📊 Performance Checks

### Build Time
```bash
cd REACT-FRONT-END
npm run build
```

**Expected**:
- ✅ Build completes in < 3 seconds
- ✅ 0 vulnerabilities
- ✅ No warnings or errors

### Page Load Time
- ✅ Form loads in < 2 seconds
- ✅ reCAPTCHA widget loads in < 1 second
- ✅ No layout shift when CAPTCHA loads

---

## 🔒 Security Checks

### 1. Secret Key Not Exposed
**Check**:
- View page source (Ctrl+U)
- Search for "6Lfpzt8sAAAAALiJPQuYI7S_814y5bq9j00W9alj"

**Expected**:
- ❌ Secret key NOT found in frontend code
- ✅ Only site key visible

### 2. Server-Side Verification
**Check**:
- Submit form with valid CAPTCHA
- Check Laravel logs for verification request

**Expected**:
- ✅ Backend calls Google API to verify token
- ✅ Token verified before saving to database

### 3. Rate Limiting
**Check**:
- Submit 20 forms rapidly

**Expected**:
- ⚠️ After 15 submissions, rate limit kicks in
- ⚠️ Error: "Too Many Requests"

---

## 🐛 Common Issues & Solutions

### Issue 1: CAPTCHA Widget Not Showing
**Symptoms**: Empty space where CAPTCHA should be

**Solutions**:
1. Check `VITE_RECAPTCHA_SITE_KEY` in `.env`
2. Restart Vite dev server: `npm run dev`
3. Clear browser cache
4. Check browser console for errors

---

### Issue 2: "Invalid Site Key" Error
**Symptoms**: CAPTCHA shows error message

**Solutions**:
1. Verify site key matches Google reCAPTCHA admin console
2. Check domain is allowed in reCAPTCHA settings
3. For localhost, ensure "localhost" is in allowed domains

---

### Issue 3: Backend Returns 422 Even with Valid CAPTCHA
**Symptoms**: Form submission fails with validation error

**Solutions**:
1. Check `NOCAPTCHA_SECRET` in Laravel `.env`
2. Run `php artisan config:clear`
3. Run `php artisan config:cache`
4. Check Laravel logs for specific error

---

### Issue 4: CAPTCHA Token Not Sent to Backend
**Symptoms**: Backend says "captcha_token is required"

**Solutions**:
1. Check browser console for `captchaToken` state
2. Verify `onChange` handler is setting token
3. Check FormData includes `captcha_token`

---

## 📝 Test Results Template

```
Date: _______________
Tester: _______________

Scenario 1: Submit Without CAPTCHA          [ ] Pass  [ ] Fail
Scenario 2: Complete CAPTCHA and Submit     [ ] Pass  [ ] Fail
Scenario 3: CAPTCHA Expiry                  [ ] Pass  [ ] Fail
Scenario 4: Invalid CAPTCHA Token           [ ] Pass  [ ] Fail
Scenario 5: Network Error                   [ ] Pass  [ ] Fail
Scenario 6: Submission with Photos          [ ] Pass  [ ] Fail
Scenario 7: Multiple Submissions            [ ] Pass  [ ] Fail

Backend Verification                        [ ] Pass  [ ] Fail
Browser Console Checks                      [ ] Pass  [ ] Fail
Performance Checks                          [ ] Pass  [ ] Fail
Security Checks                             [ ] Pass  [ ] Fail

Overall Status: [ ] All Tests Pass  [ ] Some Tests Fail  [ ] Not Tested

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🎯 Success Criteria

✅ **All 7 test scenarios pass**  
✅ **No console errors**  
✅ **Backend verification works**  
✅ **Security checks pass**  
✅ **Performance is acceptable**  
✅ **User experience is smooth**

---

## 📞 Support

If you encounter issues:
1. Check this guide for common solutions
2. Review `docs/implementation/RECAPTCHA-V2-IMPLEMENTATION-COMPLETE.md`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Check browser console for frontend errors
5. Verify environment variables are set correctly

---

**Testing Status**: ⬜ Not Started | 🔄 In Progress | ✅ Complete  
**Last Updated**: May 8, 2026
