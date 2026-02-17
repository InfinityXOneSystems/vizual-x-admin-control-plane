
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { User, ApiToken, FeatureFlag, GodModeStatus, RefactorResult } from '../types';

export const AdminDashboard: React.FC<{fullView?: boolean, load: number}> = ({ fullView, load }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'tokens' | 'flags' | 'health' | 'godmode'>('health');
  const [users, setUsers] = useState<User[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [godModeStatus, setGodModeStatus] = useState<GodModeStatus | null>(null);
  const [refactorTarget, setRefactorTarget] = useState('');
  const [refactorResult, setRefactorResult] = useState<RefactorResult | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [u, t, f, gm] = await Promise.all([
        ApiService.users.list(),
        ApiService.tokens.list(),
        ApiService.flags.list(),
        ApiService.refactor.getStatus()
      ]);
      setUsers(u);
      setTokens(t);
      setFlags(f);
      setGodModeStatus(gm);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleToggleFlag = async (id: string) => {
    const updated = await ApiService.flags.toggle(id);
    setFlags(prev => prev.map(f => f.id === id ? updated! : f));
  };

  const validateRepositoryFormat = (target: string): boolean => {
    // Validate format: owner/repository
    const repoRegex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
    return repoRegex.test(target);
  };

  const handleAuditRepo = async () => {
    const trimmedTarget = refactorTarget.trim();
    if (!trimmedTarget || !validateRepositoryFormat(trimmedTarget)) {
      setRefactorResult({
        action: 'validation_failed',
        target: trimmedTarget,
        changes_applied: [],
        status: 'ERROR',
        audit_log: ['Invalid repository format. Expected: owner/repository']
      });
      return;
    }
    setIsRefactoring(true);
    setRefactorResult(null);
    try {
      const result = await ApiService.refactor.audit(trimmedTarget);
      setRefactorResult(result);
    } catch (error) {
      console.error('Audit failed:', error);
      setRefactorResult({
        action: 'audit_failed',
        target: trimmedTarget,
        changes_applied: [],
        status: 'ERROR',
        audit_log: ['Audit failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleExecuteGodMode = async () => {
    const trimmedTarget = refactorTarget.trim();
    if (!trimmedTarget || !validateRepositoryFormat(trimmedTarget)) {
      setRefactorResult({
        action: 'validation_failed',
        target: trimmedTarget,
        changes_applied: [],
        status: 'ERROR',
        audit_log: ['Invalid repository format. Expected: owner/repository']
      });
      return;
    }
    setIsRefactoring(true);
    try {
      const result = await ApiService.refactor.execute({ target: trimmedTarget });
      setRefactorResult(result);
      const updatedStatus = await ApiService.refactor.getStatus();
      setGodModeStatus(updatedStatus);
    } catch (error) {
      console.error('God Mode execution failed:', error);
      setRefactorResult({
        action: 'execution_failed',
        target: trimmedTarget,
        changes_applied: [],
        status: 'ERROR',
        audit_log: ['Execution failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  const metrics = [
    { label: 'Bandwidth', value: `${(load * 0.42).toFixed(1)} GB/s`, trend: '+4%', color: 'text-blue-400' },
    { label: 'Agent Throughput', value: `${(load * 18).toFixed(0)} rps`, trend: 'Optimal', color: 'text-green-400' },
    { label: 'Latency', value: `${Math.max(2, (8 - load/20)).toFixed(0)}ms`, trend: '-1ms', color: 'text-cyan-400' },
    { label: 'Cluster Health', value: '100%', trend: 'Steady', color: 'text-green-500' }
  ];

  return (
    <div className="h-full w-full bg-[#000000] p-8 lg:p-12 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Admin Plane</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-2 italic">Sovereign Governance Center</p>
          </div>
          <nav className="flex bg-[#05070A] p-1 rounded-2xl border border-white/10 shrink-0">
            {['health', 'users', 'tokens', 'flags', 'godmode'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'godmode' ? '⚡ God Mode' : tab}
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
                      <td className="py-6 text-[10px] font-mono opacity-30">{user.lastActive}</td>
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
                  <button
                    onClick={() => handleToggleFlag(flag.id)}
                    className={`w-12 h-6 rounded-full border border-white/10 transition-all flex items-center px-1 ${flag.enabled ? 'bg-blue-600/20' : 'bg-zinc-900'}`}
                  >
                    <div className={`w-4 h-4 rounded-full transition-all ${flag.enabled ? 'bg-blue-400 translate-x-6' : 'bg-zinc-700 translate-x-0'}`}></div>
                  </button>
                </div>
                <div className="pt-6 border-t border-white/[0.02] flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-10">
                  <span>Scope: Global</span>
                  <span>Circuit: Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'godmode' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-12 bg-[#05070A] border border-blue-500/30 rounded-[40px] space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent)] opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">⚡ God Mode</h3>
                    <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 mt-2 italic">Autonomous Refactor Protocol</p>
                  </div>
                  {godModeStatus && (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest opacity-30">Status</p>
                        <p className={`text-sm font-black italic ${godModeStatus.enabled ? 'text-green-400' : 'text-red-400'}`}>
                          {godModeStatus.enabled ? '● ONLINE' : '● OFFLINE'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest opacity-30">Total Refactors</p>
                        <p className="text-sm font-black italic text-blue-400">{godModeStatus.totalRefactors}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest opacity-30">Success Rate</p>
                        <p className="text-sm font-black italic text-green-400">{godModeStatus.successRate}%</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">Target Repository</label>
                      <input
                        type="text"
                        value={refactorTarget}
                        onChange={(e) => setRefactorTarget(e.target.value)}
                        placeholder="owner/repository"
                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm font-mono text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none transition-all"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={handleAuditRepo}
                        disabled={isRefactoring || !refactorTarget.trim()}
                        className="flex-1 px-8 py-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isRefactoring ? '⏳ Processing...' : '🔍 Audit'}
                      </button>
                      <button
                        onClick={handleExecuteGodMode}
                        disabled={isRefactoring || !refactorTarget.trim()}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-300 hover:from-blue-600/30 hover:to-purple-600/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                      >
                        {isRefactoring ? '⚡ Executing...' : '⚡ Execute God Mode'}
                      </button>
                    </div>

                    <div className="p-6 bg-black/20 border border-white/5 rounded-2xl">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">Capabilities</h4>
                      <ul className="space-y-2 text-[10px] font-mono">
                        <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Auto-generate missing docs</li>
                        <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Code formatting (Black/Prettier)</li>
                        <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Standards compliance check</li>
                        <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Auto-create PRs</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {refactorResult && (
                      <div className="p-8 bg-black/40 border border-blue-500/20 rounded-2xl space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black italic uppercase tracking-widest text-blue-400">Results</h4>
                          <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 bg-blue-600/20 rounded-full text-blue-300">
                            {refactorResult.status || refactorResult.action}
                          </span>
                        </div>

                        {refactorResult.compliance_score && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest opacity-30 mb-2">Compliance Score</p>
                            <p className="text-2xl font-black italic text-cyan-400">{refactorResult.compliance_score}</p>
                          </div>
                        )}

                        {refactorResult.audit_log && refactorResult.audit_log.length > 0 && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest opacity-30 mb-3">Audit Log</p>
                            <div className="space-y-2">
                              {refactorResult.audit_log.map((log, i) => (
                                <p key={i} className="text-[10px] font-mono text-yellow-400/70">• {log}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {refactorResult.changes_applied && refactorResult.changes_applied.length > 0 && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest opacity-30 mb-3">Changes Applied</p>
                            <div className="space-y-2">
                              {refactorResult.changes_applied.map((change, i) => (
                                <p key={i} className="text-[10px] font-mono text-green-400/70">✓ {change}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {refactorResult.pr_url && (
                          <a 
                            href={refactorResult.pr_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block px-6 py-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-blue-400 hover:bg-blue-600/30 transition-all"
                          >
                            View Pull Request →
                          </a>
                        )}
                      </div>
                    )}

                    {!refactorResult && (
                      <div className="h-full p-8 bg-black/20 border border-white/5 rounded-2xl flex items-center justify-center">
                        <div className="text-center opacity-20">
                          <p className="text-6xl mb-4">⚡</p>
                          <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Command</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-[#05070A] border border-white/5 rounded-[32px]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 italic">What is God Mode?</h4>
              <p className="text-sm leading-relaxed opacity-60 mb-4">
                God Mode is an autonomous refactoring system that automatically audits repositories for FAANG-grade standards compliance 
                and creates pull requests to fix any violations. It checks for missing documentation, code formatting issues, 
                and ensures your repositories meet enterprise-level quality standards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-6 bg-black/20 rounded-2xl">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Standard Files</p>
                  <p className="text-xs font-mono">README.md, LICENSE, .gitignore, CONTRIBUTING.md</p>
                </div>
                <div className="p-6 bg-black/20 rounded-2xl">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Code Quality</p>
                  <p className="text-xs font-mono">Black, Prettier, ESLint fixes</p>
                </div>
                <div className="p-6 bg-black/20 rounded-2xl">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Auto PR</p>
                  <p className="text-xs font-mono">Automated pull request creation</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
