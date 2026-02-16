
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { User, ApiToken, FeatureFlag } from '../types';

export const AdminDashboard: React.FC<{fullView?: boolean, load: number}> = ({ fullView, load }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'tokens' | 'flags' | 'health'>('health');
  const [users, setUsers] = useState<User[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [u, t, f] = await Promise.all([
        ApiService.users.list(),
        ApiService.tokens.list(),
        ApiService.flags.list()
      ]);
      setUsers(u);
      setTokens(t);
      setFlags(f);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleToggleFlag = async (id: string) => {
    const updated = await ApiService.flags.toggle(id);
    setFlags(prev => prev.map(f => f.id === id ? updated! : f));
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
            {['health', 'users', 'tokens', 'flags'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
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
      </div>
    </div>
  );
};
