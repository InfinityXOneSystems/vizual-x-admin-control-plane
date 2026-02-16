
import React from 'react';
import { Recommendation, TaskResult } from '../types';

interface IntelligenceHubProps {
  recommendations: Recommendation[];
  results: TaskResult[];
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ recommendations, results }) => {
  return (
    <div className="flex-1 p-6 lg:p-16 overflow-y-auto bg-black custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-6xl mx-auto space-y-20">
        
        <section className="space-y-12">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">Cluster</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 neon-green-text italic">Global Sovereign Performance // Node: PRIMARY-X</p>
              </div>
              <div className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-[30px] silver-border-glow shadow-glow-green">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Inhalation Cycle Synchronized</span>
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Scrape Rate', value: '1.4k/s', icon: '🌩️' },
                { label: 'Sync Health', value: 'Optimal', icon: '⚡' },
                { label: 'Vertex Load', value: '14%', icon: '🧠' },
                { label: 'Ingress Lag', value: '8ms', icon: '📡' }
              ].map((metric, i) => (
                <div key={i} className="p-10 glass-panel rounded-[40px] hover:scale-105 transition-transform group silver-border-glow shadow-2xl bg-white/[0.01]">
                   <p className="text-[10px] font-black opacity-30 tracking-[0.3em] uppercase mb-6 italic">{metric.label}</p>
                   <p className="text-4xl font-black italic tracking-tighter leading-none">{metric.value}</p>
                </div>
              ))}
           </div>
        </section>

        <section className="p-12 glass-panel rounded-[60px] silver-border-glow bg-black/40">
           <div className="flex justify-between items-center mb-16">
              <h3 className="text-3xl font-black italic uppercase tracking-widest italic">Recursive Logic Matrix</h3>
              <span className="text-[10px] font-black opacity-20 uppercase tracking-widest italic">ML Feedback Loop Active</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Industry Intelligence Normalized</h4>
                 <div className="space-y-6">
                    {['SaaS Tech', 'Global Fintech', 'Renewable Energy', 'AI Logistics'].map((sector, i) => (
                      <div key={sector} className="flex justify-between items-center p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                         <span className="text-[11px] font-black uppercase italic">{sector}</span>
                         <span className="text-[10px] font-mono-code neon-green-text italic">Ingested</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="p-12 bg-white/[0.03] border border-white/5 rounded-[50px] flex flex-col items-center justify-center text-center space-y-6 shadow-inner">
                 <span className="text-7xl opacity-10">🔮</span>
                 <p className="text-sm font-black uppercase tracking-[0.6em] opacity-40 italic">Vertex AI Simulation</p>
                 <p className="text-[10px] font-black neon-green-text animate-pulse italic">Predicting industry disruption in 48h...</p>
                 <button className="mt-6 px-10 py-4 glass-panel border-white/20 rounded-[25px] text-[10px] font-black uppercase italic tracking-widest hover:neon-green-text transition-all">Engage Prediction</button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};
