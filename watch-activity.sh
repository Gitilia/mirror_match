#!/bin/bash
# Watch user activity logs in real-time
# 
# This script monitors logs for MirrorMatch activity.
# It can watch systemd journal logs OR application log files.
#
# Usage: ./watch-activity.sh [logfile]
#   - No argument: Try systemd journal (requires systemd service)
#   - With argument: Watch specified log file (e.g., ./watch-activity.sh /tmp/mirrormatch-server.log)
#
# For local development:
#   - If running via rebuild.sh: ./watch-activity.sh /tmp/mirrormatch-server.log
#   - If running via npm run dev: ./watch-activity.sh app.log (if you redirect output)
#   - If running as systemd service: ./watch-activity.sh (uses journalctl)

LOG_FILE="${1:-}"

echo "Watching user activity logs..."
echo "Press Ctrl+C to stop"
echo ""

if [ -n "$LOG_FILE" ]; then
  # Watch log file
  if [ ! -f "$LOG_FILE" ]; then
    echo "⚠ Warning: Log file '$LOG_FILE' does not exist yet."
    echo "   Waiting for it to be created..."
    echo ""
  fi
  tail -f "$LOG_FILE" 2>/dev/null | grep -E "\[ACTIVITY\]|\[PHOTO_UPLOAD\]|\[GUESS_SUBMIT\]|Activity:|INFO.*Activity:"
elif systemctl is-active --quiet app-backend 2>/dev/null; then
  # Use systemd journal if service is active
  echo "Using systemd journal (app-backend service)"
  echo ""
  sudo journalctl -u app-backend -f | grep -E "\[ACTIVITY\]|\[PHOTO_UPLOAD\]|\[GUESS_SUBMIT\]|Activity:|INFO.*Activity:"
else
  # Try common log file locations
  echo "Systemd service not found. Trying common log file locations..."
  echo ""
  
  LOG_FILES=(
    "/tmp/mirrormatch-server.log"
    "app.log"
    "./app.log"
    "/var/log/mirrormatch/app.log"
  )
  
  FOUND=false
  for log in "${LOG_FILES[@]}"; do
    if [ -f "$log" ]; then
      echo "Found log file: $log"
      echo ""
      tail -f "$log" | grep -E "\[ACTIVITY\]|\[PHOTO_UPLOAD\]|\[GUESS_SUBMIT\]|Activity:|INFO.*Activity:"
      FOUND=true
      break
    fi
  done
  
  if [ "$FOUND" = false ]; then
    echo "❌ No log file found. Options:"
    echo "   1. Specify log file: ./watch-activity.sh /path/to/logfile"
    echo "   2. If using rebuild.sh, logs go to: /tmp/mirrormatch-server.log"
    echo "   3. If using systemd, ensure app-backend service is running"
    exit 1
  fi
fi
