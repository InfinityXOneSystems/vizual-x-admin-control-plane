
import React, { useState } from 'react';
import { FileData, Theme, RefactorSuggestion } from '../types';

interface MonacoEditorProps {
  activeFile: FileData | null;
  onContentChange?: (content: string) => void;
  lastSaved?: Date | null;
  theme?: Theme;
  onRefactor?: (file: FileData) => Promise<RefactorSuggestion[]>;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ 
  activeFile, 
  onContentChange, 
  lastSaved, 
  theme = 'dark',
  onRefactor
}) => {
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [suggestions, setSuggestions] = useState<RefactorSuggestion[]>([]);
  const [showRefactorPanel, setShowRefactorPanel] = useState(false);

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

  const handleRefactorClick = async () => {
    if (!onRefactor || isRefactoring) return;
    setIsRefactoring(true);
    setShowRefactorPanel(true);
    try {
      const results = await onRefactor(activeFile);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefactoring(false);
    }
  };

  const applySuggestion = (suggestion: RefactorSuggestion) => {
    if (onContentChange) {
      onContentChange(suggestion.refactoredCode);
    }
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const editorBg = theme === 'light' ? '#ffffff' : '#1e1e1e';
  const textColor = theme === 'light' ? '#334155' : '#d4d4d4';
  const borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';

  return (
    <div className={`flex-1 flex flex-col transition-colors duration-300 relative`} style={{ backgroundColor: editorBg }}>
      {/* Tab Bar */}
      <div className={`flex items-center h-9 border-b transition-colors justify-between`} style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : '#252526', borderColor: borderColor }}>
        <div className={`px-4 flex items-center h-full border-t border-t-blue-500 text-xs gap-2`} style={{ backgroundColor: editorBg, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
          <span className="text-blue-500 font-bold">
            {['javascript', 'js', 'typescript', 'ts', 'tsx'].includes(activeFile.language.toLowerCase()) ? '</>' : '•'}
          </span>
          {activeFile.name}
        </div>
        
        <div className="flex items-center gap-1 px-2">
          <button 
            onClick={handleRefactorClick}
            disabled={isRefactoring}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all
              ${isRefactoring ? 'bg-blue-500/10 text-blue-500/50 cursor-not-allowed' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-500/20'}
            `}
          >
            <svg className={`w-3 h-3 ${isRefactoring ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isRefactoring ? 'Analyzing...' : 'AI Refactor'}
          </button>
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

        {/* AI Refactor Suggestion Panel Overlay */}
        {showRefactorPanel && (
          <div className="absolute inset-y-0 right-0 w-[400px] z-40 flex flex-col bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h4 className="text-sm font-black text-white tracking-widest uppercase">Refactor Hub</h4>
                <p className="text-[9px] opacity-40 font-mono-code uppercase">AI Analysis Results</p>
              </div>
              <button onClick={() => setShowRefactorPanel(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-5 h-5 text-white/40 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {isRefactoring ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-50">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 animate-pulse">Scanning Code Patterns...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8 opacity-20">
                  <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xs font-bold">No refactoring suggestions for this module.</p>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        suggestion.category === 'performance' ? 'bg-orange-500/20 text-orange-400' :
                        suggestion.category === 'readability' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {suggestion.category}
                      </span>
                      <button 
                        onClick={() => applySuggestion(suggestion)}
                        className="text-[9px] font-black text-blue-500 uppercase hover:underline"
                      >
                        Apply Fix
                      </button>
                    </div>
                    <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-tight">{suggestion.title}</h5>
                    <p className="text-[10px] text-white/50 leading-relaxed mb-4">{suggestion.description}</p>
                    <div className="bg-black/40 rounded-lg p-3 border border-white/5 max-h-32 overflow-hidden relative">
                      <pre className="text-[9px] font-mono-code text-white/40 truncate">
                        {suggestion.refactoredCode}
                      </pre>
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 bg-white/5">
              <p className="text-[9px] opacity-20 font-mono-code text-center uppercase tracking-[0.3em]">Governance: Gemini Pro Reasoning v1</p>
            </div>
          </div>
        )}
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
