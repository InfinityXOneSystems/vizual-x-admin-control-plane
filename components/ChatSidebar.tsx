import React, { useState, useRef, useEffect } from 'react';
import { Message, Agent, Recommendation } from '../types';

interface ChatSidebarProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  agents: Agent[];
  selectedAgentIds: string[];
  onAgentToggle: (id: string) => void;
  onSelectAllAgents: () => void;
  recommendations: Recommendation[];
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  messages, onSendMessage, isLoading, agents, selectedAgentIds, onAgentToggle, onSelectAllAgents, recommendations, isDarkMode, setIsDarkMode 
}) => {
  const [input, setInput] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const getActiveAgents = () => agents.filter(a => selectedAgentIds.includes(a.id));

  const formatContent = (content: string) => {
    let processed = content.replace(/^\s*[\-\*\u2022]\s+(.*)$/gm, '<div class="flex items-start gap-4 mb-5 group/bullet"><span class="neon-green-text mt-1 text-[11px] font-black select-none group-hover/bullet:scale-125 transition-transform">▶</span><span class="flex-1 leading-relaxed">$1</span></div>');
    processed = processed.replace(/\[UI_UPDATE:.*?\]/g, '');
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-white">$1</span>');
    return processed;
  };

  return (
    <div className="flex flex-col h-full w-full lg:w-[440px] glass-panel z-50 overflow-hidden shrink-0 relative lg:border-r border-white/5">
      <div className="absolute top-0 left-0 w-full h-1 electric-gradient opacity-30"></div>
      
      <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
        <div className="flex flex-col">
          <h1 className="text-lg lg:text-xl font-black tracking-widest flex items-center gap-3 italic">
            <span className="w-2 h-2 rounded-full electric-gradient electric-glow animate-pulse"></span>
            MASTER INGRESS
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20 mt-1">Sovereign Cluster Ingress</p>
        </div>
        <div className="flex -space-x-1.5">
          {getActiveAgents().map(a => (
            <div 
              key={a.id} 
              title={`${a.name} (${a.industry})`}
              className={`w-7 h-7 rounded-full border border-black ${a.avatarColor} shadow-glow flex items-center justify-center text-[10px] font-bold overflow-hidden cursor-help group transition-transform hover:scale-125 hover:z-50`}
            >
              <div className="w-1 h-1 bg-black rounded-full opacity-40"></div>
            </div>
          ))}
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/40"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="space-y-6 py-4">
            {recommendations.sort((a,b) => b.priority - a.priority).map(rec => (
              <div key={rec.id} className="p-6 assistant-message rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-700 hover:neon-border-green transition-all cursor-pointer group" onClick={() => onSendMessage(rec.action)}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[8px] font-black uppercase tracking-widest electric-text opacity-70 italic">{rec.source}</span>
                  <div className="flex gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${i < (rec.priority/2) ? 'bg-blue-500 shadow-glow' : 'bg-white/10'}`}></div>
                    ))}
                  </div>
                </div>
                <h4 className="text-sm font-black uppercase italic tracking-tight mb-2 leading-snug group-hover:neon-green-text transition-colors">{rec.title}</h4>
                <p className="text-[10px] opacity-40 mb-4 font-medium leading-relaxed italic">{rec.prediction}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black neon-green-text tracking-widest italic uppercase">Engage Protocol</span>
                  <svg className="w-3 h-3 opacity-20 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {messages.map((msg) => {
          const agent = agents.find(a => a.id === msg.agentId) || agents[0];
          const isUser = msg.role === 'user';
          
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div 
                className={`max-w-[95%] p-5 lg:p-6 rounded-[28px] text-[13px] leading-relaxed font-bold shadow-xl border ${
                  isUser ? 'user-message text-white/90 italic' : 'assistant-message text-white/80'
                }`}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
              <div className="mt-3 px-3 flex items-center gap-2 opacity-30">
                {!isUser && <div className={`w-1.5 h-1.5 rounded-full ${agent.avatarColor} shadow-glow`}></div>}
                <span className="text-[8px] font-black uppercase tracking-widest italic">
                  {isUser ? 'Operator' : `${agent.name}`}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 assistant-message rounded-2xl w-max animate-pulse">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-30 italic">Thinking...</span>
          </div>
        )}
      </div>

      <div className="p-4 lg:p-6 border-t border-white/5 bg-black/40 backdrop-blur-md relative">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-3 mb-4">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              placeholder="Sovereign Command..."
              rows={1}
              className="w-full monaco-style-input rounded-[22px] py-4 px-6 text-[13px] transition-all resize-none overflow-hidden font-mono-code tracking-tight italic text-white/90 placeholder:text-white/10"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button type="submit" disabled={!input.trim() || isLoading} className="p-4 neon-green-gradient text-white rounded-[18px] shadow-glow-green active:scale-90 transition-all disabled:opacity-20">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>

        {/* Control Buttons Group */}
        <div className="flex items-center justify-between px-2 gap-2">
           <div className="flex gap-2">
              <button onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Theme" className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                {isDarkMode ? '🌙' : '☀️'}
              </button>
              <button onClick={() => window.location.reload()} title="Refresh Cluster" className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
              <button title="Settings" className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" /></svg>
              </button>
           </div>
           <button className="px-6 py-2 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] electric-text transition-all italic">
              Master Admin
           </button>
        </div>
      </div>
    </div>
  );
};
