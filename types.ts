
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionId?: string; 
}

export interface FileData {
  id: string;
  name: string;
  language: string;
  content: string;
}

export type AppView = 'chat' | 'settings' | 'admin';
export type Theme = 'light' | 'dark';
export type EditMode = 'full' | 'low' | 'no';
export type ActionStatus = 'perfect' | 'warning' | 'critical';

export interface ProjectAction {
  id: string;
  timestamp: Date;
  description: string;
  type: 'code_injection' | 'file_delete' | 'setting_change' | 'rollback' | 'lint_fix';
  filesSnapshot: FileData[];
  status: ActionStatus;
  isLocked: boolean;
  lintingReport?: string;
  codeSnippet?: string; // For the sandbox card
  fixSuggestion?: string;
  enhancementSuggestion?: string;
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
}

// Added GitCommit interface to resolve build error in GitPanel.tsx where it was being imported but not exported here
export interface GitCommit {
  id: string;
  message: string;
  timestamp: Date;
  author: string;
  files: string[];
}
