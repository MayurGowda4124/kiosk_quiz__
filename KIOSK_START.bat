@echo off
REM UPI Quiz Kiosk - Windows Kiosk Mode Launcher
REM Update the URL below to your production URL

set APP_URL=http://localhost:3000

REM Start backend server
start "UPI Quiz Backend" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Chrome in kiosk mode
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --fullscreen --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state %APP_URL%

echo Kiosk mode started!
echo Press Ctrl+C to stop

