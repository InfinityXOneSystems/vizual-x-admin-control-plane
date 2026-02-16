import * as vscode from 'vscode';
import axios from 'axios';

interface LLMProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency: number;
  models: string[];
}

export class LLMProviderManager {
  private context: vscode.ExtensionContext;
  private providers: Map<string, LLMProvider> = new Map();
  private statusBar: vscode.StatusBarItem;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBar.text = '$(pulse) Vizual-X: Initializing...';
    this.statusBar.show();
  }

  async initialize(): Promise<void> {
    const config = vscode.workspace.getConfiguration('vizual-x');
    
    // Initialize Ollama (Primary - Local)
    const ollamaEndpoint = config.get<string>(
      'ollamaEndpoint',
      'http://localhost:11434'
    );
    this.providers.set('ollama', {
      name: 'Ollama',
      endpoint: ollamaEndpoint,
      status: 'unknown',
      latency: 0,
      models: []
    });

    // Initialize Groq (Secondary - Cloud Fast)
    const groqKey = config.get<string>('groqApiKey', '');
    if (groqKey) {
      this.providers.set('groq', {
        name: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
        status: 'unknown',
        latency: 0,
        models: ['mixtral-8x7b', 'llama2-70b-chat']
      });
    }

    // Initialize Vertex AI (Tertiary - Enterprise)
    const vertexProjectId = config.get<string>('vertexAiProjectId', '');
    if (vertexProjectId) {
      this.providers.set('vertex-ai', {
        name: 'Vertex AI',
        endpoint: `https://us-central1-aiplatform.googleapis.com/v1/projects/${vertexProjectId}`,
        status: 'unknown',
        latency: 0,
        models: ['gemini-pro', 'text-bison']
      });
    }

    // Start health checks
    this.startHealthChecks();
    
    // Initial health check
    await this.checkAllProviders();
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllProviders();
    }, 30000); // Every 30 seconds
  }

  async checkAllProviders(): Promise<void> {
    for (const [key, provider] of this.providers) {
      await this.checkProviderHealth(key, provider);
    }
    this.updateStatusBar();
  }

  private async checkProviderHealth(
    key: string,
    provider: LLMProvider
  ): Promise<void> {
    try {
      const startTime = Date.now();
      
      if (key === 'ollama') {
        await axios.get(`${provider.endpoint}/api/tags`, { timeout: 5000 });
      } else if (key === 'groq') {
        await axios.get('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${provider.apiKey}` },
          timeout: 5000
        });
      } else if (key === 'vertex-ai') {
        // Vertex AI health check via GCP
        await axios.get(`${provider.endpoint}/locations/us-central1/models`, {
          timeout: 5000
        });
      }

      provider.status = 'healthy';
      provider.latency = Date.now() - startTime;
    } catch (error) {
      provider.status = 'unhealthy';
      provider.latency = -1;
    }
  }

  private updateStatusBar(): void {
    const healthy = Array.from(this.providers.values()).filter(
      p => p.status === 'healthy'
    ).length;
    const total = this.providers.size;

    this.statusBar.text = `$(pulse) Vizual-X: ${healthy}/${total} LLM providers ready`;
    this.statusBar.command = 'vizual-x.initLLMProviders';
  }

  /**
   * Intelligent LLM Provider Routing
   * Returns the best available provider based on task requirements
   */
  async getOptimalProvider(options?: {
    preferLocal?: boolean;
    requireContext?: number;
    requestType?: 'fast' | 'accurate' | 'balanced';
  }): Promise<LLMProvider | null> {
    const healthyProviders = Array.from(this.providers.values()).filter(
      p => p.status === 'healthy'
    );

    if (healthyProviders.length === 0) {
      return null;
    }

    const requestType = options?.requestType || 'balanced';
    const preferLocal = options?.preferLocal ?? true;

    if (requestType === 'fast') {
      // Groq is fastest (5-50ms)
      const groq = this.providers.get('groq');
      if (groq?.status === 'healthy') return groq;
    }

    if (preferLocal) {
      // Prefer local Ollama
      const ollama = this.providers.get('ollama');
      if (ollama?.status === 'healthy') return ollama;
    }

    // Fall through to available providers
    return healthyProviders.sort((a, b) => a.latency - b.latency)[0];
  }

  async reinitialize(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    await this.initialize();
  }

  getProviders(): Map<string, LLMProvider> {
    return this.providers;
  }

  dispose(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.statusBar.dispose();
  }
}
