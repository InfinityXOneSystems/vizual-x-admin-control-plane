
import React, { useState } from 'react';

const INITIAL_CONNECTORS = [
  { id: 'github', name: 'GitHub Enterprise', icon: '🐙', status: 'linked', detail: 'User: vix-operator' },
  { id: 'vscode', name: 'VS Code Tunnel', icon: '💻', status: 'linked', detail: 'Node: Primary-X' },
  { id: 'chatgpt', name: 'GPT Context', icon: '🤖', status: 'idle', detail: 'Standby' },
  { id: 'gcloud', name: 'Google Cloud', icon: '☁️', status: 'linked', detail: 'Project: vizualx-core' },
  { id: 'gworkspace', name: 'Workspace', icon: '💼', status: 'idle', detail: 'Auth Required' }
];

export const GitSyncCenter: React.FC = () => {
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "[SYSTEM] Ingress successful.",
    "[AUTH] Local vault handshake active.",
    "[GIT] Master branch: origin-vix.git"
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addLog = (msg: string) => {
    setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 10)]);
  };

  const handleGlobalSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addLog("Initiating cluster re-sync protocol...");
    
    connectors.forEach((conn, i) => {
      setTimeout(() => {
        setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'syncing' } : c));
        addLog(`Synchronizing ${conn.name} node...`);
        
        setTimeout(() => {
          setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'linked' } : c));
          addLog(`${conn.name} alignment complete.`);
          if (i === connectors.length - 1) setIsSyncing(false);
        }, 1500);
      }, i * 600);
    });
  };

  const toggleConnector = (id: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'linked' ? 'idle' : 'linked';
        addLog(`${c.name} transitioned to ${nextStatus.toUpperCase()}.`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  return (
    <div className="h-full w-full flex bg-[#05070A] animate-in fade-in duration-500 overflow-hidden">
      {/* Sidebar Matrix */}
      <div className="w-[400px] border-r border-white/[0.05] p-10 space-y-10 overflow-y-auto custom-scrollbar shrink-0">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Connector Matrix</h3>
        <div className="space-y-6">
          {connectors.map(conn => (
            <div 
              key={conn.id} 
              onClick={() => toggleConnector(conn.id)}
              className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/40 transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                   <span className="text-2xl group-hover:scale-110 transition-transform">{conn.icon}</span>
                   <span className="text-[12px] font-black uppercase tracking-widest">{conn.name}</span>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  conn.status === 'syncing' ? 'bg-blue-400 animate-pulse shadow-[0_0_10px_#60a5fa]' : 
                  conn.status === 'linked' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-zinc-800'
                }`}></div>
              </div>
              <div className="flex justify-between items-center opacity-30">
                 <span className="text-[9px] font-mono uppercase tracking-tighter">{conn.detail}</span>
                 <span className="text-[9px] font-bold uppercase italic group-hover:text-blue-400 transition-colors">Toggle</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Workspace */}
      <div className="flex-1 flex flex-col bg-[#000000]">
        <div className="flex-1 p-12 font-mono text-[12px] overflow-y-auto custom-scrollbar flex flex-col-reverse justify-end">
           <div className="space-y-4">
             {syncLogs.map((log, i) => (
               <div key={i} className="flex items-start gap-6 opacity-60 hover:opacity-100 transition-all">
                 <span className="text-zinc-800 font-bold">#{(syncLogs.length - i).toString().padStart(2, '0')}</span>
                 <span className={log.includes('complete') ? 'text-green-400' : log.includes('protocol') ? 'text-blue-400 font-bold' : ''}>{log}</span>
               </div>
             ))}
           </div>
           
           <div className="mb-12 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                 <span className="text-blue-400 font-bold uppercase tracking-[0.3em] italic">[TERMINAL_PULSE]</span>
              </div>
              <button 
                onClick={handleGlobalSync}
                disabled={isSyncing}
                className={`px-10 py-4 electric-gradient rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 disabled:opacity-30`}
              >
                {isSyncing ? 'Synchronizing Cluster' : 'Force All Origin Sync'}
              </button>
           </div>
        </div>
        
        <div className="h-16 border-t border-white/[0.05] px-12 bg-[#05070A] flex items-center justify-between italic opacity-30 shrink-0">
           <p className="text-[9px] uppercase tracking-[1em]">Vault Persistence Layer: ACTIVE</p>
           <span className="text-[9px] font-mono uppercase">Vizual X // Build 4.2.0</span>
        </div>
      </div>
    </div>
  );
};
