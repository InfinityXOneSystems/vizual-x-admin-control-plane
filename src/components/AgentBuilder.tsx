
import React, { useState } from 'react';
import { Agent, Industry } from '../types';

interface AgentBuilderProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

export const AgentBuilder: React.FC<AgentBuilderProps> = ({ agents, setAgents }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<Industry>('AI Tech');
  const [capabilities, setCapabilities] = useState<string[]>(['browser']);

  const INDUSTRIES: Industry[] = ['Construction', 'Real Estate', 'Crypto', 'AI Tech', 'GitHub OS', 'Stats', 'Code Tech', 'News', 'Shadow Scrape', 'Market Signals'];
  const CAPS = [
    { id: 'browser', label: 'Shadow Browser', icon: '🌐' },
    { id: 'github', label: 'GitHub Ops', icon: '📁' },
    { id: 'workspace', label: 'Workspace Sync', icon: '💼' },
    { id: 'vscode', label: 'VS Code Node', icon: '💻' },
    { id: 'docker', label: 'Docker Desktop', icon: '🐳' },
    { id: 'mcp', label: 'MCP Connect', icon: '📡' }
  ];

  const handleCreate = () => {
    if (!name) return;
    const newAgent: Agent = {
      id: Math.random().toString(),
      name,
      industry,
      role: `Autonomous ${industry} Specialist`,
      status: 'idle',
      capabilities,
      description: `Hyper-intelligent ${industry} trade agent built for sovereign operations.`,
      avatarColor: 'bg-blue-600',
      lastUpdate: 'Created Now',
      logs: [],
      load: 0,
      intelligenceScore: 50,
      recursiveProgress: 0,
      learnedNodes: 0
    };
    setAgents([...agents, newAgent]);
    setName('');
  };

  return (
    <div className="flex-1 p-16 overflow-y-auto bg-black custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto space-y-16">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">Agent Sculptor</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 electric-text italic">No-Code Multi-Agent Architecture Engine</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-10 p-12 bg-white/5 border border-white/10 rounded-[56px] shadow-4xl backdrop-blur-3xl">
            <div className="space-y-8">
              <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Specialize Node Identity</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent Name (e.g. Vix Prophet)" 
                className="w-full bg-black/40 border border-white/5 rounded-[24px] py-6 px-8 text-sm font-bold outline-none focus:border-blue-500/50 transition-all italic shadow-inner"
              />
              <select 
                value={industry}
                onChange={(e) => setIndustry(e.target.value as Industry)}
                className="w-full bg-black/40 border border-white/5 rounded-[24px] py-6 px-8 text-sm font-bold outline-none focus:border-blue-500/50 transition-all italic shadow-inner appearance-none"
              >
                {INDUSTRIES.map(i => <option key={i} value={i}>{i} Industry</option>)}
              </select>
            </div>

            <div className="space-y-8">
              <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Inject Capabilities</label>
              <div className="grid grid-cols-2 gap-4">
                {CAPS.map(cap => (
                  <button 
                    key={cap.id}
                    onClick={() => setCapabilities(prev => prev.includes(cap.id) ? prev.filter(c => c !== cap.id) : [...prev, cap.id])}
                    className={`p-5 rounded-[28px] border transition-all text-left flex items-center gap-4 ${
                      capabilities.includes(cap.id) ? 'bg-blue-600/10 border-blue-500/40 text-white' : 'bg-black/20 border-white/5 opacity-40'
                    }`}
                  >
                    <span className="text-xl">{cap.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">{cap.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleCreate}
              className="w-full py-8 electric-gradient text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-[11px] shadow-2xl shadow-blue-600/50 italic border border-white/10"
            >
              Finalize Sovereign Specialist
            </button>
          </div>

          <div className="space-y-10">
            <h3 className="text-xl font-black uppercase tracking-widest opacity-30 italic px-4">Active Deployments</h3>
            <div className="space-y-6">
              {agents.map(agent => (
                <div key={agent.id} className="p-8 bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl flex justify-between items-center group hover:border-blue-500/40 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-[24px] ${agent.avatarColor} flex items-center justify-center border border-white/10 shadow-glow group-hover:scale-110 transition-transform`}>
                       <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase italic leading-none mb-1">{agent.name}</h4>
                      <p className="text-[9px] font-black opacity-20 uppercase tracking-widest italic">{agent.industry} / {agent.capabilities.length} Capabilities</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};