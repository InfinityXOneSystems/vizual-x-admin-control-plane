
import React from 'react';
import { Connector } from '../types';

interface ConnectorsPanelProps {
  connectors: Connector[];
  setConnectors: React.Dispatch<React.SetStateAction<Connector[]>>;
}

export const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, setConnectors }) => {
  const toggleStatus = (id: string) => {
    setConnectors(prev => prev.map(c => 
      c.id === id ? { ...c, status: c.status === 'connected' ? 'disconnected' : 'connected', lastSynced: new Date() } : c
    ));
  };

  const categories = ['llm', 'workspace', 'dev', 'cloud'];

  return (
    <div className="flex-1 p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-1000 bg-black">
      <div className="mb-16">
        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">Global Connectors</h2>
        <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 electric-text">Multi-Model Sovereign Ecosystem Sync</p>
      </div>

      <div className="space-y-20">
        {categories.map(cat => (
          <div key={cat} className="space-y-10">
            <h3 className="text-xl font-black uppercase italic tracking-[0.4em] opacity-40 flex items-center gap-6">
              {cat.toUpperCase()} MATRIX <div className="h-[1px] flex-1 bg-white/5"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {connectors.filter(c => c.category === cat).map(c => (
                <div key={c.id} className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-blue-500/40 transition-all backdrop-blur-3xl group shadow-4xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                     <span className="text-6xl">{c.icon}</span>
                  </div>
                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="w-20 h-20 rounded-[28px] bg-black/40 border border-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">
                      {c.icon}
                    </div>
                    <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      c.status === 'connected' ? 'bg-blue-500/20 border-blue-500/40 electric-text shadow-glow' : 'bg-red-500/10 border-red-500/20 text-red-400 opacity-40'
                    }`}>
                      {c.status}
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2 italic leading-none">{c.name}</h4>
                    <p className="text-[11px] font-black opacity-30 uppercase tracking-widest mb-2 italic">{c.details}</p>
                    <p className="text-[9px] font-black opacity-10 uppercase tracking-[0.2em] mb-10">
                      {c.status === 'connected' ? `SYNC: ${c.lastSynced.toLocaleTimeString()}` : 'OFFLINE'}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleStatus(c.id)}
                    className={`w-full py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.4em] transition-all italic border relative z-10 ${
                      c.status === 'connected' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/40' : 'electric-gradient text-white border-white/20 shadow-glow'
                    }`}
                  >
                    {c.status === 'connected' ? 'DEAUTHORIZE' : 'INITIALIZE'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
