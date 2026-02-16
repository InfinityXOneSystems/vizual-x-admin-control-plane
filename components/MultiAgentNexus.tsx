import React, { useState, useEffect, useRef } from 'react';
import { Agent, Message, WorkflowStep } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

export const MultiAgentNexus: React.FC<{ agents: Agent[], setAgents?: any }> = ({ agents, setAgents }) => {
  const [activeThread, setActiveThread] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeThread]);

  const handleManualInbound = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input;
    setInput('');
    setIsProcessing(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() };
    setActiveThread(prev => [...prev, userMsg]);

    try {
      const responseStream = await sendMessageToGemini(userText, activeThread.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })), { 
        useSearch, useMaps, thinking: thinkingMode,
        aiModel: thinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview'
      });

      const assistantId = 'ai-' + Date.now();
      setActiveThread(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

      let fullText = '';
      for await (const chunk of responseStream) {
        fullText += chunk.text;
        setActiveThread(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m));
      }
    } catch (error) { console.error(error); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-absolute)] overflow-hidden animate-in fade-in duration-700">
      <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--surface-primary)]">
        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">NEXUS TERMINAL</h3>
        <div className="flex items-center gap-4">
           <button onClick={() => setThinkingMode(!thinkingMode)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${thinkingMode ? 'bg-[#1E90FF] text-white border-blue-400' : 'border-white/20 opacity-40'}`}>Deep Reasoning</button>
           <button onClick={() => {setUseSearch(!useSearch); setUseMaps(false);}} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${useSearch ? 'bg-[#2AF5FF] text-black border-white' : 'border-white/20 opacity-40'}`}>Google Search</button>
           <button onClick={() => {setUseMaps(!useMaps); setUseSearch(false);}} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${useMaps ? 'bg-[#2AF5FF] text-black border-white' : 'border-white/20 opacity-40'}`}>Google Maps</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--bg-absolute)] custom-scrollbar" ref={scrollRef}>
        {activeThread.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
             <div className={`max-w-[85%] p-6 rounded-xl border-[0.5px] shadow-2xl ${msg.role === 'user' ? 'bg-[#0A0F14] border-[#1E90FF] text-[#C8D2DC]' : 'bg-[#05070A] border-white/20 text-[#C8D2DC]'}`}>
                <p className="text-[14px] leading-relaxed font-bold whitespace-pre-wrap">{msg.content || '...'}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-[var(--surface-primary)] border-t border-[var(--border-color)]">
        <form onSubmit={handleManualInbound} className="relative flex items-end gap-4">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="INPUT DIRECTIVE..." disabled={isProcessing} className="flex-1 bg-black border-[0.5px] border-white/30 rounded-xl p-5 pr-16 text-sm font-bold min-h-[100px] outline-none focus:border-[#2AF5FF] transition-all text-white placeholder:text-white/20 shadow-inner resize-none" />
          <button type="submit" disabled={isProcessing || !input.trim()} className="absolute right-3 bottom-3 w-12 h-12 futuristic-btn flex items-center justify-center">
            {isProcessing ? <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>}
          </button>
        </form>
      </div>
    </div>
  );
};