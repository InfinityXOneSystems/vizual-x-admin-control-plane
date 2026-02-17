
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { User, ApiToken, FeatureFlag, FileData } from '../types';
import { MonacoEditor } from './MonacoEditor';

const SIGNUP_BACKEND_CODE = `
import { Router } from 'express';
import { db } from '../db';
import { User } from '../../../types';

const router = Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    await db.read();
    const user = db.data.users.find(u => u.email === email);
    if (!user || user.password !== password) return res.status(401).json({ success: false, message: 'Invalid operator credentials.' });

    res.json({ success: true, message: 'Authentication successful.' });
});

router.post('/signup', async (req, res) => {
    const { email, password, promoCode } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    await db.read();
    if (db.data.users.find(u => u.email === email)) return res.status(409).json({ success: false, message: 'Operator email already exists.' });

    const newUser: User = {
        id: (db.data.users.length + 1).toString(),
        name: email.split('@')[0],
        email,
        password, // In a real app, hash this!
        role: 'operator',
        status: 'active',
        lastActive: new Date().toISOString(),
        accessLevel: 'full',
    };

    if (promoCode) {
        const code = db.data.promoCodes.find(c => c.code === promoCode && c.usesLeft > 0 && new Date(c.expiresAt) > new Date());
        if (!code) return res.status(400).json({ success: false, message: 'Invalid or expired promo code.' });
        
        code.usesLeft--;
        newUser.promoCodeDetails = { id: code.id, code: code.code, type: code.type };

        if (code.type === 'timed_access') {
            newUser.accessLevel = 'trial';
            newUser.trialExpiresAt = new Date(Date.now() + code.value * 24 * 60 * 60 * 1000).toISOString();
        }
    }

    db.data.users.push(newUser);
    await db.write();
    res.status(201).json({ success: true, message: 'Account created successfully.' });
});

router.post('/demo', async (req, res) => {
    await db.read();
    const demoUser = db.data.users.find(u => u.accessLevel === 'demo');
    if (!demoUser) return res.status(500).json({ success: false, message: 'Demo environment not configured.' });
    // This is a simplified "login" for demo mode.
    res.json({ success: true, message: 'Demo access granted.' });
});

router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    await db.read();
    const userExists = db.data.users.some(u => u.email === email);
    
    // Simulate email sending logic
    console.log(\`[AUTH] Password reset requested for: \${email}. User exists: \${userExists}\`);
    
    // For security, always return a generic success message to prevent email enumeration.
    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
});

export default router;
`.trim();

const authCodeFile: FileData = {
  id: 'backend-auth-code',
  name: 'backend/src/api/auth.ts',
  language: 'typescript',
  content: SIGNUP_BACKEND_CODE
};

export const AdminDashboard: React.FC<{fullView?: boolean, load: number}> = ({ fullView, load }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'tokens' | 'flags' | 'health' | 'code'>('health');
  const [users, setUsers] = useState<User[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingFlagId, setTogglingFlagId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [u, t, f] = await Promise.all([
          ApiService.users.list(),
          ApiService.tokens.list(),
          ApiService.flags.list()
        ]);
        setUsers(u);
        setTokens(t);
        setFlags(f);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleFlag = async (id: string) => {
    setTogglingFlagId(id);
    try {
      const updated = await ApiService.flags.toggle(id);
      if (updated) {
        setFlags(prev => prev.map(f => f.id === id ? updated : f));
      }
    } catch (error) {
      console.error("Failed to toggle flag", error);
    } finally {
      setTogglingFlagId(null);
    }
  };

  const metrics = [
    { label: 'Bandwidth', value: `${(load * 0.42).toFixed(1)} GB/s`, trend: '+4%', color: 'text-blue-400' },
    { label: 'Agent Throughput', value: `${(load * 18).toFixed(0)} rps`, trend: 'Optimal', color: 'text-green-400' },
    { label: 'Latency', value: `${Math.max(2, (8 - load/20)).toFixed(0)}ms`, trend: '-1ms', color: 'text-cyan-400' },
    { label: 'Cluster Health', value: '100%', trend: 'Steady', color: 'text-green-500' }
  ];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#000000] p-8 lg:p-12 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Admin Plane</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-2 italic">Sovereign Governance Center</p>
          </div>
          <nav className="flex bg-[#05070A] p-1 rounded-2xl border border-white/10 shrink-0">
            {['health', 'users', 'tokens', 'flags', 'code'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'code' ? 'Code Viewer' : tab}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === 'health' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((m, i) => (
                <div key={i} className="p-8 bg-[#05070A] border border-white/5 rounded-[24px] hover:border-white/20 transition-all group relative overflow-hidden shadow-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 mb-6">{m.label}</p>
                  <p className={`text-3xl font-black italic tracking-tighter mb-2 ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] font-mono opacity-20 uppercase tracking-widest">{m.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-12 bg-[#05070A] border border-white/5 rounded-[40px] h-[400px] flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.05),transparent)] opacity-50"></div>
                 <div className="relative z-10 text-center space-y-4">
                    <span className="text-[100px] font-black italic opacity-5 leading-none">PULSE</span>
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-blue-400/30 italic">Cluster Node: PRIMARY-ALPHA</p>
                 </div>
              </div>
              <div className="p-10 bg-[#05070A] border border-white/5 rounded-[40px] space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Audit Log</h3>
                <div className="space-y-4 overflow-y-auto custom-scrollbar max-h-[300px]">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="text-[10px] border-b border-white/5 pb-3">
                      <span className="text-blue-400 font-mono">[{new Date().toLocaleTimeString()}]</span>
                      <span className="ml-3 opacity-40 uppercase tracking-tighter italic">Handshake validated for Node-X{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-10 bg-[#05070A] border border-white/5 rounded-[40px] animate-in slide-in-from-bottom-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.5em] opacity-20">
                    <th className="pb-8 pl-4">Operator</th>
                    <th className="pb-8">Access Role</th>
                    <th className="pb-8">Status</th>
                    <th className="pb-8">Last Handshake</th>
                    <th className="pb-8 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {users.map(user => (
                    <tr key={user.id} className="group hover:bg-white/[0.01]">
                      <td className="py-6 pl-4">
                        <p className="text-xs font-black italic">{user.name}</p>
                        <p className="text-[9px] opacity-20">{user.email}</p>
                      </td>
                      <td className="py-6">
                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full">{user.role}</span>
                      </td>
                      <td className="py-6">
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500">● {user.status}</span>
                      </td>
                      <td className="py-6 text-[10px] font-mono opacity-30">{new Date(user.lastActive).toLocaleString()}</td>
                      <td className="py-6 text-right pr-4">
                        <button className="text-[9px] font-black uppercase opacity-20 group-hover:opacity-100 hover:text-blue-400 transition-all">Edit Node</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'flags' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
            {flags.map(flag => (
              <div key={flag.id} className="p-10 bg-[#05070A] border border-white/5 rounded-[32px] space-y-8 group transition-all hover:border-blue-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-widest">{flag.name}</h4>
                    <p className="text-[10px] opacity-30 mt-2 uppercase tracking-tighter leading-relaxed">{flag.description}</p>
                  </div>
                   <div className="w-12 h-6 flex items-center justify-start">
                    {togglingFlagId === flag.id ? (
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                      <button
                        onClick={() => handleToggleFlag(flag.id)}
                        className={`w-12 h-6 rounded-full border border-white/10 transition-all flex items-center px-1 ${flag.enabled ? 'bg-blue-600/20' : 'bg-zinc-900'}`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-all ${flag.enabled ? 'bg-blue-400 translate-x-6' : 'bg-zinc-700 translate-x-0'}`}></div>
                      </button>
                    )}
                  </div>
                </div>
                <div className="pt-6 border-t border-white/[0.02] flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-10">
                  <span>Scope: Global</span>
                  <span>Circuit: Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="p-4 bg-[#05070A] border border-white/5 rounded-[40px] animate-in slide-in-from-bottom-4 h-[600px] flex flex-col">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Sovereign Code Viewer: Authentication</h3>
                <p className="text-xs opacity-40 mt-1">Displaying live backend logic for the operator signup process.</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <MonacoEditor 
                  activeFile={authCodeFile}
                  onContentChange={() => {}} 
                />
              </div>
          </div>
        )}
      </div>
    </div>
  );
};
