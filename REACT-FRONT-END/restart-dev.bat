@echo off
echo ========================================
echo  Clearing Vite Cache and Restarting
echo ========================================
echo.

echo [1/3] Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Cache cleared
) else (
    echo ✓ Cache already clear
)
echo.

echo [2/3] Starting development server...
echo.
echo ========================================
echo  Server will start on http://localhost:5173
echo  Press Ctrl+C to stop
echo ========================================
echo.

npm run dev
