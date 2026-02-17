
export type Theme = 'light' | 'dark';

export type PageNode = 
  | 'chat' | 'settings' | 'workspace' | 'admin' | 'dashboard' 
  | 'vault' | 'editor' | 'validation' | 'infra' | 'git' | 'creator' | 'vscode';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
}

export interface UIConfiguration {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontSizeBase: number;
  fontFamily: 'Inter' | 'Fira Code' | 'system-ui' | 'serif';
  enabledModules: string[];
  logoUrl?: string;
  editorConfig: {
    minimap: boolean;
    lineNumbers: 'on' | 'off';
    wordWrap: 'on' | 'off';
    bracketPairColorization: boolean;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
    auditLevel: 'low' | 'high' | 'paranoid';
  };
}

export type Industry = 'Construction' | 'Real Estate' | 'Crypto' | 'AI Tech' | 'GitHub OS' | 'Stats' | 'Code Tech' | 'News' | 'Shadow Scrape' | 'Market Signals';

export interface Agent {
  id: string;
  name: string;
  industry: string;
  role: string;
  status: 'idle' | 'active' | 'busy' | 'syncing';
  capabilities: string[];
  description: string;
  avatarColor: string;
  lastUpdate: string;
  logs: string[];
  load: number;
  intelligenceScore: number;
  recursiveProgress: number;
  learnedNodes: number;
  task?: string;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: Date;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  type: 'container' | 'terraform' | 'cloud_run' | 'pubsub';
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  load: number;
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  timestamp: Date;
  files: string[];
}

export interface FileData {
  id: string;
  name: string;
  language: string;
  content: string;
}

export interface TestResult {
  id: string;
  suite: string;
  test: string;
  status: 'pass' | 'fail' | 'skipped';
  duration: number;
  evidence?: string;
}

export interface LintIssue {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface Connector {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending' | 'validating' | 'linked' | 'idle' | 'syncing' | 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'VALIDATING';
  latency: string;
  category: string;
  icon: string;
  lastSynced?: Date;
  details?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
}

export type CreatorTool = 'ui' | 'image' | 'video' | 'business' | 'builder' | 'financial' | 'creative';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
}

export interface TaskResult {
  id: string;
  status: string;
  result: string;
}

export interface SystemUpdate {
  id?: string;
  timestamp: Date;
  description: string;
  type: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  created: string;
  expires: string;
  lastUsed: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Authentication Types
export interface AuthResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'operator';
}

export interface GoogleAIConfig {
  apiKey: string;
  projectId?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
