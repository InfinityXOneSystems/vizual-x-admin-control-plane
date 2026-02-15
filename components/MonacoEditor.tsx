
import React from 'react';
import { FileData, Theme } from '../types';

interface MonacoEditorProps {
  activeFile: FileData | null;
  onContentChange?: (content: string) => void;
  lastSaved?: Date | null;
  theme?: Theme;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ 
  activeFile, 
  onContentChange, 
  lastSaved, 
  theme = 'dark'
}) => {
  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black p-16 animate-in fade-in duration-1000">
        <div className="w-24 h-24 border border-white/5 rounded-[48px] flex items-center justify-center opacity-10 shadow-2xl bg-white/[0.02]">
           <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </div>
        <p className="mt-10 font-black uppercase tracking-[0.6em] opacity-20 text-[11px] italic">Kernel Engine Standby / Load Nodes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black h-full animate-in fade-in duration-700 p-16 overflow-hidden">
      <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-[40px] shadow-4xl flex flex-col overflow-hidden backdrop-blur-3xl">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full electric-gradient shadow-[0_0_12px_rgba(0,102,255,0.8)] animate-pulse"></div>
            <span className="text-[12px] font-mono-code text-white/90 tracking-tight font-bold italic">{activeFile.name}</span>
          </div>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 italic">{activeFile.language} Unit</span>
          </div>
        </div>

        <div className="flex-1 flex font-mono-code text-[14px] leading-relaxed overflow-hidden relative">
          <div className="w-14 border-r border-white/5 flex flex-col items-center py-10 text-[11px] opacity-10 select-none z-10 bg-transparent font-bold">
            {activeFile.content.split('\n').map((_, idx) => (
              <span key={idx} className="block leading-[1.8rem]">{idx + 1}</span>
            ))}
          </div>
          
          <div className="flex-1 relative overflow-hidden group">
              <textarea
                  value={activeFile.content}
                  onChange={(e) => onContentChange && onContentChange(e.target.value)}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full py-10 px-10 bg-transparent text-transparent caret-blue-500 outline-none resize-none font-mono-code z-20 overflow-auto whitespace-pre custom-scrollbar font-medium"
                  style={{ lineHeight: '1.8rem', caretColor: 'var(--electric-blue-light)' }}
              />
              
              <div className="absolute inset-0 w-full h-full py-10 px-10 pointer-events-none z-10 overflow-hidden whitespace-pre font-mono-code">
                  <pre className="text-white/80">
                      <code>{highlightCode(activeFile.content, activeFile.language)}</code>
                  </pre>
              </div>
          </div>
        </div>

        <footer className="h-12 bg-white/[0.02] flex items-center justify-between px-10 text-[10px] font-black uppercase tracking-[0.4em] electric-text opacity-50 border-t border-white/5 italic">
          <div className="flex gap-10">
            <span>{activeFile.language} Cluster</span>
            <span>UTF-8 Sovereign</span>
          </div>
          <span>{lastSaved ? `Synced @ ${lastSaved.toLocaleTimeString()}` : 'Kernel Runtime Persistent'}</span>
        </footer>
      </div>
    </div>
  );
};

function highlightCode(code: string, language: string) {
  if (!code) return null;
  return code.split('\n').map((line, i) => {
    let highlighted = line
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|await|async|try|catch|class|interface|type|extends|default|switch|case)\b/g, '<span style="color: #00d4ff">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #569cd6">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #ce9178">$1</span>')
      .replace(/\/\/.*/g, '<span style="color: #6a9955">$&</span>');
    return <span key={i} className="block min-h-[1.8rem]" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />;
  });
}
