
import React, { useState } from 'react';
import { GitCommit, Theme, FileData } from '../types';

interface GitPanelProps {
  files: FileData[];
  stagedFiles: string[];
  history: GitCommit[];
  onStage: (id: string) => void;
  onUnstage: (id: string) => void;
  onCommit: (message: string) => void;
  theme: Theme;
}

export const GitPanel: React.FC<GitPanelProps> = ({ files, stagedFiles, history, onStage, onUnstage, onCommit, theme }) => {
  const [message, setMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const isDark = theme === 'dark';

  const unstagedFiles = files.filter(f => !stagedFiles.includes(f.id));

  const handleSync = (action: 'push' | 'pull') => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left Area: Staging and Commit Controls */}
      <div className="xl:col-span-7 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Staging Area */}
          <div className="p-8 glass-panel rounded-[40px] silver-border-glow bg-white/[0.01] flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Staging Cluster</span>
              <span className="text-[9px] font-mono opacity-20">{stagedFiles.length} Indexed</span>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
              {stagedFiles.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                   <div className="w-12 h-12 border border-dashed border-white rounded-full mb-4"></div>
                   <p className="text-[10px] uppercase font-black tracking-widest italic">Buffer Empty</p>
                </div>
              )}
              {stagedFiles.map(id => {
                const file = files.find(f => f.id === id);
                return (
                  <div key={id} className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex justify-between items-center group animate-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-3">
                       <span className="text-xs">📄</span>
                       <span className="text-[11px] font-mono-code font-bold text-white/80">{file?.name}</span>
                    </div>
                    <button onClick={() => onUnstage(id)} className="text-[9px] font-black uppercase tracking-widest text-red-400 opacity-40 hover:opacity-100 transition-opacity">Unstage</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Working Changes */}
          <div className="p-8 glass-panel rounded-[40px] silver-border-glow bg-white/[0.01] flex flex-col min-h-[400px]">
             <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Untracked Deltas</span>
              <span className="text-[9px] font-mono opacity-20">{unstagedFiles.length} Local</span>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
              {unstagedFiles.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                   <div className="w-12 h-12 border border-dashed border-white rounded-full mb-4"></div>
                   <p className="text-[10px] uppercase font-black tracking-widest italic">Clean Node</p>
                </div>
              )}
              {unstagedFiles.map(file => (
                <div key={file.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                     <span className="text-xs opacity-40">📄</span>
                     <span className="text-[11px] font-mono-code font-bold text-white/50">{file.name}</span>
                  </div>
                  <button onClick={() => onStage(file.id)} className="text-[9px] font-black uppercase tracking-widest text-blue-400 opacity-40 hover:opacity-100 transition-opacity italic">Stage</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commit Action */}
        <div className="p-10 glass-panel rounded-[50px] space-y-8 silver-border-glow">
           <div className="flex justify-between items-center">
             <label className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 italic">Commit Directive</label>
             <div className="flex gap-4">
                <button 
                  onClick={() => handleSync('pull')} 
                  disabled={isSyncing}
                  className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all"
                >
                  {isSyncing ? 'Synchronizing...' : 'Pull Origins'}
                </button>
                <button 
                  onClick={() => handleSync('push')}
                  disabled={isSyncing}
                  className="px-5 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 electric-text text-[9px] font-black uppercase tracking-widest italic hover:bg-blue-500/10 transition-all shadow-glow"
                >
                  {isSyncing ? 'Transmitting...' : 'Push Remote'}
                </button>
             </div>
           </div>
           
           <div className="space-y-6">
             <textarea 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Draft commit summary..."
               className="w-full bg-black/40 border border-white/10 rounded-[30px] p-8 text-sm font-bold min-h-[120px] outline-none focus:border-blue-500 transition-all resize-none shadow-inner leading-relaxed italic text-white/90 placeholder:text-white/10"
             />
             <button 
               disabled={!message.trim() || stagedFiles.length === 0}
               onClick={() => { onCommit(message); setMessage(''); }}
               className="w-full py-6 electric-gradient text-white rounded-[30px] font-black uppercase tracking-[0.5em] text-[11px] shadow-2xl disabled:opacity-30 transition-all border border-white/10 italic"
             >
               Commit Synchronized Asset
             </button>
           </div>
        </div>
      </div>

      {/* Right Area: Commit History */}
      <div className="xl:col-span-5 h-full">
        <div className="glass-panel rounded-[50px] p-10 h-full flex flex-col silver-border-glow min-h-[600px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black italic uppercase tracking-widest italic">Logic Lineage</h3>
            <span className="text-[10px] font-black opacity-20 uppercase tracking-widest italic">{history.length} Commits</span>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-20">
                 <span className="text-8xl mb-8">🌳</span>
                 <p className="text-sm font-black uppercase tracking-[0.6em] italic">No Lineage Detected</p>
              </div>
            )}
            {history.map(commit => (
              <div key={commit.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-blue-500/20 transition-all group animate-in slide-in-from-right-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full electric-gradient shadow-glow"></span>
                    <span className="text-[10px] font-mono-code text-blue-400 uppercase font-black italic">ID: {commit.id}</span>
                  </div>
                  <span className="text-[9px] font-black opacity-20 uppercase tracking-widest italic">
                    {new Date(commit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors leading-relaxed mb-6 italic">
                  {commit.message}
                </h4>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full electric-gradient flex items-center justify-center text-[10px] font-black italic border border-white/20">
                         {commit.author[0]}
                      </div>
                      <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] italic">{commit.author}</span>
                   </div>
                   <span className="text-[9px] font-black opacity-20 uppercase tracking-widest italic">{commit.files.length} Assets Affected</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-white/[0.02] rounded-[30px] text-center border-dashed border-white/10 opacity-30 italic">
             <p className="text-[9px] font-black uppercase tracking-[0.4em]">Proprietary Sovereign Versioning ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
};
