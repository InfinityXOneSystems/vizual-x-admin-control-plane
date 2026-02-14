
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
  const isDark = theme === 'dark';

  const unstagedFiles = files.filter(f => !stagedFiles.includes(f.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Staging Area
          </h3>
          
          <div className={`rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-slate-50'} overflow-hidden`}>
            {/* Staged */}
            <div className="p-4 border-b border-inherit">
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-3 block">Staged Changes ({stagedFiles.length})</span>
              {stagedFiles.length === 0 && <p className="text-xs opacity-30 py-4 italic">No files staged for commit.</p>}
              <div className="space-y-1">
                {stagedFiles.map(id => {
                  const file = files.find(f => f.id === id);
                  return (
                    <div key={id} className="flex justify-between items-center group">
                      <span className="text-xs font-mono-code">{file?.name}</span>
                      <button onClick={() => onUnstage(id)} className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Unstage</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unstaged */}
            <div className="p-4">
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-3 block">Changes</span>
              {unstagedFiles.length === 0 && <p className="text-xs opacity-30 py-4 italic">Clean working directory.</p>}
              <div className="space-y-1">
                {unstagedFiles.map(file => (
                  <div key={file.id} className="flex justify-between items-center group">
                    <span className="text-xs font-mono-code">{file.name}</span>
                    <button onClick={() => onStage(file.id)} className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Stage</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Commit message..."
            className={`w-full p-4 rounded-xl border outline-none text-sm font-mono-code ${
              isDark ? 'bg-black/40 border-white/10 focus:border-blue-500/50' : 'bg-white border-black/10 focus:border-blue-500/50'
            }`}
            rows={3}
          />
          <button 
            disabled={!message.trim() || stagedFiles.length === 0}
            onClick={() => { onCommit(message); setMessage(''); }}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 disabled:opacity-30 transition-all active:scale-95"
          >
            Commit to Main
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Commit History
        </h3>
        <div className="space-y-4">
          {history.length === 0 && <div className="p-8 text-center opacity-30 text-sm">No commits yet.</div>}
          {history.map(commit => (
            <div key={commit.id} className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-black/5'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-500 font-mono-code">#{commit.id.slice(0, 7)}</span>
                <span className="text-[10px] opacity-40">{new Date(commit.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm font-medium mb-2">{commit.message}</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                  {commit.author[0]}
                </div>
                <span className="text-[10px] opacity-60">{commit.author} committed {commit.files.length} files</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
