
import React, { useState, useRef, useEffect } from 'react';
import { Message, Agent, Recommendation } from '../types';

interface ChatSidebarProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  agents: Agent[];
  selectedAgentIds: string[];
  onAgentToggle: (id: string) => void;
  // Added missing onSelectAllAgents prop
  onSelectAllAgents: () => void;
  recommendations: Recommendation[];
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  messages, onSendMessage, isLoading, agents, selectedAgentIds, onAgentToggle, onSelectAllAgents, recommendations 
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

  return (
    <div className="flex flex-col h-full w-[480px] bg-black/40 backdrop-blur-3xl border-r border-white/10 z-50 overflow-hidden shrink-0">
      <div className="p-10 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-4">
          <div className="w-5 h-5 electric-gradient rounded-full animate-pulse shadow-glow"></div>
          VIZUAL X
        </h1>
        <div className="flex -space-x-2">
          {agents.filter(a => selectedAgentIds.includes(a.id)).map(a => (
            <div key={a.id} className={`w-8 h-8 rounded-full border-2 border-black ${a.avatarColor} shadow-glow`}></div>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Passive Intelligence Ingestion</h3>
            {recommendations.map(rec => (
              <div key={rec.id} className="p-8 bg-white/5 border border-white/10 rounded-[40px] shadow-2xl animate-in fade-in duration-1000">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest electric-text italic">{rec.source}</span>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{rec.confidence}% Match</span>
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tight mb-2 leading-none">{rec.title}</h4>
                <p className="text-[11px] opacity-40 mb-6 font-medium leading-relaxed italic">{rec.prediction}</p>
                <button className="w-full py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic">{rec.action}</button>
              </div>
            ))}
          </div>
        )}

        {messages.map((msg) => {
          const agent = agents.find(a => a.id === msg.agentId) || agents[0];
          return (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-6 rounded-[32px] text-[13px] leading-relaxed ${
                msg.role === 'user' ? 'electric-gradient text-white border border-white/20 italic font-bold shadow-4xl' : 'bg-white/[0.03] border border-white/10 text-white/90 font-medium'
              }`}>
                {msg.content}
              </div>
              <div className="mt-4 px-4 flex items-center gap-3">
                <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] italic">
                  {msg.role === 'user' ? 'Operator' : `${agent.name} / ${agent.industry}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 border-t border-white/10 bg-black/60 relative">
        {showSelector && (
          <div className="absolute bottom-full left-8 right-8 mb-4 p-6 bg-zinc-950 border border-white/10 rounded-[40px] shadow-4xl animate-in slide-in-from-bottom-4 duration-300 z-50">
            <div className="flex justify-between items-center mb-6 px-4">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Select Super Specialists</span>
              {/* Fixed reference to missing setSelectedAgentIds by using onSelectAllAgents prop */}
              <button onClick={onSelectAllAgents} className="text-[10px] font-black electric-text uppercase tracking-widest italic">Select All</button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar p-2">
              {agents.map(agent => (
                <button 
                  key={agent.id}
                  onClick={() => onAgentToggle(agent.id)}
                  className={`p-4 rounded-[22px] border transition-all flex items-center gap-4 ${
                    selectedAgentIds.includes(agent.id) ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-white/5 opacity-50'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${agent.avatarColor}`}></div>
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] font-black uppercase truncate">{agent.name}</p>
                    <p className="text-[8px] opacity-40 uppercase tracking-widest">{agent.industry}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => setShowSelector(!showSelector)}
            className="p-5 bg-white/5 border border-white/10 rounded-[24px] text-white/20 hover:text-white transition-all shadow-inner"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth="2.5" /></svg>
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              placeholder="Assign Specialist Command..."
              rows={1}
              className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500/50 outline-none rounded-[32px] py-6 px-8 text-sm transition-all resize-none overflow-hidden font-bold tracking-tight italic shadow-inner"
            />
          </div>
          <button type="submit" disabled={!input.trim() || isLoading} className="p-5 electric-gradient text-white rounded-[24px] shadow-2xl shadow-blue-600/50 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};