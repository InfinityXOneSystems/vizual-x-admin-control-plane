
import React, { useState, useRef, useEffect } from 'react';
import { Message, UIConfiguration } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatSidebarProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onSystemUpdate: (update: Partial<UIConfiguration>) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  messages, 
  setMessages, 
  onSystemUpdate, 
  isLoading, 
  setIsLoading, 
  isCollapsed 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: userText, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);
    try {
      const systemInstruction = `You are the VIZUAL X OUTCOME COMPILER. 
      Your task is to convert operator commands into structured system updates.
      If the user wants to change appearance (color, font, background), 
      your response should include a JSON block matching the UIConfiguration type.
      
      Structure: { "systemUpdate": { "primaryColor": "#HEX", "fontFamily": "Inter" }, "text": "Confirmation message" }
      
      Stay concise. Professional enterprise tone only.`;

      const responseStream = await sendMessageToGemini(userText, messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })), { systemInstruction });

      const assistantId = 'ai-' + Date.now();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      let fullText = '';
      for await (const chunk of responseStream) {
        fullText += chunk.text;
        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, content: fullText } : m
        ));
      }

      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          if (data.systemUpdate) {
            onSystemUpdate(data.systemUpdate);
          }
        } catch (e) {}
      }

    } catch (error) {
      console.error("System handshake failure:", error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'system',
        content: "Execution interrupted.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCollapsed) return null;

  return (
    <div className="h-full flex flex-col p-6 bg-[var(--surface-primary)] border-r-[0.5px] border-[var(--border-color)] animate-in slide-in-from-left duration-300 overflow-hidden">
      <div className="mb-8">
        {/* FIX: Changed VIZUAL X to Vizual X and removed uppercase class */}
        <h2 className="text-xl font-black tracking-tighter text-[var(--text-primary)]">Vizual X</h2>
        <div className="h-1 w-10 bg-[#2AF5FF] mt-1"></div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2 mb-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2AF5FF] mb-1">
              {msg.role === 'user' ? 'OPERATOR' : 'COMPILER'}
            </span>
            <div className={`p-4 rounded-xl text-[13px] leading-relaxed border-[0.5px] max-w-full font-bold shadow-2xl ${
              msg.role === 'user' 
                ? 'bg-[var(--surface-secondary)] border-[#1E90FF] text-[var(--text-primary)]' 
                : 'bg-black dark:bg-black border-[var(--border-color)] text-white'
            }`}>
              {msg.content.replace(/\{[\s\S]*\}/, '').trim()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 px-2">
            <div className="w-2 h-2 bg-[#2AF5FF] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#2AF5FF] rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-[#2AF5FF] rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="w-full bg-black border-[0.5px] border-white/40 rounded-xl p-5 pr-14 text-sm font-bold outline-none focus:border-[#2AF5FF] transition-all resize-none text-white placeholder:text-white/40 min-h-[100px] shadow-inner"
          placeholder="ENTER COMMAND..."
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-3 bottom-3 w-10 h-10 futuristic-btn flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};
