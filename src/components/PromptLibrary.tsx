
import React from 'react';
import { PromptTemplate } from '../types';

const MASTER_PROMPTS: PromptTemplate[] = [
  {
    id: 'architect',
    title: 'Flagship System Architect',
    category: 'System',
    icon: '🏗️',
    content: 'Programmatically optimize the Google Cloud infrastructure. Leverage Global Load Balancers, Cloud Run, and Vertex AI to ensure 100% operational efficiency following Google Best SOPs.'
  },
  {
    id: 'developer',
    title: 'Monaco E2E Developer',
    category: 'Dev',
    icon: '💻',
    content: 'Implement full-stack React components and Node.js microservices. Prioritize Monaco editor standards, TypeScript type safety, and efficient data persistence with PostgreSQL.'
  },
  {
    id: 'media',
    title: 'Autonomous Media Engine',
    category: 'Creative',
    icon: '🎬',
    content: 'Generate high-fidelity assets using Veo and Imagen. Optimize aspect ratios for multi-channel deployment (16:9, 9:16) and ensure creative coherence across the Vizual X ecosystem.'
  },
  {
    id: 'trader',
    title: 'Predictive Trade Analyst',
    category: 'Analysis',
    icon: '📊',
    content: 'Run high-concurrency paper trading simulations. Sync with BigQuery datasets for real-time market prediction and autonomous risk assessment.'
  }
];

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-zinc-950 rounded-3xl p-1 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Electric Silver Gradient Border */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none border-[1px] border-transparent bg-gradient-to-br from-slate-200 via-slate-400 to-slate-200 opacity-40"></div>
        
        <div className="relative bg-zinc-950 rounded-[22px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white">PROMPT LIBRARY</h3>
              <p className="text-[10px] opacity-40 font-mono-code uppercase tracking-widest mt-1">Vizual X Master Command Hub</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
            {MASTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => { onSelectPrompt(prompt.content); onClose(); }}
                className="w-full text-left p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all group flex items-start gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {prompt.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-sm text-white uppercase tracking-tight">{prompt.title}</h4>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full uppercase">{prompt.category}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">{prompt.content}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 text-center bg-white/5">
             <p className="text-[9px] opacity-20 font-mono-code uppercase tracking-[0.4em]">Proprietary Vizual X Logic Engines Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
