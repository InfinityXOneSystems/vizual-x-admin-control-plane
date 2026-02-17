
import React, { useState } from 'react';
import { Connector } from '../types';

export const VaultXPage: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>([
    { id: 'gcp', name: 'Google Cloud', status: 'connected', latency: '4ms', category: 'CLOUD', icon: '☁️', details: 'Project: vix-prod-3921' },
    { id: 'github', name: 'GitHub Enterprise', status: 'connected', latency: '12ms', category: 'DEV', icon: '🐙', details: 'Org: vizual-x-corp' },
    { id: 'gworkspace', name: 'Google Workspace', status: 'disconnected', latency: '--', category: 'CLOUD', icon: '💼', details: 'Domain: vizual.x' },
    { id: 'vscode', name: 'VS Code Tunnel', status: 'pending', latency: '--', category: 'DEV', icon: '💻', details: 'Not connected' },
    { id: 'docker', name: 'Docker Hub', status: 'connected', latency: '21ms', category: 'DEV', icon: '🐳', details: 'Account: vix-operator' },
    { id: 'cloudflare', name: 'Cloudflare', status: 'disconnected', latency: '--', category: 'CLOUD', icon: '🌐', details: 'DNS & R2' },
    { id: 'ssh', name: 'Local SSH Key', status: 'connected', latency: '1ms', category: 'DEV', icon: '🔑', details: 'SHA256:Abc...xyz' },
    { id: 'vertex', name: 'Vertex AI Pro', status: 'pending', latency: '--', category: 'AI', icon: '🧠', details: 'API Key Required' },
  ]);

  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [syncingConnectors, setSyncingConnectors] = useState<string[]>([]);

  const handleSyncConnector = async (id: string) => {
    if (syncingConnectors.includes(id) || isSyncingGlobal) return;

    setSyncingConnectors(prev => [...prev, id]);
    setConnectors(prev => prev.map(c => c.id === id ? { ...c, status: 'syncing', validationResult: 'Initiating handshake...' } : c));
    await new Promise(res => setTimeout(res, 800));

    setConnectors(prev => prev.map(c => c.id === id ? { ...c, status: 'validating', validationResult: 'Validating credentials...' } : c));
    await new Promise(res => setTimeout(res, 1500));

    const success = Math.random() > 0.2; // 80% success rate
    setConnectors(prev => prev.map(c => c.id === id ? {
        ...c,
        status: success ? 'connected' : 'failed',
        lastSynced: success ? new Date() : c.lastSynced,
        validationResult: success ? `Validation successful @ ${new Date().toLocaleTimeString()}` : 'API Key mismatch. Re-auth required.'
    } : c));
    setSyncingConnectors(prev => prev.filter(syncId => syncId !== id));
  };

  const handleGlobalSync = async () => {
    if (isSyncingGlobal) return;
    setIsSyncingGlobal(true);
    for (const connector of connectors) {
        if (connector.status !== 'connected') {
            await handleSyncConnector(connector.id);
            await new Promise(res => setTimeout(res, 300));
        }
    }
    setIsSyncingGlobal(false);
  };

  return (
    <div className="h-full w-full bg-[#05070A] p-10 lg:p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
       <div className="max-w-7xl mx-auto space-y-16">
          <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b-[0.5px] border-white/5 pb-16">
             <div className="space-y-4">
                <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none italic">Universal Sync</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-4 italic">Distributed Ingress & Connector Matrix</p>
             </div>
             <button 
                onClick={handleGlobalSync}
                disabled={isSyncingGlobal}
                className="px-12 py-5 electric-gradient rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] italic text-white shadow-2xl transition-all active:scale-95 border-[0.5px] border-white/10 disabled:opacity-50"
             >
                {isSyncingGlobal ? 'Validating Matrix...' : 'Sync Cluster Immediately'}
             </button>
          </header>

          {/* Core Connector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {connectors.map(c => {
               const isSyncing = syncingConnectors.includes(c.id);
               return (
                 <div key={c.id} className="p-8 rounded-[40px] bg-white/[0.01] border-[0.5px] border-white/10 hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[340px] shadow-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <span className="text-7xl">{c.icon}</span>
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                       <div className="flex justify-between items-start">
                          <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                             {c.icon}
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full ${
                             c.status === 'connected' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 
                             c.status === 'pending' ? 'bg-yellow-500' : 
                             c.status === 'validating' ? 'bg-yellow-500 animate-pulse' : 
                             c.status === 'syncing' ? 'bg-blue-500 animate-pulse' :
                             c.status === 'failed' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' :
                             'bg-zinc-800'
                          }`}></div>
                       </div>
                       <div>
                          <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-1">{c.name}</h4>
                          <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.3em] italic">{c.details}</span>
                       </div>
                    </div>

                    <div className="space-y-4 relative z-10 pt-8 border-t border-white/[0.03]">
                       <div className="flex justify-between items-center text-[9px] font-mono opacity-20 uppercase tracking-widest">
                          <span>Handshake</span>
                          <span className={`font-black ${
                            c.status === 'connected' ? 'text-green-500' :
                            c.status === 'failed' ? 'text-red-500' :
                            c.status === 'syncing' || c.status === 'validating' ? 'text-blue-400' :
                            'text-zinc-700'
                          }`}>{c.status}</span>
                       </div>
                       {c.validationResult && (
                          <div className="flex justify-between items-center text-[9px] font-mono opacity-40 uppercase tracking-widest pt-2 border-t border-white/[0.03]">
                              <span className="text-white/40">Result</span>
                              <span className="text-white/60 normal-case italic truncate">{c.validationResult}</span>
                          </div>
                       )}
                       <button 
                          onClick={() => handleSyncConnector(c.id)}
                          disabled={isSyncing || isSyncingGlobal}
                          className="w-full mt-4 py-3 bg-white/5 border-[0.5px] border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed">
                            {isSyncing ? `${c.status.toUpperCase()}...` : c.status === 'connected' ? 'Re-Sync' : 'Sync'}
                       </button>
                    </div>
                 </div>
               );
             })}

             {/* Add System Slot */}
             <div className="p-8 rounded-[40px] border-[0.5px] border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center space-y-6 opacity-30 hover:opacity-100 transition-all cursor-pointer group hover:bg-white/[0.02] min-h-[340px]">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-all">+</div>
                <div>
                   <h4 className="text-sm font-black uppercase tracking-widest">Add Custom Integration</h4>
                   <p className="text-[9px] italic opacity-50 mt-2">API / OAuth / Webhook Sync</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};