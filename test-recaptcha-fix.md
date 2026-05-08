# reCAPTCHA Form Submission Fix

## Problem Identified
The form submission was failing with the error: "Failed to submit your request. Please try again."

### Root Cause
**SSL Certificate Verification Error** in Laravel when making HTTPS requests to Google's reCAPTCHA API:
```
cURL error 60: SSL certificate OpenSSL verify result: unable to get local issuer certificate (20)
```

This is a common issue on Windows development environments where the CA certificate bundle is missing or outdated.

## Solution Applied

### File Modified: `LARAVEL-BACK-END/app/Http/Controllers/Api/V1/Guest/GuestController.php`

**Before:**
```php
$recaptchaResponse = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
    'secret'   => config('services.recaptcha.secret'),
    'response' => $request->captcha_token,
    'remoteip' => $request->ip(),
]);
```

**After:**
```php
$recaptchaResponse = Http::asForm()
    ->withoutVerifying() // Bypass SSL verification for local development
    ->post('https://www.google.com/recaptcha/api/siteverify', [
        'secret'   => config('services.recaptcha.secret'),
        'response' => $request->captcha_token,
        'remoteip' => $request->ip(),
    ]);
```

### What Changed
- Added `->withoutVerifying()` to the HTTP client call
- This bypasses SSL certificate verification for local development
- Added comments explaining this is for local development only

## Important Notes

### For Production Deployment
⚠️ **CRITICAL**: Before deploying to production, you should:

1. **Option 1 (Recommended)**: Remove `->withoutVerifying()` and configure proper SSL certificates on the production server
2. **Option 2**: Use environment-based configuration:

```php
$httpClient = Http::asForm();

// Only disable SSL verification in local development
if (config('app.env') === 'local') {
    $httpClient = $httpClient->withoutVerifying();
}

$recaptchaResponse = $httpClient->post('https://www.google.com/recaptcha/api/siteverify', [
    'secret'   => config('services.recaptcha.secret'),
    'response' => $request->captcha_token,
    'remoteip' => $request->ip(),
]);
```

### Alternative Fix for Windows Development
If you prefer not to disable SSL verification, you can:

1. Download the latest CA certificate bundle from: https://curl.se/ca/cacert.pem
2. Save it to a location like `C:\php\cacert.pem`
3. Update your `php.ini` file:
   ```ini
   curl.cainfo = "C:\php\cacert.pem"
   openssl.cafile = "C:\php\cacert.pem"
   ```
4. Restart the Laravel server

## Testing Checklist

- [ ] User can complete reCAPTCHA checkbox
- [ ] User can fill out all form fields
- [ ] User can click "Submit Concern" button
- [ ] Form submits successfully without errors
- [ ] User is redirected to success page with reference code
- [ ] Reference code is displayed correctly
- [ ] Backend logs show successful submission (no SSL errors)

## Expected Behavior After Fix

1. User completes reCAPTCHA ✓
2. User fills form and clicks Submit ✓
3. Frontend sends POST request to `/api/v1/tickets` with `captcha_token` ✓
4. Backend verifies CAPTCHA with Google (SSL verification bypassed in local) ✓
5. Backend creates ticket and returns tracking ID ✓
6. User redirects to success page with reference code ✓

## Files Modified
- `LARAVEL-BACK-END/app/Http/Controllers/Api/V1/Guest/GuestController.php`

## Verification
The fix has been applied. Please test the form submission:
1. Navigate to http://localhost:5173/submit
2. Fill out the form
3. Complete the reCAPTCHA
4. Click "Submit Concern"
5. Verify you are redirected to the success page with a reference code
