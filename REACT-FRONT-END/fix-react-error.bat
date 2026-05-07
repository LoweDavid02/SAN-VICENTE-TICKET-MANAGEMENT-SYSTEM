@echo off
echo Fixing React useState error...
echo.

echo Step 1: Clearing Vite cache...
rmdir /s /q node_modules\.vite 2>nul
echo Done!
echo.

echo Step 2: Clearing dist folder...
rmdir /s /q dist 2>nul
echo Done!
echo.

echo Step 3: Installing dependencies...
call npm install
echo Done!
echo.

echo Step 4: Starting dev server...
echo Please close this window and run: npm run dev
echo.
pause
