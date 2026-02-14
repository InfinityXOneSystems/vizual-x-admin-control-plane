
import React, { useState, useRef, useEffect } from 'react';
import { Message, FileData, AppView, Theme, ProjectAction, AIRecommendation } from '../types';

interface ChatSidebarProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  files: FileData[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onRollback: (actionId: string) => void;
  actionHistory: ProjectAction[];
  recommendation: AIRecommendation | null;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  messages, onSendMessage, isLoading, files, activeFileId, 
  onSelectFile, onDeleteFile, currentView, onViewChange, theme, 
  onToggleTheme, onRollback, actionHistory, recommendation
}) => {
  const [input, setInput] = useState('');
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, currentView]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowHistoryPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const getStatusIcon = (status: ProjectAction['status']) => {
    const circleClass = "w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-sm flex-shrink-0 transition-all";
    switch (status) {
      case 'perfect':
        return (
          <div className={`${circleClass} bg-green-500/10 border-green-500 text-green-500`} title="Industry Standard: Perfect">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`${circleClass} bg-yellow-500/10 border-yellow-500 text-yellow-500 animate-pulse`} title="Standard Violation: Warning">
            <span className="font-black text-sm">!</span>
          </div>
        );
      case 'critical':
        return (
          <div className={`${circleClass} bg-red-500/10 border-red-500 text-red-500`} title="Governance Failure: Critical">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col h-full glass-panel w-full md:w-[450px] lg:w-[500px] transition-all duration-300 relative ${theme === 'light' ? 'text-slate-900 border-black/10 bg-white/40' : 'text-white border-white/10 bg-black/60'}`}>
      
      {/* Action History Popup */}
      {showHistoryPopup && (
        <div ref={popupRef} className="absolute left-[102%] top-20 w-[350px] bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl z-[100] animate-in fade-in slide-in-from-left-4 duration-200 p-1">
          <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">System Events Timeline</h4>
            <button onClick={() => setShowHistoryPopup(false)} className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-1 rounded">ESC</button>
          </div>
          <div className="max-h-[500px] overflow-auto py-1">
            {actionHistory.slice(0, 10).map((action) => (
              <div key={action.id} className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex gap-3 group border-b border-black/5 dark:border-white/5 last:border-0">
                <div className="pt-1">{getStatusIcon(action.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono-code font-bold opacity-40">#{action.id}</span>
                    <span className="text-[9px] opacity-40 font-mono-code">{new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs font-semibold truncate mb-1">{action.description}</p>
                  <button onClick={() => onRollback(action.id)} className="text-[9px] text-blue-500 font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Rollback State</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
        <div className="cursor-pointer group" onClick={() => onViewChange('chat')}>
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 group-hover:text-blue-500 transition-colors">
            <div className="w-4 h-4 bg-blue-600 rounded-sm rotate-45"></div>
            STUDIO AI
          </h1>
          <p className="text-[9px] opacity-40 uppercase tracking-[0.2em] font-mono-code font-bold">Standard Sandbox Mode</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowExplorer(!showExplorer)} className={`p-2 transition-all ${showExplorer ? 'text-blue-500 opacity-100' : 'opacity-40 hover:opacity-100'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 7h18M3 12h18M3 17h18" strokeWidth="2" strokeLinecap="round" /></svg>
           </button>
        </div>
      </div>

      {/* File Explorer */}
      {showExplorer && (
        <div className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-3 px-2">
             <h3 className="text-[9px] font-black uppercase tracking-widest opacity-60">Sandbox Workspace</h3>
             <span className="text-[9px] opacity-40 font-mono-code">{files.length} Files</span>
          </div>
          <div className="space-y-1">
            {files.map(file => (
              <div 
                key={file.id} 
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  activeFileId === file.id ? 'bg-blue-600/10 border border-blue-500/20 text-blue-500' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[10px] font-bold ${activeFileId === file.id ? 'text-blue-500' : 'opacity-40'}`}>
                    {['javascript', 'js', 'typescript', 'ts', 'tsx'].includes(file.language.toLowerCase()) ? '</>' : '•'}
                  </span>
                  <span className={`text-xs font-mono-code truncate ${activeFileId === file.id ? 'font-bold' : ''}`}>{file.name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-10 scroll-smooth custom-scrollbar">
        {messages.map((msg) => {
          const action = msg.actionId ? actionHistory.find(a => a.id === msg.actionId) : null;
          return (
            <div key={msg.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Message Block */}
              <div className={`flex gap-4 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/5 border border-blue-500/20 text-slate-800 dark:text-slate-200' 
                    : 'bg-zinc-100/50 dark:bg-zinc-900/80 border border-black/10 dark:border-white/10'
                }`}>
                  {msg.content.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
                </div>
              </div>

              {/* Sandbox Card (Standardized Layout) */}
              {action && (
                <div className="ml-12 mb-8 animate-in zoom-in-95 duration-300">
                  <div className={`rounded-2xl border overflow-hidden shadow-2xl ${
                    theme === 'light' ? 'bg-white border-black/10' : 'bg-[#0a0a0a] border-white/5'
                  }`}>
                    {/* Sandbox Header */}
                    <div className="px-4 py-3 border-b border-inherit flex justify-between items-center bg-black/5 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sandbox Environment</span>
                        {action.isLocked && <svg className="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className="text-[9px] font-mono-code opacity-30">HEX: {action.id.toUpperCase()}</span>
                    </div>

                    {/* Sandbox Body (Code Left, Status Right) */}
                    <div className="flex items-stretch gap-4 p-4">
                      {/* Exact Code Implementation on the LEFT */}
                      <div className="flex-1 font-mono-code text-[11px] bg-black/5 dark:bg-black/50 p-4 rounded-xl border border-black/5 dark:border-white/5 max-h-60 overflow-auto whitespace-pre custom-scrollbar">
                        {action.codeSnippet || "// Initializing Sandbox..."}
                      </div>
                      
                      {/* Status Icon on the RIGHT */}
                      <div className="flex flex-col items-center justify-center gap-3 px-2">
                        {getStatusIcon(action.status)}
                        <button 
                          onClick={() => onRollback(action.id)} 
                          className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                          title="Rollback this action"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Short Phrase identifying fix or enhancement (Programmatically implemented) */}
                    <div className={`px-5 py-3 text-[10px] font-black border-t border-inherit tracking-tight ${
                      action.status === 'perfect' ? 'text-green-500 bg-green-500/5' : 'text-blue-500 bg-blue-500/5'
                    }`}>
                      {action.status === 'perfect' 
                        ? (action.enhancementSuggestion || "GOOGLE BENCHMARK: 100% PERFECT. OPTIMIZATION: CONVERT TO TAILWIND JIT FOR PERFORMANCE.") 
                        : (action.fixSuggestion || "GITHUB AUTO-FIX: RESOLVED PROTOCOL MISMATCH IN DATA PERSISTENCE LAYER.")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-4">
        
        {/* Recommendation banner above chat input */}
        {recommendation && (
          <div className={`p-3 rounded-xl border flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500 ${
            recommendation.priority === 'high' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-black/5 border-black/5'
          }`}>
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.15em] leading-tight">
               {recommendation.text}
             </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Command autonomous sandbox agent..."
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-blue-500 outline-none rounded-2xl py-4 pl-5 pr-14 text-sm transition-all shadow-inner"
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-90 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>

        <div className="flex justify-between items-center px-2">
          {/* Action Row Reordered: Theme -> Admin -> Settings -> Rollback */}
          <div className="flex items-center gap-4">
            {/* 1. Theme Toggle Button (Sun/Moon) */}
            <button onClick={onToggleTheme} className="p-1.5 opacity-40 hover:opacity-100 transition-all hover:text-blue-500" title="Switch Theme">
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              )}
            </button>

            {/* 2. Admin Button (User Circle) - Universal account control icon */}
            <button 
              onClick={() => onViewChange('admin')} 
              className={`p-1.5 transition-all ${currentView === 'admin' ? 'text-blue-500 opacity-100' : 'opacity-40 hover:opacity-100'} hover:text-red-500`}
              title="Admin Control Plane"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* 3. Settings Button (Gear) - directly to the right of the admin button */}
            <button 
              onClick={() => onViewChange('settings')} 
              className={`p-1.5 transition-all ${currentView === 'settings' ? 'text-blue-500 opacity-100' : 'opacity-40 hover:opacity-100'}`}
              title="Studio Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>

            {/* 4. Rollback Button (Circular Arrow) */}
            <button 
              onClick={() => setShowHistoryPopup(!showHistoryPopup)} 
              className={`p-1.5 transition-all hover:text-blue-500 ${showHistoryPopup ? 'text-blue-500 opacity-100' : 'opacity-40 hover:opacity-100'}`}
              title="System History Rollback"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
          <span className="text-[9px] opacity-20 font-black uppercase tracking-widest font-mono-code">GOVERNANCE: GOOGLE TAP v3</span>
        </div>
      </div>
    </div>
  );
};
