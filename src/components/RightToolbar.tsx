import React from 'react';
import { CreatorTool } from '../types';

interface RightToolbarProps {
  activeTool: CreatorTool;
  setActiveTool: (tool: CreatorTool) => void;
  onIdeaGenerated: (idea: string) => void;
}

const TOOL_CATEGORIES = [
  { id: 'business', icon: '💼', label: 'Business Tools', description: 'Blueprints & Strategy' },
  { id: 'financial', icon: '📊', label: 'Financial Hub', description: 'ROI & Forecasting' },
  { id: 'creative', icon: '🎨', label: 'Creative Suite', description: 'Video, Image, Music' },
  { id: 'builder', icon: '🤖', label: 'Agent Builder', description: 'Sculpt Logic Nodes' },
];

export const RightToolbar: React.FC<RightToolbarProps> = ({ activeTool, setActiveTool, onIdeaGenerated }) => {
  return (
    <aside className="hidden xl:flex w-72 h-full glass-panel flex-col border-l border-white/5 bg-black/40 backdrop-blur-3xl z-40 overflow-hidden">
      <div className="p-8 border-b border-white/5">
         <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Cluster Tools</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="space-y-4">
           {TOOL_CATEGORIES.map(cat => (
             <button 
               key={cat.id}
               onClick={() => setActiveTool(cat.id as any)}
               className={`w-full p-6 rounded-[28px] border transition-all text-left flex items-start gap-4 hover-neon group ${
                 activeTool === cat.id ? 'neon-bg-green neon-green-text' : 'bg-white/5 border-white/5'
               }`}
             >
               <span className="text-2xl mt-1">{cat.icon}</span>
               <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest mb-1">{cat.label}</span>
                  <span className="text-[9px] font-medium opacity-40 uppercase tracking-tighter italic leading-none">{cat.description}</span>
               </div>
             </button>
           ))}
        </div>

        <div className="h-px bg-white/5 w-full my-8"></div>

        <div className="space-y-6">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic px-2">Auto Ideas</span>
           {[
             'Autonomous Marketing Hub',
             'Predictive Trade Signal',
             'Global Node Optimization'
           ].map((idea, i) => (
             <button 
               key={i}
               onClick={() => onIdeaGenerated(idea)}
               className="w-full p-5 bg-white/5 border border-white/5 rounded-[24px] text-left hover:border-blue-500/50 hover:bg-white/10 transition-all group"
             >
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[8px] font-black electric-text uppercase italic tracking-widest">Recommendation</span>
                   <div className="w-1 h-1 rounded-full bg-blue-500 shadow-glow"></div>
                </div>
                <p className="text-[10px] font-black uppercase italic tracking-tight opacity-60 group-hover:opacity-100">{idea}</p>
             </button>
           ))}
        </div>

        <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] text-center border-dashed border-white/10 mt-12">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20 italic">Auto-Recommender Active</span>
            <div className="flex justify-center gap-1 mt-4">
               {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 rounded-full electric-gradient animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
            </div>
        </div>
      </div>
      
      <div className="p-8 border-t border-white/5 bg-white/[0.01] text-center">
         <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20 italic">Cluster Node ID: VIX-992-B</p>
      </div>
    </aside>
  );
};