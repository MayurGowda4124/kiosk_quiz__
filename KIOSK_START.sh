#!/bin/bash
# UPI Quiz Kiosk - Linux/macOS Kiosk Mode Launcher
# Update the URL below to your production URL

APP_URL="http://localhost:3000"

# Start backend server
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Chrome in kiosk mode
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --fullscreen --disable-infobars "$APP_URL" &
else
    # Linux
    google-chrome --kiosk --fullscreen --disable-infobars "$APP_URL" &
fi

echo "Kiosk mode started!"
echo "Backend PID: $BACKEND_PID"
echo "Press Ctrl+C to stop"

# Wait for user interrupt
trap "kill $BACKEND_PID; exit" INT TERM
wait

