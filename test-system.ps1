#!/usr/bin/env pwsh
# System Test Script - Verify all portals are functional

Write-Host "`n=== BARANGAY CONNECT SYSTEM TEST ===" -ForegroundColor Cyan
Write-Host "Testing all critical endpoints and functionality`n" -ForegroundColor Gray

$baseUrl = "http://127.0.0.1:8000/api/v1"
$frontendUrl = "http://localhost:5173"

# Test 1: Backend Health
Write-Host "[1/6] Testing Backend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/guest/tickets/INVALID" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 404 -or $response.StatusCode -eq 200) {
        Write-Host "  OK Backend is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "  X Backend not responding" -ForegroundColor Red
}

# Test 2: Admin Login
Write-Host "`n[2/6] Testing Admin Login..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@sanvicente.gov.ph"
        password = "Admin@2026!"
        portal = "admin"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success -and $response.data.token) {
        Write-Host "  OK Admin login successful" -ForegroundColor Green
        $adminToken = $response.data.token
        
        # Test 3: Admin Dashboard
        Write-Host "`n[3/6] Testing Admin Dashboard API..." -ForegroundColor Yellow
        $headers = @{ Authorization = "Bearer $adminToken" }
        $dashResponse = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method GET -Headers $headers
        
        if ($dashResponse.success) {
            Write-Host "  OK Admin dashboard API working" -ForegroundColor Green
            Write-Host "    - Total tickets: $($dashResponse.data.total_tickets)" -ForegroundColor Gray
        }
        
        # Test 4: Notifications API
        Write-Host "`n[4/6] Testing Notifications API..." -ForegroundColor Yellow
        $notifResponse = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers $headers
        
        if ($notifResponse.success) {
            Write-Host "  OK Notifications API working" -ForegroundColor Green
            Write-Host "    - Unread count: $($notifResponse.data.unread_count)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  X Admin login failed" -ForegroundColor Red
}

# Test 5: Personnel Login
Write-Host "`n[5/6] Testing Personnel Login..." -ForegroundColor Yellow
try {
    $body = @{
        email = "personnel1@sanvicente.gov.ph"
        password = "Personnel@2026!"
        portal = "personnel"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success -and $response.data.token) {
        Write-Host "  OK Personnel login successful" -ForegroundColor Green
        $personnelToken = $response.data.token
        
        # Test Personnel Dashboard
        $headers = @{ Authorization = "Bearer $personnelToken" }
        $dashResponse = Invoke-RestMethod -Uri "$baseUrl/personnel/dashboard" -Method GET -Headers $headers
        
        if ($dashResponse.success) {
            Write-Host "  OK Personnel dashboard API working" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  X Personnel login failed" -ForegroundColor Red
}

# Test 6: Frontend Accessibility
Write-Host "`n[6/6] Testing Frontend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "  X Frontend not accessible" -ForegroundColor Red
}

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Backend URL: $baseUrl" -ForegroundColor Gray
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Gray
Write-Host "`nTest complete! Check results above.`n" -ForegroundColor Green
