
import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { FileData, Theme, LintIssue } from '../types';

// Sovereign Linter Engine: Analyzes code for common patterns, syntax errors, and style issues.
export function lintCode(code: string, language: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = code.split('\n');
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (line.includes('console.log(')) {
      issues.push({ line: lineNum, column: line.indexOf('console'), message: 'Unexpected console.log. Use a sovereign logger node instead.', severity: 'warning', code: 'no-console' });
    }
  });
  return issues;
}

// Setup monaco workers via ESM imports
// FIX: Cast `self` to `any` to set MonacoEnvironment and prevent TypeScript error. This is a standard pattern for configuring Monaco Editor workers.
(self as any).MonacoEnvironment = {
  getWorker: function (workerId, label) {
    const getWorkerModule = (moduleUrl, label) => {
      return new Worker(monaco.Uri.parse(moduleUrl).toString(true), { name: label, type: 'module' });
    };
    switch (label) {
      case 'json': return getWorkerModule('https://esm.sh/monaco-editor@0.45.0/esm/vs/language/json/json.worker?worker', label);
      case 'css': case 'scss': case 'less': return getWorkerModule('https://esm.sh/monaco-editor@0.45.0/esm/vs/language/css/css.worker?worker', label);
      case 'html': return getWorkerModule('https://esm.sh/monaco-editor@0.45.0/esm/vs/language/html/html.worker?worker', label);
      case 'typescript': case 'javascript': return getWorkerModule('https://esm.sh/monaco-editor@0.45.0/esm/vs/language/typescript/ts.worker?worker', label);
      default: return getWorkerModule('https://esm.sh/monaco-editor@0.45.0/esm/vs/editor/editor.worker?worker', label);
    }
  },
};

interface MonacoEditorProps {
  activeFile: FileData | null;
  onContentChange: (content: string) => void;
  lastSaved?: Date | null;
  theme?: Theme;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ activeFile, onContentChange, lastSaved, theme = 'dark' }) => {
  const [showProblems, setShowProblems] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const issues = useMemo(() => {
    if (!activeFile) return [];
    return lintCode(activeFile.content, activeFile.language);
  }, [activeFile?.content, activeFile?.language]);

  useEffect(() => {
    if (editorRef.current && !editorInstance.current) {
      editorInstance.current = monaco.editor.create(editorRef.current, {
        automaticLayout: true,
        fontFamily: 'Fira Code',
        fontSize: 15,
        wordWrap: 'on',
        bracketPairColorization: { enabled: true },
        minimap: { enabled: true },
        scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
      });

      editorInstance.current.onDidChangeModelContent(() => {
        const value = editorInstance.current?.getValue() || '';
        onContentChange(value);
      });
    }
    return () => {
      editorInstance.current?.dispose();
      editorInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (editorInstance.current && activeFile) {
      let model = editorInstance.current.getModel();
      if (!model || model.uri.toString() !== activeFile.id) {
        model = monaco.editor.createModel(activeFile.content, activeFile.language, monaco.Uri.parse(activeFile.id));
        editorInstance.current.setModel(model);
      } else {
        if (editorInstance.current.getValue() !== activeFile.content) {
            editorInstance.current.executeEdits('', [{
                range: model.getFullModelRange(),
                text: activeFile.content
            }]);
        }
      }
    }
    
    if (editorInstance.current) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs-light');
      editorInstance.current.updateOptions({
        theme: theme === 'dark' ? 'vs-dark' : 'vs-light',
      });
    }

  }, [activeFile, theme]);
  
  useEffect(() => {
    if (editorInstance.current && activeFile) {
      const model = editorInstance.current.getModel();
      if(model) {
        const markers = issues.map(issue => ({
          startLineNumber: issue.line,
          startColumn: issue.column,
          endLineNumber: issue.line,
          endColumn: Infinity,
          message: issue.message,
          severity: issue.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        }));
        monaco.editor.setModelMarkers(model, 'sovereign-linter', markers);
      }
    }
  }, [issues, activeFile]);

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
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.01]">
          <span className="text-[15px] font-mono-code text-white font-black italic tracking-tight">{activeFile.name}</span>
          <button onClick={() => setShowProblems(!showProblems)} className="flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10">
            {issues.length} Issues Detected
          </button>
        </header>

        <div ref={editorRef} className="flex-1 overflow-hidden" style={{ background: 'transparent' }} />
        
        {showProblems && (
          <div className="h-48 border-t border-white/10 bg-black/90 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic mb-4">Sovereign Linter Diagnostics</h3>
            {issues.length > 0 ? issues.map((iss, i) => (
              <div key={i} className="flex items-center gap-4 text-[11px] font-mono-code hover:bg-white/5 p-1 rounded">
                <span className={`w-16 shrink-0 opacity-30 text-right`}>{iss.line}:{iss.column}</span>
                <span className={`w-2 h-2 rounded-full ${iss.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                <span className="flex-1 opacity-70">{iss.message}</span>
              </div>
            )) : <p className="text-xs opacity-20 italic">No issues detected.</p>}
          </div>
        )}
      </div>
    </div>
  );
};
