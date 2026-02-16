import React, { useState } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { FileData } from '../types';

export const LiveEditorPage: React.FC = () => {
  const [activeFile, setActiveFile] = useState<FileData | null>({
    id: 'system-ui-config',
    name: 'SystemStyles.css',
    language: 'css',
    content: `:root {
  --primary-glow: #39FF14;
  --secondary-glow: #0066ff;
  --panel-blur: 50px;
  --neon-intensity: 0.8;
}

.sovereign-panel {
  background: rgba(10, 10, 10, 0.65);
  backdrop-filter: blur(var(--panel-blur));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(var(--primary-glow), 0.1);
}`
  });

  const [files] = useState<FileData[]>([
    { id: 'system-ui-config', name: 'SystemStyles.css', language: 'css', content: '...' },
    { id: 'ingress-logic', name: 'IngressController.tsx', language: 'typescript', content: '...' },
    { id: 'node-manifest', name: 'NodeManifest.json', language: 'json', content: '...' }
  ]);

  return (
    <div className="flex-1 flex flex-col h-full bg-black animate-in fade-in duration-700">
      <div className="h-16 lg:h-20 bg-white/[0.01] border-b border-white/5 flex items-center justify-between px-10">
        <div className="flex items-center gap-10">
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none italic">Live Editor</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 neon-green-text italic mt-1">Admin Front-End Overrides</p>
          </div>
          
          <div className="flex gap-4">
             {files.map(f => (
               <button 
                key={f.id}
                onClick={() => setActiveFile(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  activeFile?.id === f.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent opacity-20 hover:opacity-100'
                }`}
               >
                 {f.name}
               </button>
             ))}
          </div>
        </div>

        <div className="flex gap-4">
           <button className="px-6 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-blue-600/30 transition-all">
              Deploy Changes
           </button>
           <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest italic opacity-40 hover:opacity-100 transition-all">
              Reset Buffer
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor 
          activeFile={activeFile} 
          onContentChange={(newContent) => setActiveFile(prev => prev ? { ...prev, content: newContent } : null)}
          lastSaved={new Date()}
        />
      </div>

      <footer className="h-12 border-t border-white/5 bg-zinc-950 flex items-center justify-between px-10">
         <div className="flex gap-10 items-center">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
               <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Cluster: Production-A</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">V-Sync: 1.2ms</span>
         </div>
         <div className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">
            Vizual X Sovereign System Core
         </div>
      </footer>
    </div>
  );
};