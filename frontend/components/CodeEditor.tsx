
import React, { useState, useEffect, useRef } from 'react';
import { UITheme } from '../types';
import { GoogleGenAI } from "@google/genai";

interface CodeEditorProps {
  theme: UITheme;
  onThemeChange: (newTheme: UITheme) => void;
}

const MAX_HISTORY = 50;

const CodeEditor: React.FC<CodeEditorProps> = ({ theme, onThemeChange }) => {
  const [code, setCode] = useState(JSON.stringify(theme, null, 2));
  const [prompt, setPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);

  useEffect(() => {
    const serialized = JSON.stringify(theme, null, 2);
    if (code !== serialized) {
      setCode(serialized);
    }
  }, [theme]);

  const pushToHistory = (newCode: string) => {
    setHistory(prev => [code, ...prev].slice(0, MAX_HISTORY));
    setFuture([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[0];
    setFuture(prev => [code, ...prev]);
    setHistory(history.slice(1));
    applyCodeChange(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [code, ...prev]);
    setFuture(future.slice(1));
    applyCodeChange(next);
  };

  const applyCodeChange = (newCode: string) => {
    setCode(newCode);
    try {
      const parsed = JSON.parse(newCode);
      setError(null);
      setIsValid(true);
      onThemeChange(parsed);
    } catch (err) {
      setError((err as Error).message);
      setIsValid(false);
    }
  };

  const handleRefinement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRefining) return;

    setIsRefining(true);
    setError(null);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const systemInstruction = `You are a theme manifest expert. You take a UI configuration JSON and an instruction, then return ONLY the updated JSON.
      Required format: VALID JSON OBJECT ONLY. No markdown, no backticks, no preamble.
      Required keys: primaryColor, sidebarBg, mainBg, fontFamily, borderRadius, logoText, accentGradient, baseFontSize.
      Current configuration: ${code}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Instruction: ${prompt}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        },
      });

      const refinedJson = response.text.trim();
      pushToHistory(refinedJson);
      applyCodeChange(refinedJson);
      setPrompt('');
    } catch (err) {
      setError("AI Refinement Failed: " + (err as Error).message);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] font-mono text-[13px] overflow-hidden">
      <div className="flex-1 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-12 h-full bg-[#1e1e1e] border-r border-white/5 text-white/10 flex flex-col items-center pt-4 select-none pointer-events-none z-10">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-[21px]">{i + 1}</div>
          ))}
        </div>
        
        <div className="absolute top-0 left-12 right-0 bottom-0 overflow-auto p-4 custom-scrollbar">
          <pre className={`leading-[21px] whitespace-pre transition-colors duration-300 ${isValid ? 'text-[#d4d4d4]' : 'text-red-300'}`}>
            {code}
          </pre>
          {isRefining && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
               <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 animate-pulse">Refining Manifest...</span>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="h-10 bg-[#f44336]/10 border-t border-[#f44336]/30 flex items-center px-4 text-[11px] text-[#f44336] animate-in slide-in-from-bottom-2">
          <span className="mr-2 font-black uppercase tracking-tighter">System Alert:</span> 
          <span className="truncate">{error}</span>
        </div>
      )}

      <div className="bg-[#252526] border-t border-white/5">
        <form onSubmit={handleRefinement} className="flex items-center px-4 py-3 space-x-4">
           <div className="text-[10px] font-black text-blue-500 shrink-0 uppercase tracking-widest">Natural Command &gt;</div>
           <input 
             type="text"
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="Refine manifest using natural language instructions..."
             className="flex-1 bg-black/30 border border-white/5 rounded px-3 py-2 text-[12px] outline-none focus:border-blue-500/50 transition-all placeholder:opacity-20 text-white"
             disabled={isRefining}
           />
           <button 
             type="submit" 
             disabled={isRefining || !prompt.trim()} 
             className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-blue-500 disabled:opacity-20 transition-all active:scale-95"
           >
             Refine
           </button>
        </form>
      </div>

      <div className={`h-8 flex items-center justify-between px-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isValid ? 'bg-[#007fd4] text-white' : 'bg-red-600 text-white'}`}>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 mr-4 border-r border-white/20 pr-4 h-full py-1">
            <button 
              onClick={undo} 
              disabled={history.length === 0 || isRefining}
              className={`px-2 rounded hover:bg-white/10 transition-colors disabled:opacity-30 flex items-center`}
            >
              <UndoIcon size={12} className="mr-1" /> Undo
            </button>
            <button 
              onClick={redo} 
              disabled={future.length === 0 || isRefining}
              className={`px-2 rounded hover:bg-white/10 transition-colors disabled:opacity-30 flex items-center`}
            >
              <RedoIcon size={12} className="mr-1" /> Redo
            </button>
          </div>
          <span>Natural Language Forge</span>
          <span className="text-white/80">{isRefining ? 'SYNCING...' : 'IDLE'}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <span>Manifest.JSON</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};

const UndoIcon = ({ size = 12, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = ({ size = 12, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
);

export default CodeEditor;
