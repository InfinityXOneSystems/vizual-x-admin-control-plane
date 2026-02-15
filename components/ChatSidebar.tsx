
import React, { useState, useRef, useEffect } from 'react';
import { Message, FileData, AppView, Theme, ProjectAction, AIRecommendation } from '../types';
import { PromptLibrary } from './PromptLibrary';

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
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
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

  return (
    <div className={`flex flex-col h-full glass-panel w-full md:w-[450px] lg:w-[500px] transition-all duration-300 relative border-r ${theme === 'light' ? 'text-slate-900 border-black/10 bg-white/40' : 'text-white border-white/10 bg-black/60 shadow-[20px_0_100px_rgba(0,0,0,0.8)]'}`}>
      
      <PromptLibrary 
        isOpen={isPromptLibraryOpen} 
        onClose={() => setIsPromptLibraryOpen(false)} 
        onSelectPrompt={(p) => setInput(p)}
      />

      {/* Header */}
      <div className="p-8 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
        <div className="cursor-pointer group" onClick={() => onViewChange('chat')}>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 group-hover:text-blue-500 transition-all italic">
            <div className="w-6 h-6 bg-blue-600 rounded-sm rotate-45 shadow-2xl shadow-blue-600/40 border border-white/20"></div>
            VIZUAL X
          </h1>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.4em] font-mono-code font-black mt-1">Sovereign Flagship Hub</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsPromptLibraryOpen(true)}
             className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500 transition-all text-white hover:shadow-lg hover:shadow-blue-500/10"
             title="Prompt Core"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
           </button>
           <button onClick={() => setShowExplorer(!showExplorer)} className={`p-3 rounded-2xl border transition-all ${showExplorer ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 7h18M3 12h18M3 17h18" strokeWidth="2.5" strokeLinecap="round" /></svg>
           </button>
        </div>
      </div>

      {/* Workspace Registry */}
      {showExplorer && (
        <div className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-6 max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4 px-2">
             <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Active System Nodes</h3>
             <span className="text-[10px] opacity-40 font-mono-code">TOTAL: {files.length}</span>
          </div>
          <div className="space-y-2">
            {files.map(file => (
              <div 
                key={file.id} 
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                  activeFileId === file.id ? 'bg-blue-600/10 border-blue-500/40 text-blue-500 shadow-xl shadow-blue-500/5' : 'bg-black/20 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full ${activeFileId === file.id ? 'bg-blue-500 shadow-lg shadow-blue-500/40' : 'bg-white/10'}`}></div>
                  <span className={`text-xs font-mono-code truncate ${activeFileId === file.id ? 'font-black' : 'font-medium opacity-60'}`}>{file.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sovereign Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-12 scroll-smooth custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className={`flex gap-6 mb-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-[10px] uppercase border ${msg.role === 'user' ? 'bg-blue-600 text-white border-blue-400 shadow-2xl shadow-blue-600/40' : 'bg-zinc-800 text-zinc-400 border-white/5'}`}>
                {msg.role === 'user' ? 'USR' : 'VIX'}
              </div>
              <div className={`max-w-[85%] p-7 rounded-3xl text-[13px] leading-relaxed font-medium ${
                msg.role === 'user' 
                  ? 'bg-blue-600/5 border border-blue-500/20 text-slate-800 dark:text-slate-200' 
                  : 'bg-zinc-100/50 dark:bg-zinc-900/80 border border-black/10 dark:border-white/10 shadow-2xl'
              }`}>
                {msg.content && msg.content.split('\n').map((line, i) => <p key={i} className="mb-3 last:mb-0">{line}</p>)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-6 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5"></div>
            <div className="flex-1 h-20 bg-zinc-900/80 rounded-3xl border border-white/10"></div>
          </div>
        )}
      </div>

      {/* Global Navigation Hub */}
      <div className="p-8 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-6">
        
        {recommendation && (
          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center gap-5 animate-in slide-in-from-bottom-4 duration-500 shadow-xl shadow-blue-500/5">
             <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
             <p className="text-[11px] font-black uppercase tracking-widest leading-snug">{recommendation.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="System Command Orchestrator..."
            className="w-full bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-blue-500 outline-none rounded-3xl py-6 pl-8 pr-20 text-sm transition-all shadow-inner font-bold"
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-blue-600 text-white shadow-2xl shadow-blue-600/50 active:scale-90 transition-transform disabled:opacity-30">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>

        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-5">
            {[
              { id: 'chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', title: 'Interface' },
              { id: 'pipeline', icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Recursive Pipeline' },
              { id: 'preview', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', title: 'Sovereign Preview' },
              { id: 'admin', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', title: 'Infra Control' },
              { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', title: 'Vertex Console' },
            ].map(nav => (
              <button 
                key={nav.id} 
                onClick={() => onViewChange(nav.id as AppView)} 
                className={`p-1.5 transition-all hover:text-blue-500 hover:scale-125 ${currentView === nav.id ? 'text-blue-500 scale-125' : 'opacity-40 hover:opacity-100'}`}
                title={nav.title}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={nav.icon} />
                </svg>
              </button>
            ))}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.6em] opacity-20 font-mono-code italic">VIZUAL-X V5.2 SOVEREIGN</div>
        </div>
      </div>
    </div>
  );
};
