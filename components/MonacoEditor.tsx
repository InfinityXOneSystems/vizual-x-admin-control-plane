
import React, { useMemo, useState } from 'react';
import { FileData, Theme, LintIssue } from '../types';

interface MonacoEditorProps {
  activeFile: FileData | null;
  onContentChange?: (content: string) => void;
  lastSaved?: Date | null;
  theme?: Theme;
}

/**
 * Sovereign Linter Engine: Analyzes code for common patterns, syntax errors, and style issues.
 */
export function lintCode(code: string, language: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = code.split('\n');

  // Basic Syntax Validation
  let openBraces = 0;
  let openBrackets = 0;

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // 1. Missing Semicolon (Stylistic Warning)
    if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.trim().endsWith(',') && !line.includes('//') && (language === 'typescript' || language === 'javascript')) {
      if (!line.includes('import') && !line.includes('export') && !line.includes('type') && !line.includes('interface')) {
        issues.push({ line: lineNum, column: line.length, message: 'Missing semicolon at end of line.', severity: 'warning', code: 'semi' });
      }
    }

    // 2. React Hook Rules
    if (line.includes('use') && line.includes('useState') && !code.includes('import {') && !code.includes('useState')) {
        issues.push({ line: lineNum, column: line.indexOf('useState'), message: 'useState used without being imported.', severity: 'error', code: 'react-hooks/rules' });
    }

    // 3. Tailwind Empty ClassName
    if (line.includes('className=""')) {
      issues.push({ line: lineNum, column: line.indexOf('className'), message: 'Empty className attribute detected.', severity: 'info', code: 'tailwind/no-empty' });
    }

    // 4. Console logs (Warning)
    if (line.includes('console.log(')) {
      issues.push({ line: lineNum, column: line.indexOf('console'), message: 'Unexpected console.log. Use a sovereign logger node instead.', severity: 'warning', code: 'no-console' });
    }

    // Unbalanced Check
    openBraces += (line.match(/{/g) || []).length;
    openBraces -= (line.match(/}/g) || []).length;
    openBrackets += (line.match(/\[/g) || []).length;
    openBrackets -= (line.match(/\]/g) || []).length;
  });

  if (openBraces !== 0) {
    issues.push({ line: lines.length, column: 0, message: `Unbalanced braces detected. Count: ${openBraces}`, severity: 'error', code: 'syntax/braces' });
  }
  if (openBrackets !== 0) {
    issues.push({ line: lines.length, column: 0, message: `Unbalanced brackets detected. Count: ${openBrackets}`, severity: 'error', code: 'syntax/brackets' });
  }

  return issues;
}

/**
 * Highlights code and injects lint markers.
 */
export function highlightCode(code: string, language: string, issues: LintIssue[] = []) {
  if (!code) return null;
  const lines = code.split('\n');

  return lines.map((line, i) => {
    const lineNum = i + 1;
    const lineIssues = issues.filter(issue => issue.line === lineNum);
    
    let highlighted = line
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|await|async|try|catch|class|interface|type|extends|default|switch|case|public|private|static|readonly)\b/g, '<span style="color: #39FF14">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #00d4ff">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #ce9178">$1</span>')
      .replace(/\/\/.*/g, '<span style="color: #6a9955; opacity: 0.5; font-style: italic">$&</span>');

    // Handle squiggles
    const hasError = lineIssues.some(iss => iss.severity === 'error');
    const hasWarning = lineIssues.some(iss => iss.severity === 'warning');
    const hasInfo = lineIssues.some(iss => iss.severity === 'info');

    const decorationClass = hasError ? 'border-b-2 border-red-500/50 border-dotted' : 
                           hasWarning ? 'border-b-2 border-yellow-500/50 border-dotted' :
                           hasInfo ? 'border-b-2 border-blue-500/30 border-dotted' : '';

    return (
      <span key={i} className={`block min-h-[1.8rem] relative group/line ${decorationClass}`}>
        <span dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
        {lineIssues.length > 0 && (
          <div className="absolute left-full ml-4 top-0 z-50 bg-black/90 border border-white/10 p-2 rounded text-[9px] opacity-0 group-hover/line:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl backdrop-blur-md">
            {lineIssues.map((iss, idx) => (
              <div key={idx} className={`${iss.severity === 'error' ? 'text-red-400' : iss.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                [{iss.severity.toUpperCase()}] {iss.message}
              </div>
            ))}
          </div>
        )}
      </span>
    );
  });
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ 
  activeFile, 
  onContentChange, 
  lastSaved, 
  theme = 'dark'
}) => {
  const [showProblems, setShowProblems] = useState(false);
  
  const issues = useMemo(() => {
    if (!activeFile) return [];
    return lintCode(activeFile.content, activeFile.language);
  }, [activeFile?.content, activeFile?.language]);

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
      <div className="flex-1 glass-panel rounded-[40px] shadow-4xl flex flex-col overflow-hidden relative">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.01]">
          <div className="flex items-center gap-5">
            <div className="w-3 h-3 rounded-full neon-green-gradient shadow-glow-green animate-pulse"></div>
            <span className="text-[15px] font-mono-code text-white font-black italic tracking-tight">{activeFile.name}</span>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={() => setShowProblems(!showProblems)}
               className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${issues.length > 0 ? 'border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10' : 'border-white/5 text-white/40 hover:bg-white/5'}`}
             >
                {issues.filter(i => i.severity === 'error').length} Errors • {issues.filter(i => i.severity === 'warning').length} Warnings
             </button>
             <span className="text-[11px] font-black uppercase tracking-[0.4em] neon-green-text italic">{activeFile.language} NODE</span>
          </div>
        </div>

        <div className="flex-1 flex font-mono-code text-[15px] leading-relaxed overflow-hidden relative">
          <div className="w-16 border-r border-white/5 flex flex-col items-center py-10 text-[11px] opacity-10 select-none z-10 bg-transparent font-black">
            {activeFile.content.split('\n').map((_, idx) => {
              const lineNum = idx + 1;
              const hasLineError = issues.some(iss => iss.line === lineNum && iss.severity === 'error');
              const hasLineWarning = issues.some(iss => iss.line === lineNum && iss.severity === 'warning');
              
              return (
                <div key={idx} className="relative flex items-center justify-center w-full leading-[1.8rem]">
                  <span>{lineNum}</span>
                  {hasLineError && <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                  {hasLineWarning && !hasLineError && <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>}
                </div>
              );
            })}
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
                      <code>{highlightCode(activeFile.content, activeFile.language, issues)}</code>
                  </pre>
              </div>
          </div>
        </div>

        {/* Problems Panel */}
        {showProblems && (
          <div className="h-48 border-t border-white/10 bg-black/90 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic">Sovereign Linter Diagnostics</span>
              <button onClick={() => setShowProblems(false)} className="text-[10px] opacity-40 hover:opacity-100 uppercase tracking-widest font-black">Dismiss</button>
            </div>
            {issues.length === 0 ? (
              <p className="text-xs opacity-20 italic">No issues detected in current node buffer.</p>
            ) : (
              <div className="space-y-2">
                {issues.map((iss, i) => (
                  <div key={i} className="flex items-center gap-4 text-[11px] font-mono-code group cursor-pointer hover:bg-white/5 p-1 rounded transition-colors">
                    <span className={`w-16 shrink-0 opacity-30 text-right`}>{iss.line}:{iss.column}</span>
                    <span className={`w-2 h-2 rounded-full ${iss.severity === 'error' ? 'bg-red-500' : iss.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                    <span className="flex-1 opacity-70 group-hover:opacity-100">{iss.message}</span>
                    <span className="opacity-20 text-[9px] uppercase tracking-widest">{iss.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="h-14 bg-white/[0.02] flex items-center justify-between px-10 text-[11px] font-black uppercase tracking-[0.4em] neon-green-text border-t border-white/5 italic">
          <div className="flex gap-12">
            <span>{activeFile.language} Cluster Synchronized</span>
            <span className={issues.length > 0 ? 'text-yellow-500' : ''}>{issues.length} Potential Bottlenecks Found</span>
          </div>
          <span>{lastSaved ? `Alignment @ ${lastSaved.toLocaleTimeString()}` : 'Kernel Core Persistent'}</span>
        </footer>
      </div>
    </div>
  );
};
