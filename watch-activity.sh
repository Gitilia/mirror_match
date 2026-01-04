#!/bin/bash
# Watch user activity logs in real-time
# Usage: ./watch-activity.sh

echo "Watching user activity logs..."
echo "Press Ctrl+C to stop"
echo ""

# Watch for activity logs (ACTIVITY, PHOTO_UPLOAD, GUESS_SUBMIT)
sudo journalctl -u app-backend -f | grep -E "\[ACTIVITY\]|\[PHOTO_UPLOAD\]|\[GUESS_SUBMIT\]"
