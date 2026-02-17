
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import bcrypt from 'bcrypt';
import { User, ApiToken, FeatureFlag, TestResult, PromoCode } from '../../types';

const saltRounds = 10;

type AppData = {
  users: User[];
  tokens: ApiToken[];
  flags: FeatureFlag[];
  tests: TestResult[];
  promoCodes: PromoCode[];
};

const defaultData: AppData = {
  users: [
    { id: '1', name: 'Master Operator', email: 'admin@vizual.x', password: 'password', role: 'admin', status: 'active', lastActive: new Date().toISOString(), accessLevel: 'full' },
    { id: '2', name: 'Node Deployer', email: 'deploy@vizual.x', password: 'password', role: 'operator', status: 'active', lastActive: new Date().toISOString(), accessLevel: 'full' },
    { id: '3', name: 'Demo User', email: 'demo@vizual.x', password: 'password', role: 'viewer', status: 'active', lastActive: new Date().toISOString(), accessLevel: 'demo' }
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
  ],
  promoCodes: [
    { id: 'promo_1', code: 'VIXLAUNCH30', type: 'timed_access', value: 30, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), usesLeft: 100 },
    { id: 'promo_2', code: 'CREATORPASS', type: 'feature_limit', value: 0, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), usesLeft: 50, featureLimitations: ['creator'] }
  ]
};

declare const __dirname: string;

const dbPath = path.resolve(__dirname, '..', 'db.json');
const adapter = new JSONFile<AppData>(dbPath);
export const db = new Low<AppData>(adapter, defaultData);

export const initializeDatabase = async () => {
  await db.read();
  db.data = db.data || defaultData;
  if (!db.data.promoCodes) db.data.promoCodes = defaultData.promoCodes;
  
  // Ensure default users exist and hash their passwords if they are in plaintext
  if (db.data.users) {
      for (const user of db.data.users) {
          if (!user.accessLevel) user.accessLevel = user.email === 'demo@vizual.x' ? 'demo' : 'full';
          // Check if password is not already a hash (simple check)
          if (user.password && !user.password.startsWith('$2b$')) {
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            user.password = hashedPassword;
          }
      }
  }
  await db.write();
};
