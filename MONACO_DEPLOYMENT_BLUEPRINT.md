# MONACO EDITOR LIVE DEPLOYMENT BLUEPRINT
## Forensic Audit & Integration Strategy (Feb 15, 2026)

---

## EXECUTIVE SUMMARY

**Current State:**
- ✅ Monaco Editor component exists (`MonacoEditor.tsx`)
- ✅ VS Code Extension scaffolding complete (`extension.ts`)
- ✅ Vite frontend build configured
- ✅ Docker Compose orchestration prepared
- ✅ Cloudflare DNS records active
- ✅ GCP Cloud Run integration ready
- ❌ **GAPS:** No live webview provider, no real-time sync, no tunnel integration

**Deployment Target:**
1. **VS Code Extension** (local dev)
2. **Cloudflare Tunnel** (secure ingress)
3. **GCP Cloud Run** (production)
4. **vizual-x.com** (public access)

---

## PHASE 1: VS CODE EXTENSION INTEGRATION (LOCAL)

### 1.1 Create MonacoEditorProvider
**File:** `vscode-extension-kit/src/providers/MonacoEditorProvider.ts`

This provider bridges the extension to the Monaco webview:

```typescript
import * as vscode from 'vscode';
import * as path from 'path';
import { FileData, Theme } from '../../types';

export class MonacoEditorProvider implements vscode.WebviewPanelSerializer {
  private panel: vscode.WebviewPanel | undefined;
  private context: vscode.ExtensionContext;
  private onDidChangeEmitter = new vscode.EventEmitter<string>();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async initialize() {
    console.log('Monaco Editor Provider initializing...');
  }

  async openEditor() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'monacoEditor',
      'Vizual-X Monaco Editor',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'dist'))
        ]
      }
    );

    this.panel.webview.html = this.getWebviewContent();
    this.setupMessageHandlers();
    
    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private getWebviewContent(): string {
    const scriptUri = this.panel!.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'webview.js'))
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Vizual-X Monaco Editor</title>
          <style>
            * { margin: 0; padding: 0; }
            body { 
              background: #000000;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
              height: 100vh;
              overflow: hidden;
            }
            #root { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private setupMessageHandlers() {
    this.panel!.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'openFile':
          const fileUri = await vscode.window.showOpenDialog();
          if (fileUri) {
            const content = await vscode.workspace.fs.readFile(fileUri[0]);
            this.panel!.webview.postMessage({
              command: 'fileLoaded',
              content: new TextDecoder().decode(content),
              path: fileUri[0].fsPath
            });
          }
          break;

        case 'saveFile':
          if (message.filePath && message.content) {
            const uri = vscode.Uri.file(message.filePath);
            await vscode.workspace.fs.writeFile(uri, Buffer.from(message.content));
            vscode.window.showInformationMessage('File saved successfully');
          }
          break;

        case 'executeCode':
          await this.executeCodeInTerminal(message.code, message.language);
          break;

        case 'lintCode':
          // Trigger linting via language server
          break;
      }
    });
  }

  private async executeCodeInTerminal(code: string, language: string) {
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Vizual-X');
    terminal.show();
    terminal.sendText(`# Executing ${language} code`);
    terminal.sendText(code);
  }

  insertCode(code: string) {
    if (this.panel) {
      this.panel.webview.postMessage({
        command: 'insertCode',
        code: code
      });
    }
  }

  async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state: any
  ): Promise<void> {
    this.panel = webviewPanel;
    this.panel.webview.html = this.getWebviewContent();
    this.setupMessageHandlers();
  }
}
```

### 1.2 Update extension.ts with proper initialization
- Initialize provider before UI rendering
- Add keyboard shortcuts (Ctrl+Shift+M to open Monaco)
- Add watch file system integration

---

## PHASE 2: WEBVIEW FRONTEND (React + Monaco)

### 2.1 Create Webview Entry Point
**File:** `vscode-extension-kit/src/webview.tsx`

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MonacoEditorFrame } from './components/MonacoEditorFrame';

const root = createRoot(document.getElementById('root')!);

// Communication with extension
const vscode = (window as any).acquireVsCodeApi?.();

root.render(
  <MonacoEditorFrame vscode={vscode} />
);
```

### 2.2 Create MonacoEditorFrame Component
**Location:** `vscode-extension-kit/src/components/MonacoEditorFrame.tsx`

This component renders the full editor UI with:
- File tree on left
- Editor in center
- Problems/Output panel on right
- Linting indicators inline

---

## PHASE 3: BUILD & PACKAGING

### 3.1 Update package.json scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:extension": "tsc && vsce package",
    "build:webview": "vite build --outDir dist/webview",
    "package": "npm run build:extension && npm run build:webview",
    "test": "vitest"
  }
}
```

### 3.2 Create tsconfig for extension
**File:** `vscode-extension-kit/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.3 Create .vscodeignore
**File:** `vscode-extension-kit/.vscodeignore`

```
node_modules
**/*.map
**/*.ts
!**/*.d.ts
.git
git_config
out
**/*.test.js
**/.eslintrc.json
```

---

## PHASE 4: CLOUDFLARE TUNNEL INTEGRATION

### 4.1 Cloudflare Wrangler Configuration
**File:** `c:\AI\vizual-x-admin-control-plane\wrangler.toml`

```toml
name = "vizual-x-monaco-tunnel"
type = "javascript"
main = "src/index.ts"
compatibility_date = "2025-02-01"

[env.production]
name = "vizual-x-prod"
routes = [
  { pattern = "monaco.vizual-x.com", zone_name = "vizual-x.com" },
  { pattern = "api.vizual-x.com", zone_name = "vizual-x.com" }
]

[build]
command = "npm run build"
cwd = "./"

[env.production.deploy]
routes = [
  { pattern = "monaco.vizual-x.com", zone_id = "YOUR_ZONE_ID" }
]
```

### 4.2 Cloudflare Pages Configuration
**File:** `.github/workflows/deploy-cloudflare.yml`

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - run: npm install
      - run: npm run build
      - run: npm run build:extension
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: vizual-x-monaco
          directory: dist
```

### 4.3 Update Cloudflare DNS Records
```dns
; Add CNAME for Monaco editor
monaco.vizual-x.com.  1  IN  CNAME  vizual-x-896380409704.us-central1.run.app.

; Add web socket support
ws.vizual-x.com.  1  IN  CNAME  vizual-x-896380409704.us-central1.run.app.
```

---

## PHASE 5: GCP CLOUD RUN DEPLOYMENT

### 5.1 Create Dockerfile
**File:** `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy extension and frontend
COPY vscode-extension-kit ./extension
COPY . .

# Build all components
RUN npm install
RUN npm run build
RUN cd extension && npm install && npm run build

# Copy built files to serve directory
RUN mkdir -p /app/serve
RUN cp -r dist/* /app/serve/
RUN cp -r extension/dist/* /app/serve/

# Install serve
RUN npm install -g serve

EXPOSE 3000
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["npm", "run", "dev"]
```

### 5.2 GCP Cloud Run Deployment Config
**File:** `gcloud-deploy.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: vizual-x-monaco
  namespace: default
spec:
  type: LoadBalancer
  ports:
    - name: http
      port: 80
      targetPort: 3000
    - name: api
      port: 3001
      targetPort: 3001
  selector:
    app: vizual-x-monaco
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vizual-x-monaco-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vizual-x-monaco
  template:
    metadata:
      labels:
        app: vizual-x-monaco
    spec:
      containers:
      - name: monaco-editor
        image: gcr.io/quantum-x-builder/vizual-x-monaco:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### 5.3 Cloud Run Deploy Command
```bash
gcloud run deploy vizual-x-monaco \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --set-env-vars NODE_ENV=production
```

---

## PHASE 6: REAL-TIME SYNC & WEBSOCKETS

### 6.1 WebSocket Server Setup
**File:** `backend/src/websocket-server.ts`

```typescript
import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';

export class EditorWebSocketServer {
  private wss: WebSocket.Server;
  private clients: Set<WebSocket> = new Set();

  constructor(httpServer: HTTPServer) {
    this.wss = new WebSocket.Server({ server: httpServer });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`[WS] New client connected. Total: ${this.clients.size}`);

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(message, ws);
        } catch (err) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WS] Client disconnected. Total: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error(`[WS] Error:`, err);
      });
    });
  }

  private handleMessage(message: any, sender: WebSocket) {
    switch (message.type) {
      case 'file-update':
        this.broadcastExcept(sender, {
          type: 'file-updated',
          fileId: message.fileId,
          content: message.content,
          timestamp: Date.now()
        });
        break;

      case 'cursor-position':
        this.broadcastExcept(sender, {
          type: 'cursor-moved',
          userId: message.userId,
          line: message.line,
          column: message.column
        });
        break;

      case 'lint-result':
        this.broadcast({
          type: 'lint-issues',
          fileId: message.fileId,
          issues: message.issues
        });
        break;
    }
  }

  private broadcast(message: any) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private broadcastExcept(sender: WebSocket, message: any) {
    this.clients.forEach(client => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
```

### 6.2 Frontend WebSocket Integration
**File:** `components/MonacoEditor.tsx` (updated)

Add WebSocket connection handling for real-time updates.

---

## PHASE 7: DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All extension services initialized
- [ ] Monaco Editor Provider registered
- [ ] WebSocket server running
- [ ] Linting engine operational
- [ ] File system watchers active
- [ ] Tests passing (npm run test)
- [ ] Extension package ready (npm run package)

### Deployment Steps
- [ ] Build Docker image
- [ ] Deploy to GCP Cloud Run
- [ ] Configure Cloudflare tunnel
- [ ] Update DNS records
- [ ] Test Monaco editor access via mondaco.vizual-x.com
- [ ] Verify WebSocket connectivity
- [ ] VS Code extension installed and activated
- [ ] Real-time file sync working

### Post-Deployment
- [ ] Monitor Cloud Run logs
- [ ] Check Cloudflare analytics
- [ ] Verify extension telemetry
- [ ] Test edge cases (large files, slow connection)
- [ ] Performance profiling (p99 latency)
- [ ] Security audit (XSS, injections)

---

## QUICK START COMMANDS

```bash
# Local development
npm run dev

# Build everything
npm run build && npm run build:extension

# Package VS Code extension
npm run package

# Deploy to Cloudflare
wrangler publish

# Deploy to GCP Cloud Run
gcloud run deploy vizual-x-monaco --source .

# Access points
# - Local: http://localhost:3000
# - Extension: Open VS Code > Command Palette > "Open Vizual-X Monaco Editor"
# - Cloud: https://monaco.vizual-x.com
# - API: https://api.vizual-x.com
```

---

## INTEGRATION POINTS

1. **VS Code Extension** ↔ Webview Provider ↔ Monaco Editor Component
2. **Monaco Editor** ↔ WebSocket Server ↔ Real-time Sync
3. **Frontend** ↔ Cloudflare Tunnel ↔ GCP Cloud Run
4. **DNS** ↔ Cloudflare ↔ Cloud Run IP (34.98.120.255)

---

## SUCCESS METRICS

- ✅ Monaco editor opens in VS Code
- ✅ Files sync in real-time via WebSocket
- ✅ Linting provides instant feedback
- ✅ Accessible via monaco.vizual-x.com
- ✅ <100ms latency for file updates
- ✅ <200ms for linting results
- ✅ 99.9% uptime on Cloud Run

