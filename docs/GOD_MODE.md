# God Mode - Autonomous Refactor Protocol

## Overview

**God Mode** is an autonomous refactoring system integrated into the Vizual-X Admin Control Plane. It automatically audits repositories for FAANG-grade standards compliance and creates pull requests to fix violations.

## Features

### 🔍 Audit Capabilities
- **Standards Compliance Check**: Verifies presence of required files (README.md, LICENSE, .gitignore, CONTRIBUTING.md)
- **Code Quality Assessment**: Analyzes code formatting and structure
- **Compliance Scoring**: Provides a numerical score (0-100) indicating repository health

### ⚡ Auto-Fix Capabilities
- **Missing Documentation**: Automatically generates standard files
- **Code Formatting**: Applies Black (Python) and Prettier (JavaScript/TypeScript)
- **Standards Enforcement**: Ensures repositories meet enterprise-level quality standards
- **Automated PR Creation**: Generates pull requests with all fixes

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         AdminDashboard - God Mode UI                   │ │
│  │  • Repository input                                    │ │
│  │  • Audit button                                        │ │
│  │  • Execute God Mode button                             │ │
│  │  • Results display                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Express Backend (TypeScript)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         /api/refactor Routes                           │ │
│  │  • POST /api/refactor/audit                            │ │
│  │  • POST /api/refactor/execute                          │ │
│  │  • GET /api/refactor/status                            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP Requests (axios)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Python Bridge (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Plugin System                                  │ │
│  │  • Dynamic plugin loading                              │ │
│  │  • Command registry                                    │ │
│  │  POST /execute endpoint                                │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Plugin Invocation
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Refactor Plugin (Python)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • check_standards() - Audit function                  │ │
│  │  • auto_fix() - God Mode execution                     │ │
│  │  • register() - Plugin registration                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Via Admin Dashboard UI

1. Navigate to Admin Dashboard
2. Click the **"⚡ God Mode"** tab
3. Enter repository name (format: `owner/repository`)
4. Click **"🔍 Audit"** to check compliance (optional)
5. Click **"⚡ Execute God Mode"** to auto-fix issues
6. View results including compliance score, audit log, changes applied, and PR URL

### Via API

**Audit Repository:**
```bash
curl -X POST http://localhost:3001/api/refactor/audit \
  -H "Content-Type: application/json" \
  -d '{"target": "owner/repository"}'
```

**Execute God Mode:**
```bash
curl -X POST http://localhost:3001/api/refactor/execute \
  -H "Content-Type: application/json" \
  -d '{"target": "owner/repository"}'
```

## Configuration

### Feature Flag
- **Flag ID**: `f_3`
- **Name**: God Mode Refactor
- **Description**: Autonomous repository standards enforcement and auto-fix
- **Default**: Enabled

### Environment Variables
```bash
PYTHON_BRIDGE_URL=http://localhost:8000  # Python bridge endpoint
PORT=3001                                 # Backend server port
```

## Development

### Running the System

1. **Frontend**: `npm install && npm run dev`
2. **Backend**: `cd backend && npm install && npm run dev`
3. **Python Bridge**: `cd backend/python-engine && pip install -r requirements.in && python bridge.py`

## File References

- **Backend API**: `backend/src/api/refactor.ts`
- **Frontend UI**: `components/AdminDashboard.tsx`
- **Python Plugin**: `backend/python-engine/plugins/refactor_plugin.py`
- **Types**: `types.ts`
- **API Service**: `services/apiService.ts`

---

**Status**: ✅ Fully Integrated | **Version**: 1.0.0 | **Last Updated**: 2026-02-17
