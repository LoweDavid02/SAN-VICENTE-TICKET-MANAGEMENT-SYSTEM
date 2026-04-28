# PWA Testing Script (PowerShell)
# Tests all PWA functionality and reports issues

Write-Host "🧪 Barangay San Vicente PWA Testing Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0
$Warnings = 0

function Test-Check {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$Expected
    )
    
    Write-Host "Testing: $Name... " -NoNewline
    
    if (& $Test) {
        Write-Host "✓ PASS" -ForegroundColor Green
        $script:Passed++
    } else {
        Write-Host "✗ FAIL" -ForegroundColor Red
        Write-Host "  Expected: $Expected" -ForegroundColor Yellow
        $script:Failed++
    }
}

function Test-Warn {
    param(
        [string]$Name,
        [string]$Message
    )
    
    Write-Host "⚠ WARNING: $Name" -ForegroundColor Yellow
    Write-Host "  $Message" -ForegroundColor Yellow
    $script:Warnings++
}

Write-Host "1. Checking Project Structure" -ForegroundColor Cyan
Write-Host "------------------------------"

# Check if icons directory exists
Test-Check "Icons directory exists" `
    { Test-Path "public/icons" } `
    "Directory public/icons/ should exist"

# Check if manifest exists
Test-Check "Manifest file exists" `
    { Test-Path "public/manifest.json" } `
    "File public/manifest.json should exist"

# Check if offline page exists
Test-Check "Offline fallback exists" `
    { Test-Path "public/offline.html" } `
    "File public/offline.html should exist"

# Check if Service Worker exists
Test-Check "Service Worker exists" `
    { Test-Path "src/sw.js" } `
    "File src/sw.js should exist"

Write-Host ""
Write-Host "2. Checking PWA Core Files" -ForegroundColor Cyan
Write-Host "--------------------------"

# Check if db.js exists
Test-Check "IndexedDB wrapper exists" `
    { Test-Path "src/lib/db.js" } `
    "File src/lib/db.js should exist"

# Check if syncManager exists
Test-Check "Sync Manager exists" `
    { Test-Path "src/lib/syncManager.js" } `
    "File src/lib/syncManager.js should exist"

# Check if crypto.js exists
Test-Check "Encryption utility exists" `
    { Test-Path "src/lib/crypto.js" } `
    "File src/lib/crypto.js should exist"

# Check if PWA hooks exist
Test-Check "PWA hooks exist" `
    { Test-Path "src/hooks/usePWA.js" } `
    "File src/hooks/usePWA.js should exist"

# Check if SyncStatusBar exists
Test-Check "SyncStatusBar component exists" `
    { Test-Path "src/components/SyncStatusBar.jsx" } `
    "File src/components/SyncStatusBar.jsx should exist"

# Check if ErrorBoundary exists
Test-Check "ErrorBoundary component exists" `
    { Test-Path "src/components/ErrorBoundary.jsx" } `
    "File src/components/ErrorBoundary.jsx should exist"

Write-Host ""
Write-Host "3. Checking Dependencies" -ForegroundColor Cyan
Write-Host "------------------------"

# Check if package.json has required deps
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw
    
    Test-Check "Dexie installed" `
        { $packageJson -match '"dexie"' } `
        "dexie should be in dependencies"
    
    Test-Check "Workbox Window installed" `
        { $packageJson -match '"workbox-window"' } `
        "workbox-window should be in dependencies"
    
    Test-Check "Vite PWA Plugin installed" `
        { $packageJson -match '"vite-plugin-pwa"' } `
        "vite-plugin-pwa should be in devDependencies"
} else {
    Test-Warn "package.json not found" "Cannot verify dependencies"
}

Write-Host ""
Write-Host "4. Checking Icon Files" -ForegroundColor Cyan
Write-Host "----------------------"

$RequiredIcons = @(
    "icon-16.png",
    "icon-32.png",
    "icon-72.png",
    "icon-96.png",
    "icon-128.png",
    "icon-144.png",
    "icon-152.png",
    "icon-192.png",
    "icon-384.png",
    "icon-512.png",
    "icon-192-maskable.png",
    "icon-512-maskable.png",
    "badge-72.png",
    "shortcut-dashboard.png",
    "shortcut-new.png",
    "shortcut-tickets.png"
)

$MissingIcons = 0
foreach ($icon in $RequiredIcons) {
    if (-not (Test-Path "public/icons/$icon")) {
        $MissingIcons++
    }
}

if ($MissingIcons -eq 0) {
    Write-Host "✓ All 16 icons present" -ForegroundColor Green
    $Passed++
} else {
    Write-Host "✗ Missing $MissingIcons icon(s)" -ForegroundColor Red
    Write-Host "  Run: See ICON-GENERATION-GUIDE.md for instructions" -ForegroundColor Yellow
    $Failed++
}

Write-Host ""
Write-Host "5. Checking Configuration" -ForegroundColor Cyan
Write-Host "-------------------------"

# Check vite.config.js
if (Test-Path "vite.config.js") {
    $viteConfig = Get-Content "vite.config.js" -Raw
    
    Test-Check "Vite PWA plugin configured" `
        { $viteConfig -match 'VitePWA' } `
        "VitePWA should be imported and used"
    
    Test-Check "Service Worker srcDir correct" `
        { $viteConfig -match "srcDir:\s*['\`"]src['\`"]" } `
        "srcDir should be 'src' not 'public'"
} else {
    Test-Warn "vite.config.js not found" "Cannot verify Vite configuration"
}

# Check .env file
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "VITE_WS_URL") {
        Write-Host "✓ WebSocket URL configured" -ForegroundColor Green
        $Passed++
    } else {
        Test-Warn "VITE_WS_URL not set" "WebSocket will use default localhost:8000"
    }
    
    if ($envContent -match "VITE_VAPID_PUBLIC_KEY") {
        Write-Host "✓ VAPID key configured" -ForegroundColor Green
        $Passed++
    } else {
        Test-Warn "VITE_VAPID_PUBLIC_KEY not set" "Push notifications will not work"
    }
} else {
    Test-Warn ".env file not found" "Create from .env.example"
}

Write-Host ""
Write-Host "6. Checking Import Statements" -ForegroundColor Cyan
Write-Host "------------------------------"

# Check if SyncStatusBar is imported in AppShell
if (Test-Path "src/components/AppShell.jsx") {
    $appShell = Get-Content "src/components/AppShell.jsx" -Raw
    
    Test-Check "SyncStatusBar imported in AppShell" `
        { $appShell -match 'import.*SyncStatusBar' } `
        "SyncStatusBar should be imported"
    
    Test-Check "SyncStatusBar rendered in AppShell" `
        { $appShell -match '<SyncStatusBar' } `
        "SyncStatusBar should be rendered"
} else {
    Test-Warn "AppShell.jsx not found" "Cannot verify SyncStatusBar integration"
}

# Check if ErrorBoundary is used in App.jsx
if (Test-Path "src/App.jsx") {
    $appJsx = Get-Content "src/App.jsx" -Raw
    
    Test-Check "ErrorBoundary imported in App" `
        { $appJsx -match 'import.*ErrorBoundary' } `
        "ErrorBoundary should be imported"
    
    Test-Check "ErrorBoundary wraps app" `
        { $appJsx -match '<ErrorBoundary' } `
        "ErrorBoundary should wrap the app"
} else {
    Test-Warn "App.jsx not found" "Cannot verify ErrorBoundary integration"
}

Write-Host ""
Write-Host "7. Checking Service Worker" -ForegroundColor Cyan
Write-Host "--------------------------"

if (Test-Path "src/sw.js") {
    $swContent = Get-Content "src/sw.js" -Raw
    
    Test-Check "Workbox imports present" `
        { $swContent -match 'from.*workbox' } `
        "Service Worker should import Workbox modules"
    
    Test-Check "Precache configured" `
        { $swContent -match 'precacheAndRoute' } `
        "Service Worker should use precacheAndRoute"
    
    Test-Check "Background Sync configured" `
        { $swContent -match 'BackgroundSyncPlugin' } `
        "Service Worker should use BackgroundSyncPlugin"
    
    Test-Check "Push notification handler" `
        { $swContent -match "addEventListener\('push'" } `
        "Service Worker should handle push events"
} else {
    Test-Warn "src/sw.js not found" "Service Worker is missing"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Passed:   $Passed" -ForegroundColor Green
Write-Host "Failed:   $Failed" -ForegroundColor Red
Write-Host "Warnings: $Warnings" -ForegroundColor Yellow
Write-Host ""

if ($Failed -eq 0 -and $MissingIcons -eq 0) {
    Write-Host "✅ All tests passed! PWA is ready for deployment." -ForegroundColor Green
    exit 0
} elseif ($MissingIcons -gt 0) {
    Write-Host "⚠️  PWA is functional but missing icons." -ForegroundColor Yellow
    Write-Host "   Generate icons using ICON-GENERATION-GUIDE.md"
    exit 1
} else {
    Write-Host "❌ Some tests failed. Please fix the issues above." -ForegroundColor Red
    exit 1
}
