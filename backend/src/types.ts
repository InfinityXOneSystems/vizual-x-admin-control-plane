// Backend types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
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

export interface TestResult {
  id: string;
  suite: string;
  test: string;
  status: 'pass' | 'fail' | 'skipped';
  duration: number;
  evidence?: string;
}
