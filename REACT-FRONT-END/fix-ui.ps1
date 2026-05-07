# UI Fix Script - Clears all caches and restarts dev server
# Run this script if you see the giant green circle bug

Write-Host "🔧 Starting UI Fix..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear Vite cache
Write-Host "Step 1: Clearing Vite cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules/.vite, dist, .vite -ErrorAction SilentlyContinue
Write-Host "✅ Vite cache cleared" -ForegroundColor Green
Write-Host ""

# Step 2: Reinstall dependencies
Write-Host "Step 2: Reinstalling dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Instructions
Write-Host "✅ Fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "2. Open browser: http://localhost:5174" -ForegroundColor White
Write-Host "3. Hard refresh: Ctrl+Shift+R" -ForegroundColor White
Write-Host ""
Write-Host "The green circle should be gone! 🎉" -ForegroundColor Green
