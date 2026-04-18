@echo off
title Barangay Connect — Dev Servers

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     Barangay Connect — Starting...       ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Kill anything on port 8000 or 5173 first
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000 "') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do taskkill /PID %%a /F >nul 2>&1

echo  [1/2] Starting Laravel backend on http://127.0.0.1:8000 ...
start "Laravel API" cmd /k "cd /d %~dp0LARAVEL-BACK-END && php artisan serve --host=127.0.0.1 --port=8000"

:: Wait for Laravel to start
timeout /t 4 /nobreak >nul

echo  [2/2] Starting React frontend on http://localhost:5173 ...
start "React Frontend" cmd /k "cd /d %~dp0REACT-FRONT-END && npm run dev"

echo.
echo  ✅ Both servers starting!
echo.
echo  Backend  → http://127.0.0.1:8000
echo  Frontend → http://localhost:5173/login
echo.
echo  Open your browser at: http://localhost:5173/login
echo.
pause
