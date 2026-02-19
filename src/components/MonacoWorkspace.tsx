
import React, { useState } from 'react';

const MOCK_FILES = [
  { id: 'handshake', name: 'Handshake.ts', content: `/**\n * Vizual X Logic Node\n * Protocol: Supreme\n */\n\nexport const IngressHandshake = async () => {\n  const vault = await System.Vault.unlock();\n  console.log("Handshake Aligned", vault.status);\n  \n  return {\n    id: "VIX-NODE-001",\n    status: "Active"\n  };\n};` },
  { id: 'kernel', name: 'Kernel.tsx', content: `import React from 'react';\n\n// Vizual X Core Rendering Engine\nexport const Kernel: React.FC = () => {\n  return <div className="p-10 bg-black text-blue-400">Vizual X // LIVE</div>;\n};` },
  { id: 'styles', name: 'Vizual.css', content: `:root {\n  --electric-blue: #1E90FF;\n  --surface-tint: #05070A;\n}\n\n.vizual-orb {\n  border: 0.5px solid var(--electric-blue);\n  backdrop-filter: blur(20px);\n}` }
];

export const MonacoWorkspace: React.FC = () => {
  const [activeFileId, setActiveFileId] = useState('handshake');
  const [files, setFiles] = useState(MOCK_FILES);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleContentChange = (content: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] INITIATING CLUSTER DEPLOY...`, ...prev]);
    
    setTimeout(() => {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] NODE ${activeFile.name.toUpperCase()} RECOMPILED.`, ...prev]);
      setIsDeploying(false);
    }, 1200);
  };

  return (
    <div className="h-full w-full flex bg-[#000000] flex-col overflow-hidden font-mono text-[14px]">
      <div className="h-12 border-b border-white/[0.05] bg-[#05070A]/80 backdrop-blur-md flex items-center px-8 justify-between shrink-0">
         <div className="flex items-center gap-6">
            {files.map(f => (
              <button 
                key={f.id}
                onClick={() => setActiveFileId(f.id)}
                className={`text-[10px] font-bold uppercase italic tracking-widest pb-1 border-b transition-all ${activeFileId === f.id ? 'text-blue-400 border-blue-500/40' : 'text-zinc-600 border-transparent hover:text-zinc-300'}`}
              >
                {f.name}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isDeploying ? 'bg-blue-600/10 text-blue-400 opacity-50' : 'bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/30'}`}
            >
              {isDeploying ? 'Syncing Cluster...' : 'Push to Cloud'}
            </button>
         </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 border-r border-white/[0.05] flex flex-col items-center py-8 text-zinc-800 select-none bg-black/40">
           {[...Array(24)].map((_, i) => <div key={i} className="mb-2 text-[11px] font-bold">{i+1}</div>)}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <textarea 
            value={activeFile.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="flex-1 bg-transparent p-8 outline-none resize-none text-zinc-400 selection:bg-blue-500/20 custom-scrollbar font-mono leading-relaxed"
            spellCheck={false}
            autoFocus
          />
          {/* Internal Terminal */}
          <div className="h-32 border-t border-white/[0.05] bg-black/80 p-6 overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20">Vizual X Debug Terminal</span>
                <span className="text-[8px] font-mono opacity-10">Node-A // Cluster VIX-01</span>
             </div>
             <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] font-mono text-zinc-600 flex gap-4">
                    <span className="opacity-40">[{logs.length - i}]</span>
                    <span className={log.includes('COMPLETE') ? 'text-green-500' : ''}>{log}</span>
                  </div>
                ))}
                {logs.length === 0 && <span className="text-[10px] font-mono opacity-10 italic">Awaiting deployment signal...</span>}
             </div>
          </div>
        </div>
      </div>

      <div className="h-10 border-t border-white/[0.05] bg-[#05070A] flex items-center px-8 justify-between shrink-0">
         <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest italic opacity-30">
            <span>Cluster: Vizual-Main</span>
            <span>V-Sync: 1.2ms</span>
         </div>
         <div className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-400 italic">E2E Logic Node Active</div>
      </div>
    </div>
  );
};
