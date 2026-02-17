# Infinity Consolidation Architecture

## Overview

The Infinity Consolidation Architecture bridges the gap between static forensic audit reports and the live Admin Control Plane dashboard. This architecture creates a "source of truth" for system infrastructure by aggregating data from multiple sources into a unified inventory service.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     FORENSIC AUDIT SOURCES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. GCP Audit (readiness/gcp_audit_*/gcp_inventory_full.json)  │
│     - Cloud Run Services                                        │
│     - Pub/Sub Topics                                            │
│     - Enabled APIs                                              │
│                                                                  │
│  2. Local System Audit (readiness/local_audit_*/)              │
│     - Docker Containers (docker_containers.txt)                 │
│     - Ollama Models (ollama_models.txt)                         │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND INVENTORY SERVICE                     │
│              (backend/src/services/InventoryService.ts)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • Automatically discovers latest audit reports                 │
│  • Parses JSON and text-based forensic data                     │
│  • Exposes three key methods:                                   │
│    - getCloudResources()  → Cloud Run, Pub/Sub, APIs           │
│    - getLocalResources()  → Docker, Ollama                      │
│    - getSystemHealth()    → Aggregated health score            │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API ENDPOINT                              │
│              (backend/src/routes/inventory.ts)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET /api/inventory/status                                      │
│                                                                  │
│  Returns:                                                        │
│  {                                                               │
│    timestamp: string,                                           │
│    health: { score, status, counts... },                        │
│    cloud: { cloudRunServices, pubSubTopics, enabledAPIs },     │
│    local: { dockerContainers, ollamaModels }                    │
│  }                                                               │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. AdminControlPlane (components/AdminControlPlane.tsx)        │
│     - Fetches real-time data from /api/inventory/status         │
│     - Displays system health and telemetry cards                │
│     - Auto-refreshes every 30 seconds                           │
│                                                                  │
│  2. InfinityMatrix (components/InfinityMatrix.tsx)              │
│     - Dynamically renders tiles for each Cloud Run service      │
│     - Shows service status, region, and URL                     │
│     - Empty state when no services detected                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Backend Inventory Service

**File:** `backend/src/services/InventoryService.ts`

The InventoryService is responsible for:
- **Discovery**: Automatically finds the latest audit directories (`gcp_audit_*` and `local_audit_*`)
- **Parsing**: Reads and parses JSON (GCP) and text-based (local) audit files
- **Aggregation**: Combines data from multiple sources into structured responses

**Key Methods:**

```typescript
getCloudResources(): CloudResources
// Returns Cloud Run services, Pub/Sub topics, and enabled APIs from GCP audit

getLocalResources(): LocalResources
// Returns Docker containers and Ollama models from local system audit

getSystemHealth(): SystemHealth
// Calculates an aggregated health score (0-100) based on resource counts
// Status: 'healthy' (75+), 'degraded' (40-74), 'critical' (<40)
```

### 2. API Endpoint

**File:** `backend/src/routes/inventory.ts`

Exposes a single REST endpoint:

```
GET /api/inventory/status
```

**Response Schema:**

```json
{
  "timestamp": "2026-02-17T22:59:58.337Z",
  "health": {
    "score": 75,
    "status": "healthy",
    "cloudRunCount": 2,
    "pubSubCount": 5,
    "apiCount": 12,
    "dockerCount": 1,
    "ollamaCount": 0
  },
  "cloud": {
    "cloudRunServices": [
      {
        "name": "ai-prophet-autonomous",
        "status": "True",
        "url": "https://...",
        "region": "us-central1"
      }
    ],
    "pubSubTopics": [...],
    "enabledAPIs": [...]
  },
  "local": {
    "dockerContainers": [...],
    "ollamaModels": [...]
  }
}
```

### 3. Frontend Components

**AdminControlPlane** (`components/AdminControlPlane.tsx`)
- Main dashboard component
- Fetches inventory data from backend API
- Displays telemetry cards with counts
- Shows system health status
- Auto-refreshes every 30 seconds

**InfinityMatrix** (`components/InfinityMatrix.tsx`)
- Renders a grid of Cloud Run service tiles
- Each tile shows service name, status, region, and URL
- Visual indicators for online/degraded status
- Empty state when no services are detected

## How to Update the Inventory

The system automatically uses the **most recent** audit reports found in the `readiness/` directory. To update the dashboard with new data:

### Step 1: Run Audit Scripts

**GCP Audit:**
```bash
# From the repository root
./scripts/gcp-inventory-scan.sh
```

This creates a new directory: `readiness/gcp_audit_<timestamp>/gcp_inventory_full.json`

**Local System Audit:**
```bash
# On Windows
.\scripts\audit-local-system.ps1

# On Linux/Mac
# (Script needs to be converted or use Docker)
```

This creates a new directory: `readiness/local_audit_<timestamp>/` with multiple `.txt` files.

### Step 2: Commit and Push

```bash
git add readiness/
git commit -m "Update forensic audit reports"
git push
```

The InventoryService will automatically detect and use the latest audit reports.

### Step 3: Verify in Dashboard

1. Navigate to the Admin Control Plane in the UI
2. The dashboard will automatically refresh within 30 seconds
3. Verify that the new data is displayed

## Configuration

### Backend Configuration

The backend requires no special configuration. It automatically:
- Looks for `readiness/` directory relative to the backend
- Uses the most recent audit directories (sorted by name)
- Handles missing files gracefully with default empty arrays

### Frontend Configuration

Set the backend URL in `.env`:

```bash
VITE_BACKEND_URL=http://localhost:3001
```

For production, set this to your deployed backend URL.

## Health Score Calculation

The system health score is calculated based on resource presence:

| Resource Type       | Points | Threshold        |
|---------------------|--------|------------------|
| Cloud Run Services  | 20     | At least 1       |
| Pub/Sub Topics      | 15     | At least 1       |
| Enabled APIs        | 15     | At least 1       |
| Docker Containers   | 25     | At least 1       |
| Ollama Models       | 25     | At least 1       |

**Status Levels:**
- **Healthy** (75-100): All or most systems operational
- **Degraded** (40-74): Some systems detected
- **Critical** (0-39): Few or no systems detected

## Error Handling

The architecture is designed to be resilient:

- **Missing audit files**: Returns empty arrays, system continues
- **Malformed JSON**: Logged to console, defaults to empty data
- **Backend unavailable**: Frontend shows error message with retry button
- **Partial data**: System displays whatever data is available

## Development

### Running the Backend

```bash
cd backend
npm install
npm run dev
```

The backend will be available at `http://localhost:3001`.

### Running the Frontend

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Testing the Inventory Endpoint

```bash
curl http://localhost:3001/api/inventory/status | jq
```

## Future Enhancements

Potential improvements to the architecture:

1. **Real-time Updates**: WebSocket support for push-based updates
2. **Historical Data**: Store audit history in a database
3. **Alerts**: Trigger notifications when health score drops
4. **Custom Metrics**: Allow users to define custom health calculations
5. **Multi-project Support**: Aggregate data from multiple GCP projects
6. **Export**: Allow exporting consolidated data to various formats

## Troubleshooting

### Issue: Dashboard shows "No data"

**Solution:**
- Verify audit files exist in `readiness/` directory
- Check backend logs for parsing errors
- Ensure file permissions allow reading

### Issue: Backend can't find audit files

**Solution:**
- Check that `readiness/` exists at repository root
- Verify directory names match pattern `gcp_audit_*` or `local_audit_*`
- Check file structure matches expected format

### Issue: Frontend can't connect to backend

**Solution:**
- Verify backend is running on the configured port
- Check `VITE_BACKEND_URL` environment variable
- Ensure CORS is properly configured in backend

## Related Documentation

- [System Consolidation Plan](./00_SYSTEM_CONSOLIDATION_PLAN.md) - Overall consolidation strategy
- [God Mode Documentation](./GOD_MODE.md) - Autonomous refactoring system
- Forensic Audit Scripts:
  - `scripts/gcp-inventory-scan.sh` - GCP audit script
  - `scripts/audit-local-system.ps1` - Local system audit script
