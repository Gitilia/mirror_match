#!/bin/bash
# Watch user activity logs in real-time
# 
# This script monitors systemd journal logs for MirrorMatch activity.
# It filters for activity-related log entries including page visits, photo uploads, and guess submissions.
#
# Usage: ./watch-activity.sh
#
# Requirements:
# - Systemd/journalctl (Linux systems with systemd)
# - Appropriate permissions (may require sudo)
# - Application running as a systemd service named "app-backend"
#
# For local development without systemd:
# - Check application console output directly
# - Use `npm run dev` and monitor terminal output
# - Or redirect logs to a file and tail it: `npm run dev > app.log 2>&1 && tail -f app.log`
#
# Note: With the new structured logging system, you can also filter by log level:
# - Set LOG_LEVEL=DEBUG to see all activity logs
# - Set LOG_FORMAT=json for structured JSON logs

echo "Watching user activity logs..."
echo "Press Ctrl+C to stop"
echo ""

# Watch for activity logs (ACTIVITY, PHOTO_UPLOAD, GUESS_SUBMIT)
# These patterns match the activity log format from lib/activity-log.ts
sudo journalctl -u app-backend -f | grep -E "\[ACTIVITY\]|\[PHOTO_UPLOAD\]|\[GUESS_SUBMIT\]|Activity:"
