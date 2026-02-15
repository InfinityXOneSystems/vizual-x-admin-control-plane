
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionId?: string;
  media?: MediaItem;
  thinking?: string;
  sources?: { title: string; url: string }[];
}

export interface MediaItem {
  type: 'image' | 'video' | 'audio';
  url: string;
  mimeType?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  icon: string;
}

export interface FileData {
  id: string;
  name: string;
  language: string;
  content: string;
}

export type AppView = 'chat' | 'settings' | 'admin';
export type Theme = 'light' | 'dark';
export type ActionStatus = 'perfect' | 'warning' | 'critical';

export interface ProjectAction {
  id: string;
  timestamp: Date;
  description: string;
  type: 'code_injection' | 'file_delete' | 'setting_change' | 'rollback' | 'lint_fix';
  filesSnapshot: FileData[];
  status: ActionStatus;
  isLocked: boolean;
  codeSnippet?: string;
  fixSuggestion?: string;
  enhancementSuggestion?: string;
}

export interface CloudRunService {
  id: string;
  name: string;
  status: 'READY' | 'DEPLOYING' | 'FAILED';
  traffic: number;
  location: string;
  lastDeployed: Date;
  type: 'core' | 'ingestion' | 'scraper' | 'media' | 'trading' | 'builder';
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited' | 'restarting';
  ports: string;
}

export interface Connector {
  id: string;
  name: string;
  type: 'github' | 'google' | 'auth' | 'service';
  status: 'connected' | 'disconnected' | 'pending';
  lastSynced?: Date;
  icon?: string;
}

export interface AppSettings {
  theme: Theme;
  userName: string;
  connectors: Connector[];
  autoLint: boolean;
  sandboxMode: boolean;
  advancedSecurity: boolean;
  aiModel: string;
  temperature: number;
  maxTokens: number;
  googleStudioFeatures: boolean;
  githubSparksEnabled: boolean;
}

export interface AIRecommendation {
  id: string;
  text: string;
  priority: 'low' | 'high';
}

export interface AdminMetrics {
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number;
  activeDeployments: number;
  globalTraffic: number;
  serverlessExecutionCount: number;
}

// Added GitCommit interface to fix missing export error in GitPanel.tsx
export interface GitCommit {
  id: string;
  message: string;
  timestamp: Date;
  author: string;
  files: string[];
}
