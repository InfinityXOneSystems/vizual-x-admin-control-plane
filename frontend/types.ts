
export type ModalityType = 'text' | 'image' | 'video' | 'audio' | 'grounding' | 'thinking' | 'ui_update' | 'video_gen';
export type OperatingMode = 'autonomous' | 'hybrid' | 'manual';

export interface UITheme {
  primaryColor: string;
  sidebarBg: string;
  mainBg: string;
  fontFamily: string;
  borderRadius: string;
  logoText: string;
  accentGradient: string;
  baseFontSize: string;
  containerShadow?: string;
  glowEffect?: boolean;
}

export interface AgentCapabilities {
  logicSynthesis: boolean;
  autoRefinement: boolean;
  memoryInjection: boolean;
  selfCorrection: boolean;
  codeGeneration: boolean;
  visualOptimization: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: ModalityType;
  mediaUrl?: string;
  mediaType?: string;
  groundingLinks?: Array<{uri: string, title: string}>;
  timestamp: Date;
  themeUpdate?: Partial<UITheme>;
}

export interface ProjectState {
  vision: string;
  strategy: string;
  frontendDocs: string;
  backendDocs: string;
  todoList: string[];
  phases: Array<{ name: string; status: 'complete' | 'active' | 'pending' }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  projectData?: ProjectState;
}

export interface GenerationConfig {
  model: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9" | "2:3" | "3:2";
  imageSize?: "1K" | "2K" | "4K";
  grounding?: 'search' | 'maps';
  useThinking?: boolean;
  isImageEditing?: boolean;
  isVideoUnderstanding?: boolean;
}

export interface SyncState {
  github: boolean;
  googleCloud: boolean;
  google: boolean;
  vscode: boolean;
  mcp: boolean;
}

export interface SimulationData {
  id: string;
  title: string;
  description: string;
  metric: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}
