
import React from 'react';
import { FileData, Theme } from '../types';

interface MonacoEditorProps {
  activeFile: FileData | null;
  onContentChange?: (content: string) => void;
  lastSaved?: Date | null;
  theme?: Theme;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ activeFile, onContentChange, lastSaved, theme = 'dark' }) => {
  if (!activeFile) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center ${theme === 'light' ? 'bg-slate-200/50' : 'bg-[#0d0d0d]'} opacity-20`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <p className="font-mono-code text-sm uppercase tracking-widest">Workspace Empty</p>
      </div>
    );
  }

  const editorBg = theme === 'light' ? '#ffffff' : '#1e1e1e';
  const textColor = theme === 'light' ? '#334155' : '#d4d4d4';
  const borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';

  return (
    <div className={`flex-1 flex flex-col transition-colors duration-300`} style={{ backgroundColor: editorBg }}>
      {/* Tab Bar */}
      <div className={`flex items-center h-9 border-b transition-colors`} style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : '#252526', borderColor: borderColor }}>
        <div className={`px-4 flex items-center h-full border-t border-t-blue-500 text-xs gap-2`} style={{ backgroundColor: editorBg, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
          <span className="text-blue-500 font-bold">
            {['javascript', 'js', 'typescript', 'ts', 'tsx'].includes(activeFile.language.toLowerCase()) ? '</>' : '•'}
          </span>
          {activeFile.name}
        </div>
      </div>

      <div className="flex-1 flex font-mono-code text-[14px] leading-relaxed overflow-hidden relative">
        <div className={`w-12 border-r flex flex-col items-center py-4 text-xs opacity-30 select-none z-10 transition-colors`} style={{ backgroundColor: editorBg, borderColor: borderColor }}>
          {activeFile.content.split('\n').map((_, idx) => (
            <span key={idx} className="block w-full text-center leading-[1.5rem]">
              {idx + 1}
            </span>
          ))}
        </div>
        
        <div className="flex-1 relative overflow-hidden group">
            <textarea
                value={activeFile.content}
                onChange={(e) => onContentChange && onContentChange(e.target.value)}
                spellCheck={false}
                className="absolute inset-0 w-full h-full py-4 px-6 bg-transparent text-transparent caret-blue-500 outline-none resize-none font-mono-code z-20 overflow-auto whitespace-pre custom-scrollbar"
                style={{ lineHeight: '1.5rem' }}
            />
            
            <div className="absolute inset-0 w-full h-full py-4 px-6 pointer-events-none z-10 overflow-hidden whitespace-pre font-mono-code">
                <pre style={{ color: textColor }}>
                    <code>
                    {/* Explicitly cast theme to Theme to ensure type safety with the utility function */}
                    {highlightCode(activeFile.content, activeFile.language, theme as Theme)}
                    </code>
                </pre>
            </div>

            <button 
                onClick={() => navigator.clipboard.writeText(activeFile.content)}
                className="absolute top-4 right-4 bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 border border-black/10 dark:border-white/10 p-2 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100 z-30"
            >
                Copy
            </button>
        </div>
      </div>

      <div className={`h-6 flex items-center justify-between px-3 text-[10px] font-mono-code uppercase tracking-wider z-20 text-white`} style={{ backgroundColor: theme === 'light' ? '#64748b' : '#007acc' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            {lastSaved ? `Synced ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Live'}
          </div>
          <div>{activeFile.language}</div>
        </div>
        <div className="flex items-center gap-4">
          <div>Lines: {activeFile.content.split('\n').length}</div>
          <div>Spaces: 2</div>
        </div>
      </div>
    </div>
  );
};

function highlightCode(code: string, language: string, theme: Theme) {
  if (!code) return null;
  const isLight = theme === 'light';
  
  return code.split('\n').map((line, i) => {
    let highlighted = line
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|await|async|try|catch|class|interface|type|extends|default|switch|case)\b/g, `<span style="color: ${isLight ? '#af00db' : '#c586c0'}">$1</span>`)
      .replace(/\b(true|false|null|undefined)\b/g, `<span style="color: ${isLight ? '#0000ff' : '#569cd6'}">$1</span>`)
      .replace(/(".*?"|'.*?'|`.*?`)/g, `<span style="color: ${isLight ? '#a31515' : '#ce9178'}">$1</span>`)
      .replace(/\b(\d+)\b/g, `<span style="color: ${isLight ? '#098658' : '#b5cea8'}">$1</span>`)
      .replace(/\b(interface|enum|type|React|FC|Message|FileData|HTMLTextAreaElement|ChangeEvent|useCallback|useState|useEffect)\b/g, `<span style="color: ${isLight ? '#267f99' : '#4ec9b0'}">$1</span>`)
      .replace(/\/\/.*/g, `<span style="color: ${isLight ? '#008000' : '#6a9955'}">$&</span>`);

    return (
      <span key={i} className="block min-h-[1.5rem]" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
    );
  });
}
