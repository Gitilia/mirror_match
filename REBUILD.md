# Rebuild Scripts

## Quick Start

### Production Mode (Recommended for testing)
```bash
./rebuild.sh prod
# or just
./rebuild.sh
```

### Development Mode (Hot reload)
```bash
./rebuild.sh dev
```

## What it does

1. **Kills all processes** - Stops any running Node/Next.js processes
2. **Frees ports** - Ensures ports 3000 and 3003 are available
3. **Cleans build artifacts** - Removes `.next`, cache files, etc.
4. **Rebuilds** (production only) - Runs `npm run build`
5. **Starts server** - Runs in foreground (dev) or background (prod)

## Viewing Logs

### Production Mode
```bash
tail -f /tmp/mirrormatch-server.log
```

### Development Mode
Logs appear directly in the terminal (foreground mode)

### Watching Activity Logs
```bash
# If using rebuild.sh (production mode)
./watch-activity.sh /tmp/mirrormatch-server.log

# If using systemd service
./watch-activity.sh

# Or specify custom log file
./watch-activity.sh /path/to/your/logfile.log
```

## Manual Commands

If you prefer to run commands manually:

```bash
# Kill everything
sudo fuser -k 3000/tcp
killall -9 node
pkill -f "next"
sleep 2

# Clean
cd /path/to/mirror_match
rm -rf .next node_modules/.cache

# Rebuild (production)
npm run build

# Start
NODE_ENV=production npm run start > /tmp/server.log 2>&1 &
# or for dev
NODE_ENV=development npm run dev
```
