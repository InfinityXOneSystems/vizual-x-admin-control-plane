
import React from 'react';
import { Recommendation, TaskResult } from '../types';

interface IntelligenceHubProps {
  recommendations: Recommendation[];
  results: TaskResult[];
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ recommendations, results }) => {
  return (
    <div className="flex-1 p-12 overflow-y-auto bg-black custom-scrollbar animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Market Feed */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter italic leading-none mb-2">Passive Signals</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 electric-text">24/7 Intelligence Scrape Ingested</p>
            </div>
            <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-[18px] text-[10px] font-black uppercase tracking-widest italic">Force Refresh</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-10 bg-white/5 border border-white/10 rounded-[48px] shadow-4xl backdrop-blur-3xl hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 electric-text text-[10px] font-black uppercase tracking-widest italic">{rec.source}</div>
                  <div className="text-xl font-black italic">{rec.confidence}%</div>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 italic leading-tight">{rec.title}</h4>
                <p className="text-[11px] opacity-30 font-medium leading-relaxed mb-10 italic">{rec.prediction}</p>
                <div className="flex gap-4">
                  <button className="flex-1 py-4 electric-gradient rounded-[22px] text-[10px] font-black uppercase tracking-widest text-white italic shadow-glow">Execute Trade</button>
                  <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-[22px] text-[10px] font-black uppercase tracking-widest italic">Simulation</button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-12 bg-white/5 border border-white/10 rounded-[56px] shadow-4xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--electric-blue-hex) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            <div className="relative z-10 text-center">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Auto-Scheduler Tasking</h3>
              <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.4em] mb-10 italic">Executive AI synthesizing daily business growth objectives</p>
              <div className="space-y-4 max-w-xl mx-auto">
                {['Synthesize Real Estate zoning report for Austin, TX', 'Audit Crypto Whale movements on SolScan', 'Generate React logic for new SaaS Landing Page'].map((task, i) => (
                  <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-[24px] flex justify-between items-center group hover:border-blue-500/50 transition-all">
                    <span className="text-[11px] font-bold italic opacity-70">{task}</span>
                    <span className="text-[9px] font-black electric-text uppercase tracking-widest">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task Results Sidebar */}
        <div className="space-y-10">
          <h3 className="text-xl font-black uppercase tracking-widest opacity-30 italic px-4">Instant Results</h3>
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="p-10 text-center border border-white/5 rounded-[40px] opacity-10 italic text-[11px] uppercase tracking-widest">Awaiting Command Execution...</div>
            ) : (
              results.map(res => (
                <div key={res.id} className="p-8 bg-zinc-950 border border-white/10 rounded-[40px] shadow-4xl animate-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black electric-text uppercase italic">{res.agentName}</span>
                    <span className="text-[9px] opacity-20 font-mono-code">{res.startTime} - {res.endTime}</span>
                  </div>
                  <p className="text-[11px] font-bold opacity-70 leading-relaxed italic mb-8">{res.summary}</p>
                  <button className="w-full py-4 bg-white/5 border border-white/10 rounded-[22px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic">View in Workspace Docs</button>
                </div>
              ))
            )}
          </div>

          <div className="p-10 bg-blue-600/5 border border-blue-500/20 rounded-[48px] shadow-glow text-center">
            <h4 className="text-sm font-black uppercase tracking-widest electric-text mb-4 italic">Cluster Efficiency</h4>
            <div className="text-4xl font-black italic mb-4">99.8%</div>
            <p className="text-[9px] font-black opacity-20 uppercase tracking-[0.3em] italic">Parallelizing 10 Sovereign Agents</p>
          </div>
        </div>
      </div>
    </div>
  );
};
