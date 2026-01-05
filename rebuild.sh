#!/bin/bash
# Complete clean rebuild and start script for MirrorMatch
# Usage: ./rebuild.sh [dev|prod]
#   dev  - Development mode (hot reload, foreground)
#   prod - Production mode (optimized, background with logging)

set -e

MODE=${1:-prod}

echo "========================================="
echo "MirrorMatch - Clean Rebuild & Start"
echo "Mode: ${MODE}"
echo "========================================="

# Step 1: Kill everything
echo ""
echo "Step 1: Killing all processes..."
sudo fuser -k 3000/tcp 2>/dev/null || true
killall -9 node 2>/dev/null || true
pkill -f "next" 2>/dev/null || true
sleep 2
echo "✓ All processes killed"

# Step 2: Free ports
echo ""
echo "Step 2: Freeing ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true
sleep 1
echo "✓ Ports freed"

# Step 3: Clean build artifacts
echo ""
echo "Step 3: Cleaning build artifacts..."
cd /home/beast/Code/mirrormatch
rm -rf .next node_modules/.cache .next/cache .next/dev/lock 2>/dev/null || true
echo "✓ Build artifacts cleaned"

# Step 4: Rebuild (only for production)
if [ "$MODE" = "prod" ]; then
  echo ""
  echo "Step 4: Rebuilding application..."
  npm run build
  echo "✓ Build complete"
fi

# Step 5: Start server
echo ""
echo "Step 5: Starting server..."
echo "========================================="

if [ "$MODE" = "dev" ]; then
  echo "Development mode - logs will appear below:"
  echo "Press Ctrl+C to stop"
  echo "========================================="
  echo ""
  export NODE_ENV=development
  unset AUTH_TRUST_HOST
  npm run dev
else
  echo "Production mode - server running in background"
  echo "View logs: tail -f /tmp/mirrormatch-server.log"
  echo "========================================="
  echo ""
  export NODE_ENV=production
  unset AUTH_TRUST_HOST
  npm run start > /tmp/mirrormatch-server.log 2>&1 &
  echo "Server PID: $!"
  echo ""
  sleep 3
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|307"; then
    echo "✓ Server is running on http://localhost:3000"
  else
    echo "⚠ Server may still be starting. Check logs: tail -f /tmp/mirrormatch-server.log"
  fi
fi
