@echo off
echo ========================================
echo  Restarting Date2W Server
echo ========================================
echo.

echo Step 1: Stopping current server...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Server stopped successfully
) else (
    echo ℹ No running server found
)
echo.

echo Step 2: Waiting for port to be released...
timeout /t 2 /nobreak >nul
echo ✓ Ready
echo.

echo Step 3: Starting server...
cd server
echo Starting in: %cd%
echo.
npm run dev
