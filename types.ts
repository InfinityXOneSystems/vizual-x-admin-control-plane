
export interface MediaItem {
  type: 'image' | 'video' | 'audio';
  url: string;
  data?: string;
  mimeType?: string;
}

export interface TaskResult {
  id: string;
  agentName: string;
  startTime: string;
  endTime: string;
  summary: string;
  link: string;
  status: 'complete' | 'active' | 'scheduled';
}

export interface Recommendation {
  id: string;
  source: string;
  title: string;
  prediction: string;
  confidence: number;
  action: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  agentId?: string; 
  content: string;
  timestamp: Date;
  actionId?: string;
  media?: MediaItem;
}

export type Industry = 'Construction' | 'Real Estate' | 'Crypto' | 'AI Tech' | 'GitHub OS' | 'Stats' | 'Code Tech' | 'News' | 'Shadow Scrape' | 'Market Signals';

export interface Agent {
  id: string;
  name: string;
  industry: Industry | 'Executive';
  role: string;
  status: 'active' | 'idle' | 'executing';
  capabilities: ('browser' | 'github' | 'workspace' | 'vscode' | 'docker' | 'mcp')[];
  description: string;
  avatarColor: string;
  lastUpdate: string;
  recentResult?: TaskResult;
}

export interface Connector {
  id: string;
  name: string;
  category: 'workspace' | 'dev' | 'cloud' | 'llm';
  status: 'connected' | 'disconnected';
  icon: string;
}

export interface FileData {
  id: string;
  name: string;
  language: string;
  content: string;
}

// Added missing CreatorTool variants and export missing interfaces
export type CreatorTool = 'editor' | 'builder' | 'workspace' | 'intelligence' | 'ui' | 'video' | 'image' | 'music' | 'business' | 'browser';

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
}

export interface GitCommit {
  id: string;
  message: string;
  timestamp: Date | string | number;
  author: string;
  files: string[];
}

export type Theme = 'light' | 'dark';

export interface AppSettings {
  theme: Theme;
  userName: string;
  connectors: Connector[];
  aiModel: string;
}