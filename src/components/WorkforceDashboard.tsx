
import React, { useState, useEffect } from 'react';
import { Agent } from '../types';

interface WorkforceDashboardProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

export const WorkforceDashboard: React.FC<WorkforceDashboardProps> = ({ agents, setAgents }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        // Shadow browser should often look busy
        const isShadow = agent.id === 'shadow';
        const trigger = Math.random() > (isShadow ? 0.3 : 0.8);
        if (!trigger) return agent;

        const loads = [5, 12, 28, 45, 78, 92];
        const newLoad = loads[Math.floor(Math.random() * loads.length)];
        
        const logs = [
          `[INTEL] Cross-agent normalization complete.`,
          `[SYNC] Local Ollama node responding in 12ms.`,
          `[OPS] Initializing Shadow Browser parallel threads...`,
          `[ML] Vertex AI predicting industry shift in SaaS...`,
          `[AGENT] Inter-agent collaboration handshake: ACTIVE.`,
          `[SOVEREIGN] Intelligence loop persistent.`,
          `[BROWSER] Scroll pattern ingested from LinkedIn.`,
          `[BROWSER] Autonomous account setup: COMPLETED.`
        ];

        return {
          ...agent,
          load: newLoad,
          logs: [...agent.logs.slice(-12), logs[Math.floor(Math.random() * logs.length)]]
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [setAgents]);

  return (
    <div className="flex-1 p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-1000 bg-black">
      <div className="mb-16 flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">Parallel Workforce</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 electric-text">Multi-Agent Autonomous Sovereign Team</p>
        </div>
        <div className="flex gap-4">
           <div className="px-8 py-3 bg-white/5 border border-white/10 rounded-[22px] flex items-center gap-4 shadow-2xl backdrop-blur-3xl">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Cluster Health</span>
              <span className="text-sm font-black electric-text italic tracking-tighter">OPTIMAL</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {agents.map((agent) => (
          <div key={agent.id} className="p-12 bg-white/5 border border-white/10 rounded-[40px] shadow-4xl backdrop-blur-3xl transition-all hover:border-blue-500/30 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity">
               <svg className="w-24 h-24 text-white/5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" /></svg>
            </div>
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-8">
                <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center border border-white/10 ${agent.status !== 'idle' ? 'electric-gradient text-white shadow-[0_0_25px_rgba(0,102,255,0.4)]' : 'bg-white/5 text-white/10 opacity-30'}`}>
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                   </svg>
                </div>
                <div>
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter italic leading-none mb-3">{agent.name}</h3>
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 italic">{agent.role}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <span className={`text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest border transition-all ${
                   agent.status === 'idle' ? 'bg-white/5 border-white/10 opacity-20' : 'bg-blue-500/20 border-blue-500/40 electric-text shadow-glow'
                 }`}>
                   {agent.status}
                 </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Node Compute</span>
                        <span className="text-xs font-black italic tracking-tighter electric-text">{agent.load}% UTIL</span>
                     </div>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div className="h-full electric-gradient transition-all duration-1000 shadow-glow" style={{ width: `${agent.load}%` }}></div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Capabilities</span>
                     <div className="flex flex-wrap gap-2">
                        {agent.capabilities.map(cap => (
                           <span key={cap} className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity italic">{cap}</span>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-8 bg-black/60 border border-white/5 rounded-[32px] h-[240px] flex flex-col shadow-inner">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20 italic mb-6 border-b border-white/5 pb-2">Autonomous Context stream</span>
                  <div className="flex-1 font-mono-code text-[10px] overflow-y-auto custom-scrollbar space-y-3 opacity-60">
                     {agent.logs.length === 0 ? (
                       <p className="italic opacity-10">Initializing ingestion...</p>
                     ) : (
                       agent.logs.map((log, i) => (
                         <div key={i} className="animate-in slide-in-from-left-2 duration-300">
                           <span className="text-white/10 mr-3">[{i.toString().padStart(2, '0')}]</span>
                           <span className={log.includes('[SOVEREIGN]') || log.includes('[BROWSER]') ? 'electric-text font-bold' : ''}>{log}</span>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>

            <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center relative z-10">
               <div className="flex-1 pr-10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-2 italic">Active Recursive Logic</p>
                  <p className="text-[11px] font-black tracking-tight opacity-70 italic leading-snug">{agent.task}</p>
               </div>
               <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 hover:electric-text transition-all italic">Override</button>
                  <button className="p-3 bg-white/5 border border-white/10 rounded-[18px] hover:bg-white/10 transition-colors">
                     <svg className="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
