# 🛠️ MAINTENANCE GUIDE

## Barangay San Vicente - Preventing Common Errors

**Last Updated**: May 6, 2026  
**Version**: 1.0.0

---

## 📋 TABLE OF CONTENTS

1. [Critical Fixes Applied](#critical-fixes-applied)
2. [Common Error Patterns](#common-error-patterns)
3. [Prevention Strategies](#prevention-strategies)
4. [Monitoring & Alerts](#monitoring--alerts)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Update Procedures](#update-procedures)

---

## ✅ CRITICAL FIXES APPLIED

### **Fix 1: Photo Upload Validation Mismatch** (M1)
**Problem**: Frontend sent `photos[]` but backend expected `images[]`

**Solution Applied**:
```php
// LARAVEL-BACK-END/app/Http/Requests/Api/SubmitGuestTicketRequest.php
'photos'   => ['nullable', 'array', 'max:3'],
'photos.*' => ['file', 'image', 'mimes:jpeg,png,webp', 'max:10240'],
```

**Prevention**:
- ✅ Always match frontend field names with backend validation rules
- ✅ Document API contracts in OpenAPI/Swagger
- ✅ Add integration tests that submit actual FormData

---

### **Fix 2: Race Condition in Reference Code Generation** (M2)
**Problem**: Concurrent requests could generate duplicate reference codes

**Solution Applied**:
```php
// LARAVEL-BACK-END/app/Http/Controllers/Api/V1/Guest/GuestController.php
private function generateTrackingCode(): string
{
    return DB::transaction(function () use ($year) {
        $lastTicket = Ticket::whereYear('created_at', $year)
            ->lockForUpdate()  // ✅ Database lock prevents race conditions
            ->orderByDesc('id')
            ->first();
        // ...
    });
}
```

**Prevention**:
- ✅ Always use `lockForUpdate()` when reading data that will be used to generate unique values
- ✅ Wrap in `DB::transaction()` for atomicity
- ✅ Add unique database constraints as last line of defense

---

### **Fix 3: File Cleanup on Transaction Rollback** (M8)
**Problem**: Files uploaded to storage remained even if database transaction failed

**Solution Applied**:
```php
$uploadedFiles = []; // Track uploaded files

try {
    foreach ($photos as $photo) {
        $path = $photo->storeAs('tickets', $filename, 'public');
        $uploadedFiles[] = $path;  // ✅ Track for cleanup
        // ...
    }
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    
    // ✅ Clean up orphaned files
    foreach ($uploadedFiles as $path) {
        Storage::disk('public')->delete($path);
    }
    throw $e;
}
```

**Prevention**:
- ✅ Always track uploaded files in an array
- ✅ Clean up files in catch block before re-throwing exception
- ✅ Consider using database transactions for file operations

---

### **Fix 4: Dashboard Memory Exhaustion** (M5)
**Problem**: Loading all tickets into memory caused crashes with large datasets

**Solution Applied**:
```php
// Before: $tickets = Ticket::with([...])->get();  // ❌ Loads ALL tickets
// After:
$tickets = Ticket::with([...])->limit(100)->get();  // ✅ Limit to 100
```

**Prevention**:
- ✅ Always use `limit()` or `paginate()` when loading collections
- ✅ Never use `->get()` without pagination on tables that can grow large
- ✅ Monitor memory usage in production

---

### **Fix 5: Upload Rate Limiting** (M6)
**Problem**: No rate limiting on photo uploads allowed storage exhaustion attacks

**Solution Applied**:
```php
// LARAVEL-BACK-END/app/Providers/AppServiceProvider.php
RateLimiter::for('uploads', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});

// LARAVEL-BACK-END/routes/api.php
Route::post('/tickets', [GuestController::class, 'submitTicket'])
    ->middleware('throttle:uploads');  // ✅ 5 uploads/minute max
```

**Prevention**:
- ✅ Apply stricter rate limits to file upload endpoints
- ✅ Monitor storage usage and set alerts
- ✅ Implement file size quotas per user/IP

---

### **Fix 6: Custom Exception Handler** (H3)
**Problem**: Stack traces exposed in production API responses

**Solution Applied**:
```php
// LARAVEL-BACK-END/app/Exceptions/Handler.php
public function render($request, Throwable $e)
{
    if ($request->is('api/*')) {
        return response()->json([
            'success' => false,
            'message' => config('app.debug') ? $e->getMessage() : 'An error occurred.',
            'error'   => config('app.debug') ? [...] : null,  // ✅ Hide in production
        ], 500);
    }
}
```

**Prevention**:
- ✅ Always set `APP_DEBUG=false` in production `.env`
- ✅ Use custom exception handler to control error responses
- ✅ Log detailed errors to files, return generic messages to users

---

## 🚨 COMMON ERROR PATTERNS

### **Pattern 1: N+1 Query Problem**
**Symptom**: Slow API responses, high database load

**Example**:
```php
// ❌ BAD: N+1 queries
$tickets = Ticket::all();
foreach ($tickets as $ticket) {
    echo $ticket->resident->name;  // Queries database for each ticket
}

// ✅ GOOD: Eager loading
$tickets = Ticket::with('resident')->get();
foreach ($tickets as $ticket) {
    echo $ticket->resident->name;  // No additional queries
}
```

**Detection**:
```bash
# Enable query logging in local environment
DB::enableQueryLog();
// ... run code ...
dd(DB::getQueryLog());
```

---

### **Pattern 2: Missing Transaction Wrapping**
**Symptom**: Partial data saved when errors occur

**Example**:
```php
// ❌ BAD: No transaction
$ticket = Ticket::create([...]);
TicketTimeline::create([...]);  // If this fails, ticket remains

// ✅ GOOD: Wrapped in transaction
DB::transaction(function () {
    $ticket = Ticket::create([...]);
    TicketTimeline::create([...]);  // Both succeed or both fail
});
```

**Rule**: Wrap related database operations in transactions

---

### **Pattern 3: Unvalidated User Input**
**Symptom**: XSS attacks, SQL injection attempts

**Example**:
```php
// ❌ BAD: Direct use of user input
$search = $request->search;
$tickets = Ticket::where('title', 'LIKE', "%{$search}%")->get();

// ✅ GOOD: Validated and sanitized
$request->validate(['search' => 'string|max:100|regex:/^[\w\s\-]+$/']);
$search = e($request->search);  // Escape HTML entities
```

**Rule**: Always validate and sanitize user input

---

### **Pattern 4: Missing Error Handling**
**Symptom**: Unhandled exceptions crash the application

**Example**:
```php
// ❌ BAD: No error handling
$ticket = Ticket::findOrFail($id);  // Throws exception if not found

// ✅ GOOD: Graceful error handling
try {
    $ticket = Ticket::findOrFail($id);
} catch (ModelNotFoundException $e) {
    return response()->json(['error' => 'Ticket not found'], 404);
}
```

**Rule**: Wrap risky operations in try-catch blocks

---

### **Pattern 5: Hardcoded Configuration**
**Symptom**: Difficult to change settings, environment-specific bugs

**Example**:
```php
// ❌ BAD: Hardcoded values
$maxPhotos = 3;
$maxFileSize = 10485760;  // 10MB in bytes

// ✅ GOOD: Configuration file
// config/tickets.php
return [
    'max_photos' => env('TICKET_MAX_PHOTOS', 3),
    'max_file_size' => env('TICKET_MAX_FILE_SIZE', 10485760),
];

// Usage:
$maxPhotos = config('tickets.max_photos');
```

**Rule**: Extract magic numbers to configuration files

---

## 🛡️ PREVENTION STRATEGIES

### **1. Code Review Checklist**

Before merging any PR, verify:

- [ ] All database queries use eager loading (`with()`)
- [ ] File uploads have validation rules
- [ ] Related operations wrapped in transactions
- [ ] User input validated and sanitized
- [ ] Error handling implemented
- [ ] Rate limiting applied to public endpoints
- [ ] No hardcoded secrets or configuration
- [ ] Tests added for new features
- [ ] Documentation updated

---

### **2. Automated Testing**

**Unit Tests** (80% coverage target):
```bash
# Run tests
php artisan test

# With coverage report
php artisan test --coverage --min=80
```

**Integration Tests**:
```php
// tests/Feature/GuestTicketTest.php
public function test_submit_ticket_with_photos()
{
    Storage::fake('public');
    
    $response = $this->postJson('/api/v1/guest/tickets', [
        'guest_name' => 'Test User',
        // ...
        'photos' => [
            UploadedFile::fake()->image('photo1.jpg', 1000, 1000)->size(5000),
            UploadedFile::fake()->image('photo2.jpg', 1000, 1000)->size(5000),
        ],
    ]);
    
    $response->assertStatus(201);
    Storage::disk('public')->assertExists('tickets/SV-2026-00001_1_*.jpg');
}
```

---

### **3. Static Analysis**

**PHPStan** (Laravel-specific):
```bash
composer require --dev phpstan/phpstan
composer require --dev larastan/larastan

# Run analysis
./vendor/bin/phpstan analyse app
```

**ESLint** (Frontend):
```bash
npm run lint
```

---

### **4. Database Indexes**

Add indexes for frequently queried columns:
```php
// database/migrations/YYYY_MM_DD_add_indexes_to_tickets.php
Schema::table('tickets', function (Blueprint $table) {
    $table->index('tracking_id');
    $table->index('status');
    $table->index('created_at');
    $table->index(['latitude', 'longitude']);
});
```

---

### **5. Monitoring & Logging**

**Laravel Telescope** (Development):
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

**Production Logging**:
```php
// config/logging.php
'channels' => [
    'production' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => 'error',
        'days' => 14,
    ],
],
```

---

## 📊 MONITORING & ALERTS

### **Key Metrics to Monitor**

1. **API Response Time**
   - Target: < 200ms average
   - Alert: > 500ms for 5 minutes

2. **Error Rate**
   - Target: < 1% of requests
   - Alert: > 5% for 5 minutes

3. **Storage Usage**
   - Target: < 80% capacity
   - Alert: > 90% capacity

4. **Database Connections**
   - Target: < 50 concurrent
   - Alert: > 80 concurrent

5. **Memory Usage**
   - Target: < 512MB per process
   - Alert: > 1GB per process

---

### **Health Check Endpoint**

```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
        'storage' => Storage::disk('public')->exists('tickets') ? 'accessible' : 'inaccessible',
    ]);
});
```

---

## 🔧 TROUBLESHOOTING GUIDE

### **Issue: "Too Many Requests" (429)**
**Cause**: Rate limit exceeded  
**Solution**:
```bash
# Check rate limiter config
php artisan route:list | grep throttle

# Temporarily increase limit (not recommended)
# Better: Ask user to wait 1 minute
```

---

### **Issue: "Duplicate Reference Code"**
**Cause**: Race condition (should be fixed now)  
**Solution**:
```bash
# Verify fix is applied
grep -n "lockForUpdate" app/Http/Controllers/Api/V1/Guest/GuestController.php

# Check for duplicates
php artisan tinker
>>> Ticket::select('tracking_id')->groupBy('tracking_id')->havingRaw('COUNT(*) > 1')->get()
```

---

### **Issue: "Storage Full"**
**Cause**: Too many uploaded photos  
**Solution**:
```bash
# Check storage usage
du -sh storage/app/public/tickets/

# Clean up old files (older than 90 days)
find storage/app/public/tickets/ -type f -mtime +90 -delete

# Or implement automatic cleanup
php artisan schedule:work
```

---

### **Issue: "Memory Exhausted"**
**Cause**: Loading too many records  
**Solution**:
```bash
# Check memory limit
php -i | grep memory_limit

# Increase temporarily (not recommended)
ini_set('memory_limit', '512M');

# Better: Fix query to use pagination
```

---

## 🔄 UPDATE PROCEDURES

### **Updating Dependencies**

```bash
# 1. Backup database
pg_dump laravel_db > backup_$(date +%Y%m%d).sql

# 2. Update composer packages
composer update

# 3. Run migrations
php artisan migrate

# 4. Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 5. Test critical flows
php artisan test

# 6. Deploy
git push origin main
```

---

### **Database Migrations**

```bash
# Always test migrations locally first
php artisan migrate --pretend

# Run migrations
php artisan migrate

# Rollback if needed
php artisan migrate:rollback --step=1
```

---

### **Deployment Checklist**

- [ ] Run tests locally (`php artisan test`)
- [ ] Update `.env` with production values
- [ ] Set `APP_DEBUG=false`
- [ ] Set `APP_ENV=production`
- [ ] Run migrations (`php artisan migrate --force`)
- [ ] Clear caches
- [ ] Restart queue workers
- [ ] Monitor error logs for 1 hour
- [ ] Test critical user flows

---

## 📚 ADDITIONAL RESOURCES

- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://react.dev
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **OWASP Security Guide**: https://owasp.org/www-project-top-ten/

---

## 🆘 EMERGENCY CONTACTS

**Technical Lead**: [Your Name]  
**DevOps**: [DevOps Contact]  
**Database Admin**: [DBA Contact]  
**On-Call**: [On-Call Number]

---

**Last Updated**: May 6, 2026  
**Next Review**: August 6, 2026
