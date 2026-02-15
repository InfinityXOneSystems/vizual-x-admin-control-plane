export type Theme = 'light' | 'dark';

export interface MediaItem {
  type: 'image' | 'video' | 'audio';
  url: string;
  data?: string;
  mimeType?: string;
}

export interface ROIAnalysis {
  roi: string;
  riskLevel: 'low' | 'medium' | 'high';
  easeOfImplementation: number; // 1-100
  speedEstimate: string;
  horizon: 'short' | 'mid' | 'long';
  recommendation: string;
}

export interface TaskResult {
  id: string;
  agentName: string;
  startTime: string;
  endTime: string;
  summary: string;
  link: string;
  status: 'complete' | 'active' | 'scheduled';
  analysis?: ROIAnalysis;
}

export interface Recommendation {
  id: string;
  source: string;
  title: string;
  prediction: string;
  confidence: number;
  action: string;
  priority: number; // 1-10
}

export interface SystemUpdate {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  type: 'update' | 'billing' | 'performance' | 'security';
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

export interface UIConfiguration {
  primaryColor: string;
  accentColor: string;
  fontSizeBase: number;
  glassOpacity: number;
  neonIntensity: number;
}

export type CreatorTool = 'editor' | 'builder' | 'workspace' | 'intelligence' | 'systems' | 'ui' | 'video' | 'image' | 'music' | 'business' | 'browser' | 'vault';

export interface FileData {
  id: string;
  name: string;
  language: string;
  content: string;
}

export interface AppSettings {
  theme: Theme;
  userName: string;
  connectors: any[];
  aiModel: string;
  ui: UIConfiguration;
}

export interface Connector {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected';
  icon: string;
  details: string;
  lastSynced: Date;
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  timestamp: string | Date;
  files: string[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
}