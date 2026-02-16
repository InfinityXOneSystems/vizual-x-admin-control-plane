
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { User, ApiToken, FeatureFlag, TestResult } from '../../types';

type AppData = {
  users: User[];
  tokens: ApiToken[];
  flags: FeatureFlag[];
  tests: TestResult[];
};

const defaultData: AppData = {
  users: [
    { id: '1', name: 'Master Operator', email: 'admin@vizual.x', role: 'admin', status: 'active', lastActive: new Date().toISOString() },
    { id: '2', name: 'Node Deployer', email: 'deploy@vizual.x', role: 'operator', status: 'active', lastActive: new Date().toISOString() }
  ],
  tokens: [
    { id: 'tk_1', name: 'Production Handshake', token: 'vix_live_492...', created: '2024-01-01', expires: '2025-01-01', lastUsed: '2 mins ago' }
  ],
  flags: [
    { id: 'f_1', name: 'Autonomous Compiler', description: 'Enable real-time LLM logic injection', enabled: true },
    { id: 'f_2', name: 'Quantum Sharding', description: 'Distribute workspace across multiple clusters', enabled: false }
  ],
  tests: [
    { id: 't1', suite: 'UI Architecture', test: 'Metallic Border Protocol', status: 'pass', duration: 12, evidence: 'Verified 0.5px thickness' },
    { id: 't2', suite: 'Backend Logic', test: 'Vault Encryption Handshake', status: 'pass', duration: 45 },
    { id: 't3', suite: 'E2E Flow', test: 'Natural Language Refactor', status: 'pass', duration: 1200 },
    { id: 't4', suite: 'Security', test: 'RBAC Enforcement', status: 'pass', duration: 5 }
  ]
};

const adapter = new JSONFile<AppData>('db.json');
export const db = new Low<AppData>(adapter, defaultData);

export const initializeDatabase = async () => {
  await db.read();
  db.data = db.data || defaultData;
  await db.write();
};
