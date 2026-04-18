#!/bin/bash
# Barangay Connect — Start both servers
# Run from Git Bash: bash start-servers.sh

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     Barangay Connect — Starting...       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Kill anything on these ports
fuser -k 8000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

echo "[1/2] Starting Laravel backend on http://127.0.0.1:8000 ..."
cd "$(dirname "$0")/LARAVEL-BACK-END"
php artisan serve --host=127.0.0.1 --port=8000 &
LARAVEL_PID=$!

sleep 3

echo "[2/2] Starting React frontend on http://localhost:5173 ..."
cd "$(dirname "$0")/REACT-FRONT-END"
npm run dev &
VITE_PID=$!

echo ""
echo "✅ Both servers running!"
echo ""
echo "  Backend  → http://127.0.0.1:8000"
echo "  Frontend → http://localhost:5173/login"
echo ""
echo "  Open: http://localhost:5173/login"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait for both
wait $LARAVEL_PID $VITE_PID
