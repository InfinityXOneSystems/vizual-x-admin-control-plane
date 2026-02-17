import fs from 'fs';
import path from 'path';

interface CloudRunService {
  name: string;
  status: string;
  url?: string;
  region?: string;
}

interface PubSubTopic {
  name: string;
  labels?: Record<string, string>;
}

interface EnabledAPI {
  name: string;
  title: string;
  state: string;
}

interface DockerContainer {
  name: string;
  image: string;
  status: string;
}

interface OllamaModel {
  name: string;
  size?: string;
}

interface CloudResources {
  cloudRunServices: CloudRunService[];
  pubSubTopics: PubSubTopic[];
  enabledAPIs: EnabledAPI[];
}

interface LocalResources {
  dockerContainers: DockerContainer[];
  ollamaModels: OllamaModel[];
}

interface SystemHealth {
  score: number;
  status: 'healthy' | 'degraded' | 'critical';
  cloudRunCount: number;
  pubSubCount: number;
  apiCount: number;
  dockerCount: number;
  ollamaCount: number;
}

export class InventoryService {
  private readinessPath: string;

  constructor() {
    // Path to readiness directory from backend root
    this.readinessPath = path.join(__dirname, '..', '..', '..', 'readiness');
  }

  /**
   * Find the most recent GCP audit directory
   */
  private findLatestGCPAudit(): string | null {
    try {
      if (!fs.existsSync(this.readinessPath)) {
        console.warn('[InventoryService] Readiness directory not found:', this.readinessPath);
        return null;
      }

      const entries = fs.readdirSync(this.readinessPath, { withFileTypes: true });
      const gcpDirs = entries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('gcp_audit_'))
        .map(entry => entry.name)
        .sort()
        .reverse();

      return gcpDirs.length > 0 ? gcpDirs[0] : null;
    } catch (error) {
      console.error('[InventoryService] Error finding GCP audit:', error);
      return null;
    }
  }

  /**
   * Find the most recent local audit directory
   */
  private findLatestLocalAudit(): string | null {
    try {
      if (!fs.existsSync(this.readinessPath)) {
        return null;
      }

      const entries = fs.readdirSync(this.readinessPath, { withFileTypes: true });
      const localDirs = entries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('local_audit_'))
        .map(entry => entry.name)
        .sort()
        .reverse();

      return localDirs.length > 0 ? localDirs[0] : null;
    } catch (error) {
      console.error('[InventoryService] Error finding local audit:', error);
      return null;
    }
  }

  /**
   * Parse GCP inventory and return cloud resources
   */
  public getCloudResources(): CloudResources {
    const gcpDir = this.findLatestGCPAudit();
    const defaultResources: CloudResources = {
      cloudRunServices: [],
      pubSubTopics: [],
      enabledAPIs: []
    };

    if (!gcpDir) {
      console.warn('[InventoryService] No GCP audit found');
      return defaultResources;
    }

    try {
      const gcpInventoryPath = path.join(this.readinessPath, gcpDir, 'gcp_inventory_full.json');
      
      if (!fs.existsSync(gcpInventoryPath)) {
        console.warn('[InventoryService] GCP inventory file not found:', gcpInventoryPath);
        return defaultResources;
      }

      const rawData = fs.readFileSync(gcpInventoryPath, 'utf-8');
      // Remove BOM if present
      const cleanData = rawData.replace(/^\uFEFF/, '');
      const gcpData = JSON.parse(cleanData);

      // Extract Cloud Run services
      const cloudRunServices: CloudRunService[] = [];
      if (gcpData.Inventory?.CloudRun?.value) {
        for (const service of gcpData.Inventory.CloudRun.value) {
          cloudRunServices.push({
            name: service.metadata?.name || 'unknown',
            status: service.status?.conditions?.[0]?.status || 'unknown',
            url: service.status?.url || undefined,
            region: service.metadata?.labels?.['cloud.googleapis.com/location'] || undefined
          });
        }
      }

      // Extract Pub/Sub topics
      const pubSubTopics: PubSubTopic[] = [];
      if (gcpData.Inventory?.PubSub?.value) {
        for (const topic of gcpData.Inventory.PubSub.value) {
          pubSubTopics.push({
            name: topic.name || 'unknown',
            labels: topic.labels || undefined
          });
        }
      }

      // Extract enabled APIs
      const enabledAPIs: EnabledAPI[] = [];
      if (gcpData.Inventory?.APIs?.value) {
        for (const api of gcpData.Inventory.APIs.value) {
          enabledAPIs.push({
            name: api.config?.name || api.name || 'unknown',
            title: api.config?.title || 'Unknown API',
            state: api.state || 'UNKNOWN'
          });
        }
      }

      return {
        cloudRunServices,
        pubSubTopics,
        enabledAPIs
      };
    } catch (error) {
      console.error('[InventoryService] Error parsing GCP inventory:', error);
      return defaultResources;
    }
  }

  /**
   * Parse local system audit and return local resources
   */
  public getLocalResources(): LocalResources {
    const localDir = this.findLatestLocalAudit();
    const defaultResources: LocalResources = {
      dockerContainers: [],
      ollamaModels: []
    };

    if (!localDir) {
      console.warn('[InventoryService] No local audit found');
      return defaultResources;
    }

    try {
      const localAuditPath = path.join(this.readinessPath, localDir);

      // Parse Docker containers
      const dockerContainers: DockerContainer[] = [];
      const dockerContainersPath = path.join(localAuditPath, 'docker_containers.txt');
      if (fs.existsSync(dockerContainersPath)) {
        try {
          // Try UTF-16LE first (common for Windows PowerShell output)
          let dockerData = fs.readFileSync(dockerContainersPath, 'utf16le');
          
          // If the file doesn't start with expected characters, try UTF-8
          if (!dockerData.includes('NAME') && !dockerData.includes('CONTAINER')) {
            dockerData = fs.readFileSync(dockerContainersPath, 'utf-8');
          }
          
          // Parse the docker ps output (skip header, process lines)
          const lines = dockerData.split('\n').filter(line => line.trim());
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            // Basic parsing - Docker output format may vary
            const parts = line.split(/\s{2,}/);
            if (parts.length >= 2) {
              dockerContainers.push({
                name: parts[0]?.trim() || 'unknown',
                image: parts[1]?.trim() || 'unknown',
                status: parts[2]?.trim() || 'unknown'
              });
            }
          }
        } catch (error) {
          console.error('[InventoryService] Error parsing Docker containers:', error);
        }
      }

      // Parse Ollama models
      const ollamaModels: OllamaModel[] = [];
      const ollamaModelsPath = path.join(localAuditPath, 'ollama_models.txt');
      if (fs.existsSync(ollamaModelsPath)) {
        const ollamaData = fs.readFileSync(ollamaModelsPath, 'utf-8');
        const lines = ollamaData.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line && !line.startsWith('NAME')) {
            const parts = line.split(/\s+/);
            if (parts.length >= 1) {
              ollamaModels.push({
                name: parts[0] || 'unknown',
                size: parts[1] || undefined
              });
            }
          }
        }
      }

      return {
        dockerContainers,
        ollamaModels
      };
    } catch (error) {
      console.error('[InventoryService] Error parsing local audit:', error);
      return defaultResources;
    }
  }

  /**
   * Calculate system health based on available resources
   */
  public getSystemHealth(): SystemHealth {
    const cloudResources = this.getCloudResources();
    const localResources = this.getLocalResources();

    const cloudRunCount = cloudResources.cloudRunServices.length;
    const pubSubCount = cloudResources.pubSubTopics.length;
    const apiCount = cloudResources.enabledAPIs.length;
    const dockerCount = localResources.dockerContainers.length;
    const ollamaCount = localResources.ollamaModels.length;

    // Calculate health score (0-100)
    let score = 0;
    
    // Cloud resources contribute to score
    if (cloudRunCount > 0) score += 20;
    if (pubSubCount > 0) score += 15;
    if (apiCount > 0) score += 15;
    
    // Local resources contribute to score
    if (dockerCount > 0) score += 25;
    if (ollamaCount > 0) score += 25;

    // Determine status based on score
    let status: 'healthy' | 'degraded' | 'critical';
    if (score >= 75) {
      status = 'healthy';
    } else if (score >= 40) {
      status = 'degraded';
    } else {
      status = 'critical';
    }

    return {
      score,
      status,
      cloudRunCount,
      pubSubCount,
      apiCount,
      dockerCount,
      ollamaCount
    };
  }
}
