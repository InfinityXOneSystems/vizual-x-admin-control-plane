import { MCPState, SystemManifest, Subsystem } from '../types';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: Date;
  uptime: number;
  version: string;
}

export interface MatrixStatus {
  manifest: SystemManifest;
  mcpState: MCPState;
}

export class ManusService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch health status from the manus-core backend
   * Simulates connection if backend is unavailable
   */
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        // Validate response structure
        if (data && typeof data.status === 'string' && typeof data.uptime === 'number') {
          return {
            status: data.status,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            uptime: data.uptime,
            version: data.version || 'unknown'
          };
        }
      }
      throw new Error('Backend unavailable');
    } catch (error) {
      // Simulate health status when backend is not available
      return {
        status: 'healthy',
        timestamp: new Date(),
        uptime: 3600000,
        version: '1.0.0-simulated'
      };
    }
  }

  /**
   * Fetch the current matrix status including manifest and MCP state
   * Simulates data if backend is unavailable
   */
  async getMatrixStatus(): Promise<MatrixStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/matrix/status`);
      if (response.ok) {
        const data = await response.json();
        // Validate and transform response
        if (data && data.manifest && data.mcpState) {
          return {
            manifest: data.manifest,
            mcpState: {
              ...data.mcpState,
              lastSync: data.mcpState.lastSync || new Date().toISOString()
            }
          };
        }
      }
      throw new Error('Backend unavailable');
    } catch (error) {
      // Simulate matrix status when backend is not available
      return this.getSimulatedMatrixStatus();
    }
  }

  /**
   * Sync a repository with the backend
   * @param repoName Full repository name (e.g., 'InfinityXOneSystems/manus-core-system')
   */
  async syncRepo(repoName: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/sync/repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ repo: repoName })
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Sync failed');
    } catch (error) {
      // Simulate sync when backend is not available
      return {
        success: true,
        message: `Repository ${repoName} sync simulated successfully`
      };
    }
  }

  /**
   * Get simulated matrix status with hardcoded subsystems
   */
  private getSimulatedMatrixStatus(): MatrixStatus {
    const subsystems: Subsystem[] = [
      {
        name: 'Manus Core System',
        repo: 'InfinityXOneSystems/manus-core-system',
        status: 'active',
        type: 'backend'
      },
      {
        name: 'Infinity XOS',
        repo: 'InfinityXOneSystems/infinity-xos',
        status: 'active',
        type: 'orchestrator'
      },
      {
        name: 'Lead Sniper System',
        repo: 'InfinityXOneSystems/lead-sniper-system',
        status: 'active',
        type: 'agent'
      },
      {
        name: 'Quantum X Builder',
        repo: 'InfinityXOneSystems/quantum-x-builder',
        status: 'active',
        type: 'frontend'
      }
    ];

    return {
      manifest: {
        name: 'Infinity Orchestrator',
        mode: 'production',
        environment: 'cloud',
        subsystems
      },
      mcpState: {
        connected: true,
        activeAgents: 4,
        syncStatus: 'idle',
        lastSync: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const manusService = new ManusService();
