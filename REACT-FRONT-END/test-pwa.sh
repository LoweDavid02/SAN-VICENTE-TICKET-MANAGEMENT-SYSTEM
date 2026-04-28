#!/bin/bash

# PWA Testing Script
# Tests all PWA functionality and reports issues

echo "🧪 Barangay San Vicente PWA Testing Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_check() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Testing: $name... "
    
    if eval "$command"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: $expected"
        ((FAILED++))
    fi
}

# Warning function
test_warn() {
    local name=$1
    local message=$2
    
    echo -e "${YELLOW}⚠ WARNING${NC}: $name"
    echo "  $message"
    ((WARNINGS++))
}

echo "1. Checking Project Structure"
echo "------------------------------"

# Check if icons directory exists
test_check "Icons directory exists" \
    "[ -d 'public/icons' ]" \
    "Directory public/icons/ should exist"

# Check if manifest exists
test_check "Manifest file exists" \
    "[ -f 'public/manifest.json' ]" \
    "File public/manifest.json should exist"

# Check if offline page exists
test_check "Offline fallback exists" \
    "[ -f 'public/offline.html' ]" \
    "File public/offline.html should exist"

# Check if Service Worker exists
test_check "Service Worker exists" \
    "[ -f 'src/sw.js' ]" \
    "File src/sw.js should exist"

echo ""
echo "2. Checking PWA Core Files"
echo "--------------------------"

# Check if db.js exists
test_check "IndexedDB wrapper exists" \
    "[ -f 'src/lib/db.js' ]" \
    "File src/lib/db.js should exist"

# Check if syncManager exists
test_check "Sync Manager exists" \
    "[ -f 'src/lib/syncManager.js' ]" \
    "File src/lib/syncManager.js should exist"

# Check if crypto.js exists
test_check "Encryption utility exists" \
    "[ -f 'src/lib/crypto.js' ]" \
    "File src/lib/crypto.js should exist"

# Check if PWA hooks exist
test_check "PWA hooks exist" \
    "[ -f 'src/hooks/usePWA.js' ]" \
    "File src/hooks/usePWA.js should exist"

# Check if SyncStatusBar exists
test_check "SyncStatusBar component exists" \
    "[ -f 'src/components/SyncStatusBar.jsx' ]" \
    "File src/components/SyncStatusBar.jsx should exist"

# Check if ErrorBoundary exists
test_check "ErrorBoundary component exists" \
    "[ -f 'src/components/ErrorBoundary.jsx' ]" \
    "File src/components/ErrorBoundary.jsx should exist"

echo ""
echo "3. Checking Dependencies"
echo "------------------------"

# Check if package.json has required deps
if [ -f "package.json" ]; then
    test_check "Dexie installed" \
        "grep -q '\"dexie\"' package.json" \
        "dexie should be in dependencies"
    
    test_check "Workbox Window installed" \
        "grep -q '\"workbox-window\"' package.json" \
        "workbox-window should be in dependencies"
    
    test_check "Vite PWA Plugin installed" \
        "grep -q '\"vite-plugin-pwa\"' package.json" \
        "vite-plugin-pwa should be in devDependencies"
else
    test_warn "package.json not found" "Cannot verify dependencies"
fi

echo ""
echo "4. Checking Icon Files"
echo "----------------------"

# List of required icons
ICONS=(
    "icon-16.png"
    "icon-32.png"
    "icon-72.png"
    "icon-96.png"
    "icon-128.png"
    "icon-144.png"
    "icon-152.png"
    "icon-192.png"
    "icon-384.png"
    "icon-512.png"
    "icon-192-maskable.png"
    "icon-512-maskable.png"
    "badge-72.png"
    "shortcut-dashboard.png"
    "shortcut-new.png"
    "shortcut-tickets.png"
)

MISSING_ICONS=0
for icon in "${ICONS[@]}"; do
    if [ ! -f "public/icons/$icon" ]; then
        ((MISSING_ICONS++))
    fi
done

if [ $MISSING_ICONS -eq 0 ]; then
    echo -e "${GREEN}✓ All 16 icons present${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Missing $MISSING_ICONS icon(s)${NC}"
    echo "  Run: See ICON-GENERATION-GUIDE.md for instructions"
    ((FAILED++))
fi

echo ""
echo "5. Checking Configuration"
echo "-------------------------"

# Check vite.config.js
if [ -f "vite.config.js" ]; then
    test_check "Vite PWA plugin configured" \
        "grep -q 'VitePWA' vite.config.js" \
        "VitePWA should be imported and used"
    
    test_check "Service Worker srcDir correct" \
        "grep -q \"srcDir: 'src'\" vite.config.js" \
        "srcDir should be 'src' not 'public'"
else
    test_warn "vite.config.js not found" "Cannot verify Vite configuration"
fi

# Check .env file
if [ -f ".env" ]; then
    if grep -q "VITE_WS_URL" .env; then
        echo -e "${GREEN}✓ WebSocket URL configured${NC}"
        ((PASSED++))
    else
        test_warn "VITE_WS_URL not set" "WebSocket will use default localhost:8000"
    fi
    
    if grep -q "VITE_VAPID_PUBLIC_KEY" .env; then
        echo -e "${GREEN}✓ VAPID key configured${NC}"
        ((PASSED++))
    else
        test_warn "VITE_VAPID_PUBLIC_KEY not set" "Push notifications will not work"
    fi
else
    test_warn ".env file not found" "Create from .env.example"
fi

echo ""
echo "6. Checking Import Statements"
echo "------------------------------"

# Check if SyncStatusBar is imported in AppShell
if [ -f "src/components/AppShell.jsx" ]; then
    test_check "SyncStatusBar imported in AppShell" \
        "grep -q 'import.*SyncStatusBar' src/components/AppShell.jsx" \
        "SyncStatusBar should be imported"
    
    test_check "SyncStatusBar rendered in AppShell" \
        "grep -q '<SyncStatusBar' src/components/AppShell.jsx" \
        "SyncStatusBar should be rendered"
else
    test_warn "AppShell.jsx not found" "Cannot verify SyncStatusBar integration"
fi

# Check if ErrorBoundary is used in App.jsx
if [ -f "src/App.jsx" ]; then
    test_check "ErrorBoundary imported in App" \
        "grep -q 'import.*ErrorBoundary' src/App.jsx" \
        "ErrorBoundary should be imported"
    
    test_check "ErrorBoundary wraps app" \
        "grep -q '<ErrorBoundary' src/App.jsx" \
        "ErrorBoundary should wrap the app"
else
    test_warn "App.jsx not found" "Cannot verify ErrorBoundary integration"
fi

echo ""
echo "7. Checking Service Worker"
echo "--------------------------"

if [ -f "src/sw.js" ]; then
    test_check "Workbox imports present" \
        "grep -q 'from.*workbox' src/sw.js" \
        "Service Worker should import Workbox modules"
    
    test_check "Precache configured" \
        "grep -q 'precacheAndRoute' src/sw.js" \
        "Service Worker should use precacheAndRoute"
    
    test_check "Background Sync configured" \
        "grep -q 'BackgroundSyncPlugin' src/sw.js" \
        "Service Worker should use BackgroundSyncPlugin"
    
    test_check "Push notification handler" \
        "grep -q \"addEventListener('push'\" src/sw.js" \
        "Service Worker should handle push events"
else
    test_warn "src/sw.js not found" "Service Worker is missing"
fi

echo ""
echo "=========================================="
echo "📊 Test Results Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ] && [ $MISSING_ICONS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! PWA is ready for deployment.${NC}"
    exit 0
elif [ $MISSING_ICONS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  PWA is functional but missing icons.${NC}"
    echo "   Generate icons using ICON-GENERATION-GUIDE.md"
    exit 1
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
    exit 1
fi
