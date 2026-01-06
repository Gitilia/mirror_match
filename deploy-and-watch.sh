#!/bin/bash
# Deploy server and watch activity logs
# Usage: ./deploy-and-watch.sh

echo "========================================="
echo "Deploying and watching activity logs"
echo "========================================="
echo ""

# Start rebuild in background
echo "Starting server deployment..."
./rebuild.sh prod &
REBUILD_PID=$!

# Wait for log file to be created (with timeout)
LOG_FILE="/tmp/mirrormatch-server.log"
MAX_WAIT=30
WAITED=0

echo "Waiting for server to start and create log file..."
while [ ! -f "$LOG_FILE" ] && [ $WAITED -lt $MAX_WAIT ]; do
  sleep 1
  WAITED=$((WAITED + 1))
  if [ $((WAITED % 5)) -eq 0 ]; then
    echo "  Still waiting... ($WAITED/$MAX_WAIT seconds)"
  fi
done

if [ ! -f "$LOG_FILE" ]; then
  echo "⚠ Warning: Log file not created after $MAX_WAIT seconds"
  echo "   Check if rebuild.sh completed successfully"
  echo "   You can manually watch logs later: ./watch-activity.sh $LOG_FILE"
  exit 1
fi

echo "✓ Log file created: $LOG_FILE"
echo ""
echo "========================================="
echo "Watching activity logs..."
echo "Press Ctrl+C to stop"
echo "========================================="
echo ""

# Watch activity logs
./watch-activity.sh "$LOG_FILE"
