
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

export interface RefactorSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'quality' | 'performance' | 'readability';
  refactoredCode: string;
}

export type AppView = 'chat' | 'settings' | 'admin' | 'preview' | 'pipeline';
export type Theme = 'light' | 'dark';
export type ActionStatus = 'perfect' | 'warning' | 'critical';
export type EditingMode = 'no-code' | 'low-code' | 'full-code';

export interface ProjectAction {
  id: string;
  timestamp: Date;
  description: string;
  type: 'code_injection' | 'file_delete' | 'setting_change' | 'rollback' | 'lint_fix' | 'autonomous_patch';
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

export interface SafetySettings {
  harassment: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';
  hateSpeech: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';
  sexuallyExplicit: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';
  dangerousContent: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';
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
  topP: number;
  topK: number;
  maxTokens: number;
  thinkingBudget: number;
  googleStudioFeatures: boolean;
  githubSparksEnabled: boolean;
  safety: SafetySettings;
  vertexEndpoint: 'us-central1' | 'europe-west1' | 'asia-northeast1';
  groundingEnabled: boolean;
  editingMode: EditingMode;
  autonomousAgentActive: boolean;
  parallelInstanceCount: number;
  hybridCloudSync: boolean;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp: Date;
  logs: string[];
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

export interface GitCommit {
  id: string;
  message: string;
  timestamp: Date;
  author: string;
  files: string[];
}
