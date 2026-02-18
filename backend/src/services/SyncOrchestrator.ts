/**
 * Sync Orchestrator Service
 * Manages synchronization status and triggers sync operations across the Vizual-X ecosystem
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface SyncStatus {
  component: 'git' | 'docker' | 'gcp' | 'cloudflare' | 'workspace';
  status: 'synced' | 'syncing' | 'error' | 'unknown';
  lastSync: string | null;
  message: string;
}

export interface SyncState {
  git: SyncStatus;
  docker: SyncStatus;
  gcp: SyncStatus;
  cloudflare: SyncStatus;
  workspace: SyncStatus;
  lastFullSync: string | null;
}

class SyncOrchestratorService {
  private syncState: SyncState;
  private syncProcess: ChildProcess | null = null;
  private isWatching: boolean = false;

  constructor() {
    this.syncState = {
      git: { component: 'git', status: 'unknown', lastSync: null, message: 'Not yet synced' },
      docker: { component: 'docker', status: 'unknown', lastSync: null, message: 'Not yet synced' },
      gcp: { component: 'gcp', status: 'unknown', lastSync: null, message: 'Not yet synced' },
      cloudflare: { component: 'cloudflare', status: 'unknown', lastSync: null, message: 'Not yet synced' },
      workspace: { component: 'workspace', status: 'unknown', lastSync: null, message: 'Not yet synced' },
      lastFullSync: null
    };
  }

  /**
   * Get current sync status for all components
   */
  getStatus(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Trigger a sync operation
   * @param watch - If true, runs in watch mode (continuous)
   * @returns Promise that resolves when sync is triggered (not completed)
   */
  async triggerSync(watch: boolean = false): Promise<{ success: boolean; message: string }> {
    if (this.syncProcess) {
      return { success: false, message: 'Sync already in progress' };
    }

    try {
      const scriptPath = this.getScriptPath();
      
      if (!fs.existsSync(scriptPath)) {
        return { 
          success: false, 
          message: `Sync script not found at ${scriptPath}. Please ensure infinity-sync script is present.` 
        };
      }

      // Update all components to syncing status
      this.updateAllComponentsStatus('syncing', 'Sync operation initiated');

      const args = watch ? ['--watch'] : [];
      
      // Determine shell based on platform
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'powershell.exe' : '/bin/bash';
      const scriptArgs = isWindows ? ['-File', scriptPath, ...args] : [scriptPath, ...args];

      this.syncProcess = spawn(shell, scriptArgs, {
        cwd: path.dirname(scriptPath),
        detached: false,
        stdio: 'pipe'
      });

      this.isWatching = watch;

      // Handle stdout
      this.syncProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        this.parseAndUpdateStatus(output);
      });

      // Handle stderr
      this.syncProcess.stderr?.on('data', (data) => {
        console.error(`[SyncOrchestrator] Error: ${data.toString()}`);
      });

      // Handle process exit
      this.syncProcess.on('close', (code) => {
        console.log(`[SyncOrchestrator] Sync process exited with code ${code}`);
        this.syncProcess = null;
        this.isWatching = false;

        if (code === 0) {
          this.updateAllComponentsStatus('synced', 'Sync completed successfully');
          this.syncState.lastFullSync = new Date().toISOString();
        } else {
          this.updateAllComponentsStatus('error', `Sync failed with exit code ${code}`);
        }
      });

      return { 
        success: true, 
        message: watch ? 'Sync started in watch mode' : 'Sync operation triggered' 
      };

    } catch (error) {
      this.updateAllComponentsStatus('error', 'Failed to start sync process');
      return { 
        success: false, 
        message: `Failed to trigger sync: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Stop the watch mode sync process
   */
  async stopSync(): Promise<{ success: boolean; message: string }> {
    if (!this.syncProcess) {
      return { success: false, message: 'No sync process running' };
    }

    try {
      this.syncProcess.kill('SIGTERM');
      this.syncProcess = null;
      this.isWatching = false;
      return { success: true, message: 'Sync process stopped' };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to stop sync: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Check if sync is currently running
   */
  isSyncing(): boolean {
    return this.syncProcess !== null;
  }

  /**
   * Check if watch mode is active
   */
  isInWatchMode(): boolean {
    return this.isWatching;
  }

  /**
   * Get the appropriate sync script path based on platform
   */
  private getScriptPath(): string {
    const rootDir = path.resolve(__dirname, '../../..');
    const isWindows = process.platform === 'win32';
    const scriptName = isWindows ? 'infinity-sync.ps1' : 'infinity-sync.sh';
    return path.join(rootDir, 'scripts', scriptName);
  }

  /**
   * Update all components to a specific status
   */
  private updateAllComponentsStatus(status: SyncStatus['status'], message: string): void {
    const timestamp = new Date().toISOString();
    const components: Array<keyof Omit<SyncState, 'lastFullSync'>> = ['git', 'docker', 'gcp', 'cloudflare', 'workspace'];
    
    components.forEach(comp => {
      this.syncState[comp].status = status;
      this.syncState[comp].message = message;
      if (status === 'synced') {
        this.syncState[comp].lastSync = timestamp;
      }
    });
  }

  /**
   * Parse sync script output and update component status
   */
  private parseAndUpdateStatus(output: string): void {
    const lines = output.split('\n');
    
    lines.forEach(line => {
      // Look for component-specific status updates
      // Format: [COMPONENT_NAME] Status: message
      const match = line.match(/\[(GIT|DOCKER|GCP|CLOUDFLARE|WORKSPACE)\]\s+(✓|✗|⟳)\s+(.+)/i);
      
      if (match) {
        const component = match[1].toLowerCase() as keyof Omit<SyncState, 'lastFullSync'>;
        const statusSymbol = match[2];
        const message = match[3].trim();
        
        if (this.syncState[component]) {
          if (statusSymbol === '✓') {
            this.syncState[component].status = 'synced';
            this.syncState[component].lastSync = new Date().toISOString();
          } else if (statusSymbol === '✗') {
            this.syncState[component].status = 'error';
          } else if (statusSymbol === '⟳') {
            this.syncState[component].status = 'syncing';
          }
          
          this.syncState[component].message = message;
        }
      }
    });
  }
}

// Singleton instance
export const syncOrchestrator = new SyncOrchestratorService();
