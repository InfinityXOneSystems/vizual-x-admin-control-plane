
import React from 'react';
import { Agent, PageNode } from '../types';

interface MCPProps {
  agents: Agent[];
  onNavigate: (page: PageNode) => void;
}

export const MasterControlProgram: React.FC<MCPProps> = ({ agents, onNavigate }) => {
  const activeAgents = agents.filter(a => a.status !== 'idle');
  const systemLoad = agents.reduce((acc, a) => acc + a.load, 0) / agents.length;

  const quickAccessModules = [
    { id: 'pipeline', label: 'Pipeline Orchestrator', icon: '🚀', description: 'Design E2E business logic.' },
    { id: 'creator', label: 'Creator Hub', icon: '🎨', description: 'Multi-modal asset synthesis.' },
    { id: 'matrix', label: 'Ingestion Matrix', icon: '🧠', description: 'Monitor live data scraping.' },
    { id: 'comms', label: 'Comms Hub', icon: '📞', description: 'Live call analysis & sync.' },
  ];

  return (
    <div className="h-full w-full bg-black p-10 lg:p-12 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-12">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Master Control Program</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-2 italic">Sovereign Command &amp; Control</p>
          </div>
          <div className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-[30px] silver-border-glow shadow-glow-green">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-widest italic">All Systems Autonomous</span>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 p-10 bg-[#05070A] border border-white/5 rounded-[40px] space-y-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-widest">Agent Workforce</h3>
                  <p className="text-xs opacity-40 mt-1">Live status of parallel agent cluster.</p>
                </div>
                <div className="flex items-end justify-between">
                    <div className="flex -space-x-4">
                        {agents.slice(0, 5).map(agent => (
                            <div key={agent.id} className={`${agent.avatarColor} w-16 h-16 rounded-full border-2 border-black flex items-center justify-center text-white font-bold text-lg`}>
                                {agent.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => onNavigate('builder')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:text-blue-400 hover:border-blue-400 transition-all">
                        Manage Workforce
                    </button>
                </div>
            </div>

            <div className="p-10 bg-[#05070A] border border-white/5 rounded-[40px] text-center space-y-4 flex flex-col justify-center">
                <p className="text-6xl font-black italic">{systemLoad.toFixed(0)}<span className="text-3xl opacity-30">%</span></p>
                <p className="text-sm font-bold uppercase tracking-widest opacity-30">Total Cluster Load</p>
            </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickAccessModules.map(mod => (
                <button 
                    key={mod.id}
                    onClick={() => onNavigate(mod.id as PageNode)}
                    className="p-8 bg-[#05070A] border border-white/5 rounded-[32px] hover:border-blue-500/40 transition-all group text-left space-y-10"
                >
                    <span className="text-4xl">{mod.icon}</span>
                    <div>
                        <h4 className="text-lg font-black uppercase tracking-wider">{mod.label}</h4>
                        <p className="text-xs opacity-40 mt-1">{mod.description}</p>
                    </div>
                </button>
            ))}
        </section>

        <section className="p-10 bg-[#05070A] border border-white/5 rounded-[40px]">
             <h3 className="text-2xl font-black italic uppercase tracking-widest mb-8">System Pulse</h3>
             <div className="h-64 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <p className="text-sm font-black uppercase tracking-[1em] opacity-5">TELEMETRY STANDBY</p>
                {/* Placeholder for live graph */}
                <div className="absolute inset-0 flex items-end justify-start p-4 opacity-30">
                     <svg width="100%" height="100%" viewBox="0 0 500 100" preserveAspectRatio="none">
                         <path d="M 0 80 C 50 20, 100 90, 150 50 S 250 10, 300 60 S 400 90, 450 30, 500 70" stroke="#2AF5FF" fill="transparent" strokeWidth="2" strokeDasharray="4" className="animate-pulse"/>
                     </svg>
                </div>
             </div>
        </section>

      </div>
    </div>
  );
};
