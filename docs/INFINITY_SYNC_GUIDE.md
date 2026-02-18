# INFINITY SYNC GUIDE

## Overview

The **Infinity Sync** system ensures live synchronization across Local, GitHub, Google Cloud, and Cloudflare environments. It consists of three main components:

1. **`scripts/infinity-sync.ps1`**: The "God Script" - a master PowerShell synchronization engine
2. **`backend/src/services/SyncService.ts`**: Backend service for heartbeat monitoring
3. **REST API Endpoints**: Expose sync status to the UI (`/api/sync/*`)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [The God Script: infinity-sync.ps1](#the-god-script-infinity-syncps1)
- [Backend Service](#backend-service)
- [API Endpoints](#api-endpoints)
- [Live Sync Loop Setup](#live-sync-loop-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

1. **PowerShell** (Windows/macOS/Linux)
   - Windows: Built-in (PowerShell 5.1+)
   - macOS/Linux: Install [PowerShell Core](https://github.com/PowerShell/PowerShell)

2. **Git**
   - Install: [https://git-scm.com/downloads](https://git-scm.com/downloads)

3. **Docker & Docker Compose**
   - Install: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

4. **GitHub CLI (`gh`)**
   - Install: [https://cli.github.com/](https://cli.github.com/)
   - Authenticate: `gh auth login`

5. **Google Cloud SDK (`gcloud`)**
   - Install: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
   - Authenticate: `gcloud auth login`
   - Set project: `gcloud config set project YOUR_PROJECT_ID`

### Optional Tools

- **Cloudflare CLI** (if managing DNS programmatically)

---

## Quick Start

### Run the Sync Script

```powershell
# Navigate to repository root
cd /path/to/vizual-x-admin-control-plane

# Run the sync script
.\scripts\infinity-sync.ps1

# Dry run mode (no changes made)
.\scripts\infinity-sync.ps1 -DryRun

# Verbose output
.\scripts\infinity-sync.ps1 -Verbose
```

### Check Sync Status via API

Start the backend server:

```bash
cd backend
npm install
npm run dev
```

Query the sync status:

```bash
# Get latest sync status
curl http://localhost:3001/api/sync/status

# Get heartbeat for all services
curl http://localhost:3001/api/sync/heartbeat

# Get comprehensive overview
curl http://localhost:3001/api/sync/overview
```

---

## The God Script: infinity-sync.ps1

### What It Does

The `infinity-sync.ps1` script performs five critical checks:

#### 1. **Authentication Check**
- Verifies `gh` CLI is authenticated
- Verifies `gcloud` CLI is authenticated
- Status: `Success`, `Partial`, or `Failed`

#### 2. **Git Sync**
- Fetches latest changes from remote
- Checks for uncommitted changes
- Detects divergence (ahead/behind/diverged)
- Offers to rebase if behind (when working directory is clean)
- Status: `Synced`, `Diverged`, or `Failed`

#### 3. **Docker Sync**
- Checks Docker daemon is running
- Compares running containers with `docker-compose.yml`
- Identifies services that aren't running
- Offers to start missing services
- Status: `Synced`, `OutOfSync`, `NoManifest`, or `Failed`

#### 4. **GCP Sync**
- Checks Cloud Run service: `vizual-x-admin-control-plane`
- Displays service URL and latest revision
- Offers to deploy current version
- Status: `Synced`, `NotDeployed`, `NotConfigured`, or `Failed`

#### 5. **Cloudflare Check**
- Tests DNS resolution for `vizual-x.com`
- Tests HTTPS connectivity
- Reports IP addresses and response status
- Status: `Reachable`, `PartiallyReachable`, or `Unreachable`

### Output

The script generates a JSON status file at:
```
readiness/infinity-sync-status.json
```

This file is consumed by the backend `SyncService` to expose status to the UI.

### Example Output

```
═══════════════════════════════════════════════════════════
  INFINITY SYNC v1.0 - The God Script
═══════════════════════════════════════════════════════════

[1/5: Authentication Check]
───────────────────────────────────────────────────────────
  ✅ GitHub CLI (gh) authenticated
  ✅ Google Cloud CLI (gcloud) authenticated as: user@example.com

[2/5: Git Repository Sync]
───────────────────────────────────────────────────────────
  ℹ️  Current branch: main
  ✅ Working directory clean
  ℹ️  Fetching from remote...
  ✅ Fetch completed
  ✅ Local and remote are in sync

[3/5: Docker Container Sync]
───────────────────────────────────────────────────────────
  ✅ Docker daemon is running
  ℹ️  Defined services: 2
  ℹ️  Running services: 2
  ✅ All services are running

[4/5: Google Cloud Platform Sync]
───────────────────────────────────────────────────────────
  ℹ️  Current GCP project: vizual-x-project
  ℹ️  Checking Cloud Run service: vizual-x-admin-control-plane
  ✅ Cloud Run service is deployed at: https://vizual-x-...run.app
  ℹ️  Latest revision: vizual-x-admin-control-plane-00123-abc

[5/5: Cloudflare Reachability Check]
───────────────────────────────────────────────────────────
  ℹ️  Testing DNS resolution for vizual-x.com...
  ✅ DNS resolution successful
  ℹ️  IP addresses: 104.21.x.x, 172.67.x.x
  ℹ️  Testing HTTPS connectivity to https://vizual-x.com...
  ✅ HTTPS connectivity successful (Status: 200)

═══════════════════════════════════════════════════════════
  SYNC STATUS SUMMARY
═══════════════════════════════════════════════════════════
Authentication:     Success
Git Repository:     Synced
Docker Containers:  Synced
GCP Cloud Run:      Synced
Cloudflare:         Reachable

  ℹ️  Infinity Sync completed at 2026-02-18 00:50:37
  ℹ️  Status saved to: ..\readiness\infinity-sync-status.json
```

---

## Backend Service

### SyncService.ts

The `SyncService` class provides:

1. **Sync Status Reading**: Reads the JSON file generated by `infinity-sync.ps1`
2. **Heartbeat Monitoring**: Live checks for GitHub API, Google Cloud API, and Cloudflare
3. **Caching**: Avoids hammering external APIs (60-second cache)

### Key Methods

```typescript
// Get sync status from infinity-sync.ps1
await syncService.getSyncStatus();

// Check if status is fresh (< 5 minutes old)
await syncService.isSyncStatusFresh();

// Heartbeat checks
await syncService.checkGitHubHeartbeat();
await syncService.checkGoogleCloudHeartbeat();
await syncService.checkCloudflareHeartbeat();

// Get all heartbeats at once
await syncService.getAllHeartbeats();

// Get comprehensive overview
await syncService.getSyncOverview();
```

---

## API Endpoints

### Base URL
```
http://localhost:3001/api/sync
```

### Endpoints

#### 1. GET `/api/sync/status`
Get the latest sync status from `infinity-sync.ps1`

**Response:**
```json
{
  "timestamp": "2026-02-18T00:50:37.123Z",
  "status": {
    "GitSync": { "Status": "Synced", "Details": [] },
    "DockerSync": { "Status": "Synced", "Details": [] },
    "GCPSync": { "Status": "Synced", "Details": ["Service URL: https://..."] },
    "CloudflareCheck": { "Status": "Reachable", "Details": ["DNS resolved", "IPs: 104.21.x.x"] },
    "AuthCheck": { "Status": "Success", "Details": { "GitHubCLI": true, "GCloudCLI": true } }
  },
  "dryRun": false,
  "fresh": true
}
```

**Status Codes:**
- `200`: Success
- `404`: No sync status available (run `infinity-sync.ps1`)
- `500`: Server error

---

#### 2. GET `/api/sync/heartbeat`
Get heartbeat status for all external services

**Response:**
```json
{
  "timestamp": "2026-02-18T00:50:37.456Z",
  "heartbeats": [
    {
      "service": "GitHub API",
      "status": "healthy",
      "lastCheck": "2026-02-18T00:50:37.456Z",
      "responseTime": 234
    },
    {
      "service": "Google Cloud API",
      "status": "healthy",
      "lastCheck": "2026-02-18T00:50:37.567Z",
      "responseTime": 456
    },
    {
      "service": "Cloudflare (vizual-x.com)",
      "status": "healthy",
      "lastCheck": "2026-02-18T00:50:37.678Z",
      "responseTime": 123
    }
  ]
}
```

**Heartbeat Status Values:**
- `healthy`: Response time < threshold
- `degraded`: Slow response
- `down`: Service unreachable
- `unknown`: Not yet checked

---

#### 3. GET `/api/sync/heartbeat/github`
Get GitHub API heartbeat only

#### 4. GET `/api/sync/heartbeat/gcp`
Get Google Cloud API heartbeat only

#### 5. GET `/api/sync/heartbeat/cloudflare`
Get Cloudflare heartbeat only

#### 6. GET `/api/sync/overview`
Get comprehensive overview (sync status + heartbeats)

**Response:**
```json
{
  "syncStatus": { /* ... sync status object ... */ },
  "syncStatusFresh": true,
  "heartbeats": [ /* ... heartbeat array ... */ ],
  "timestamp": "2026-02-18T00:50:37.789Z"
}
```

---

## Live Sync Loop Setup

To maintain continuous synchronization, you can run the `infinity-sync.ps1` script on a schedule.

### Option 1: Windows Task Scheduler

1. **Open Task Scheduler** (`taskschd.msc`)

2. **Create a Basic Task**:
   - Name: `Infinity Sync`
   - Description: `Automated synchronization for Vizual-X Admin Control Plane`

3. **Trigger**:
   - Frequency: Every 5 minutes (or your preference)
   - Start time: On system startup

4. **Action**:
   - Action: Start a program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\vizual-x-admin-control-plane\scripts\infinity-sync.ps1" -DryRun`
   - Start in: `C:\path\to\vizual-x-admin-control-plane`

5. **Conditions**:
   - Run only if computer is on AC power (optional)
   - Start only if network is available (recommended)

### Option 2: Linux/macOS Cron Job

1. **Open crontab**:
   ```bash
   crontab -e
   ```

2. **Add cron entry** (runs every 5 minutes):
   ```bash
   */5 * * * * cd /path/to/vizual-x-admin-control-plane && pwsh ./scripts/infinity-sync.ps1 >> /var/log/infinity-sync.log 2>&1
   ```

### Option 3: systemd Service (Linux)

1. **Create service file**: `/etc/systemd/system/infinity-sync.service`
   ```ini
   [Unit]
   Description=Infinity Sync Service
   After=network.target

   [Service]
   Type=oneshot
   User=youruser
   WorkingDirectory=/path/to/vizual-x-admin-control-plane
   ExecStart=/usr/bin/pwsh /path/to/vizual-x-admin-control-plane/scripts/infinity-sync.ps1
   StandardOutput=journal
   StandardError=journal

   [Install]
   WantedBy=multi-user.target
   ```

2. **Create timer**: `/etc/systemd/system/infinity-sync.timer`
   ```ini
   [Unit]
   Description=Run Infinity Sync every 5 minutes

   [Timer]
   OnBootSec=1min
   OnUnitActiveSec=5min
   Unit=infinity-sync.service

   [Install]
   WantedBy=timers.target
   ```

3. **Enable and start**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable infinity-sync.timer
   sudo systemctl start infinity-sync.timer
   
   # Check status
   sudo systemctl status infinity-sync.timer
   ```

### Option 4: Background Loop Script

For development/testing, run a simple loop:

**PowerShell:**
```powershell
while ($true) {
    .\scripts\infinity-sync.ps1
    Start-Sleep -Seconds 300  # 5 minutes
}
```

**Bash:**
```bash
while true; do
    pwsh ./scripts/infinity-sync.ps1
    sleep 300  # 5 minutes
done
```

---

## Troubleshooting

### Issue: "GitHub CLI (gh) not authenticated"

**Solution:**
```bash
gh auth login
# Follow the prompts to authenticate
```

### Issue: "Google Cloud CLI (gcloud) not authenticated"

**Solution:**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Issue: "Docker is not running"

**Solution:**
- Windows/macOS: Start Docker Desktop
- Linux: `sudo systemctl start docker`

### Issue: "Cloud Run service not found"

**Solution:**
- Verify the service name matches: `vizual-x-admin-control-plane`
- Check the region: `us-central1` (or adjust in script)
- Ensure you have permissions: `gcloud projects get-iam-policy PROJECT_ID`

### Issue: "Branch has diverged"

**Solution:**
```bash
# If you want to keep local changes
git rebase origin/main

# If you want to discard local changes
git reset --hard origin/main

# If you want to merge instead
git merge origin/main
```

### Issue: "Sync status not fresh"

**Solution:**
- Run `infinity-sync.ps1` manually to update
- Check if the scheduled task/cron job is running
- Verify the `readiness/` directory exists and is writable

### Issue: "Heartbeat shows service as 'down'"

**Possible Causes:**
- Network connectivity issues
- Service is actually down (check status pages)
- Firewall blocking outbound requests
- Rate limiting (cached for 60 seconds to mitigate)

---

## Best Practices

1. **Run Before Deployments**: Always run `infinity-sync.ps1` before deploying to catch conflicts early

2. **Monitor Heartbeats**: Set up UI alerts if any heartbeat shows `down` or `degraded`

3. **Review Divergence**: If Git shows divergence, investigate before force-pushing

4. **Docker Health**: Ensure all defined services are running before coding

5. **Secure Credentials**: Never commit credentials; use environment variables and secret managers

6. **Logging**: For scheduled runs, always log output for debugging

7. **Alerts**: Integrate with monitoring systems (Slack, PagerDuty, etc.) for critical sync failures

---

## Advanced Configuration

### Custom Sync Intervals

Adjust the cron/timer interval based on your workflow:
- **Active development**: Every 5 minutes
- **Stable production**: Every 30 minutes
- **Low-traffic projects**: Every hour

### Extending the Script

Add custom checks to `infinity-sync.ps1`:

```powershell
function Test-CustomService {
    Write-Section "6/6: Custom Service Check"
    
    # Your custom logic here
    
    $script:SyncStatus.CustomCheck = @{
        Status = "Synced"
        Details = @()
    }
}

# Call it in Start-InfinitySync
Test-CustomService
```

### Webhooks & Notifications

Integrate with notification systems:

```powershell
# At the end of Start-InfinitySync
if ($script:SyncStatus.GitSync.Status -eq "Diverged") {
    # Send webhook
    Invoke-WebRequest -Uri "https://hooks.slack.com/..." -Method POST -Body (ConvertTo-Json @{
        text = "⚠️ Git repository diverged!"
    })
}
```

---

## Support

For issues or questions:
- **GitHub Issues**: [vizual-x-admin-control-plane/issues](https://github.com/InfinityXOneSystems/vizual-x-admin-control-plane/issues)
- **Internal Docs**: See `README.md` for general setup

---

**Generated by Vizual-X Admin Control Plane**  
*Infinity Sync System v1.0*
