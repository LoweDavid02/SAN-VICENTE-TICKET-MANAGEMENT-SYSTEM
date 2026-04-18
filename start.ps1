# Barangay Connect — Start both servers
# Run from PowerShell: .\start.ps1

Write-Host ""
Write-Host "  Barangay Connect — Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Kill anything already on these ports
$ports = @(8000, 5173)
foreach ($port in $ports) {
    $pids = (netstat -ano | Select-String ":$port ") -replace '.*\s+(\d+)$','$1' | Select-Object -Unique
    foreach ($p in $pids) {
        if ($p -match '^\d+$') {
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

# Start Laravel in a new PowerShell window
Write-Host "  [1/2] Starting Laravel on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\san-vicente-project.v1\LARAVEL-BACK-END'; php artisan serve --host=127.0.0.1 --port=8000"

# Wait for Laravel to boot
Start-Sleep -Seconds 4

# Start Vite in a new PowerShell window
Write-Host "  [2/2] Starting React on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\san-vicente-project.v1\REACT-FRONT-END'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  Both servers are starting!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Open your browser at:" -ForegroundColor White
Write-Host "  http://localhost:5173/login" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Credentials:" -ForegroundColor White
Write-Host "  Admin     : admin@barangay.gov     / Admin@123" -ForegroundColor Gray
Write-Host "  Resident  : resident@barangay.gov  / Resident@123" -ForegroundColor Gray
Write-Host "  Personnel : personnel@barangay.gov / Personnel@123" -ForegroundColor Gray
Write-Host ""
