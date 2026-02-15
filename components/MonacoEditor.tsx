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
    <div className="flex-1 flex flex-col bg-black h-full animate-in fade-in duration-700 p-10 overflow-hidden">
      <div className="flex-1 glass-panel rounded-[40px] shadow-4xl flex flex-col overflow-hidden">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.01]">
          <div className="flex items-center gap-5">
            <div className="w-3 h-3 rounded-full neon-green-gradient shadow-glow-green animate-pulse"></div>
            <span className="text-[15px] font-mono-code text-white font-black italic tracking-tight">{activeFile.name}</span>
          </div>
          <div className="flex items-center gap-6">
             <span className="text-[11px] font-black uppercase tracking-[0.4em] neon-green-text italic">{activeFile.language} NODE</span>
          </div>
        </div>

        <div className="flex-1 flex font-mono-code text-[15px] leading-relaxed overflow-hidden relative">
          <div className="w-16 border-r border-white/5 flex flex-col items-center py-10 text-[11px] opacity-10 select-none z-10 bg-transparent font-black">
            {activeFile.content.split('\n').map((_, idx) => (
              <span key={idx} className="block leading-[1.8rem]">{idx + 1}</span>
            ))}
          </div>
          
          <div className="flex-1 relative overflow-hidden group">
              <textarea
                  value={activeFile.content}
                  onChange={(e) => onContentChange && onContentChange(e.target.value)}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full py-10 px-10 bg-transparent text-transparent caret-green-500 outline-none resize-none font-mono-code z-20 overflow-auto whitespace-pre custom-scrollbar font-bold"
                  style={{ lineHeight: '1.8rem', caretColor: '#39FF14' }}
              />
              
              <div className="absolute inset-0 w-full h-full py-10 px-10 pointer-events-none z-10 overflow-hidden whitespace-pre font-mono-code">
                  <pre className="text-white/80">
                      <code>{highlightCode(activeFile.content, activeFile.language)}</code>
                  </pre>
              </div>
          </div>
        </div>

        <footer className="h-14 bg-white/[0.02] flex items-center justify-between px-10 text-[11px] font-black uppercase tracking-[0.4em] neon-green-text border-t border-white/5 italic">
          <div className="flex gap-12">
            <span>{activeFile.language} Cluster Synchronized</span>
            <span>Sovereign UTF-8</span>
          </div>
          <span>{lastSaved ? `Alignment @ ${lastSaved.toLocaleTimeString()}` : 'Kernel Core Persistent'}</span>
        </footer>
      </div>
    </div>
  );
};

function highlightCode(code: string, language: string) {
  if (!code) return null;
  return code.split('\n').map((line, i) => {
    let highlighted = line
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|await|async|try|catch|class|interface|type|extends|default|switch|case)\b/g, '<span style="color: #39FF14">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #00d4ff">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #ce9178">$1</span>')
      .replace(/\/\/.*/g, '<span style="color: #6a9955; opacity: 0.4 italic">$&</span>');
    return <span key={i} className="block min-h-[1.8rem]" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />;
  });
}