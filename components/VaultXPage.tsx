
import React, { useState } from 'react';
import { Connector } from '../types';

export const VaultXPage: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>([
    { id: '1', name: 'Google Cloud Platform', status: 'CONNECTED', latency: '4ms', category: 'CLOUD', icon: '☁️' },
    { id: '2', name: 'GitHub Enterprise', status: 'CONNECTED', latency: '12ms', category: 'DEV', icon: '🐙' },
    { id: '3', name: 'Vertex AI Pro', status: 'PENDING', latency: '--', category: 'AI', icon: '🧠' },
    { id: '4', name: 'Terraform Cloud', status: 'DISCONNECTED', latency: '--', category: 'DEV', icon: '🏗️' },
    { id: '5', name: 'Auth0 Sovereign', status: 'CONNECTED', latency: '8ms', category: 'AUTH', icon: '🔐' },
    { id: '6', name: 'Nvidia Omniverse', status: 'PENDING', latency: '--', category: 'AI', icon: '🌌' },
  ]);

  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);

  const handleGlobalSync = () => {
    setIsSyncingGlobal(true);
    setTimeout(() => setIsSyncingGlobal(false), 2000);
  };

  return (
    <div className="h-full w-full bg-[#05070A] p-10 lg:p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
       <div className="max-w-7xl mx-auto space-y-16">
          <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b-[0.5px] border-white/5 pb-16">
             <div className="space-y-4">
                <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none italic">Universal Sync</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-4 italic">Distributed Ingress & Connector Matrix</p>
             </div>
             <button 
                onClick={handleGlobalSync}
                className="px-12 py-5 electric-gradient rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] italic text-white shadow-2xl transition-all active:scale-95 border-[0.5px] border-white/10"
             >
                {isSyncingGlobal ? 'Validating Matrix...' : 'Sync Cluster Immediatly'}
             </button>
          </header>

          {/* Core Connector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {connectors.map(c => (
               <div key={c.id} className="p-8 rounded-[40px] bg-white/[0.01] border-[0.5px] border-white/10 hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                     <span className="text-7xl">{c.icon}</span>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                           {c.icon}
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${
                           c.status === 'CONNECTED' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 
                           c.status === 'PENDING' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-800'
                        }`}></div>
                     </div>
                     <div>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-1">{c.name}</h4>
                        <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.3em] italic">{c.category} Layer</span>
                     </div>
                  </div>

                  <div className="space-y-4 relative z-10 pt-8 border-t border-white/[0.03]">
                     <div className="flex justify-between items-center text-[9px] font-mono opacity-20 uppercase tracking-widest">
                        <span>Latency</span>
                        <span className="text-white/60">{c.latency}</span>
                     </div>
                     <div className="flex justify-between items-center text-[9px] font-mono opacity-20 uppercase tracking-widest">
                        <span>Handshake</span>
                        <span className={`font-black ${c.status === 'CONNECTED' ? 'text-green-500' : 'text-zinc-700'}`}>{c.status}</span>
                     </div>
                     <button className="w-full mt-4 py-3 bg-white/5 border-[0.5px] border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10">Configure</button>
                  </div>
               </div>
             ))}

             {/* Add System Slot */}
             <div className="p-8 rounded-[40px] border-[0.5px] border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center space-y-6 opacity-30 hover:opacity-100 transition-all cursor-pointer group hover:bg-white/[0.02] min-h-[300px]">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-all">+</div>
                <div>
                   <h4 className="text-sm font-black uppercase tracking-widest">Add Custom Integration</h4>
                   <p className="text-[9px] italic opacity-50 mt-2">API / OAuth / Webhook Sync</p>
                </div>
             </div>
          </div>

          {/* Infrastructure Detail */}
          <section className="p-12 rounded-[56px] bg-[#000000] border-[0.5px] border-white/5 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-16 opacity-5 italic font-black text-[140px] pointer-events-none select-none">HANDSHAKE</div>
             <div className="relative z-10 space-y-12">
                <div className="flex items-center gap-6">
                   <h3 className="text-2xl font-black italic uppercase tracking-widest italic">Universal IAM Matrix</h3>
                   <div className="h-px flex-1 bg-white/5"></div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
                   <div className="xl:col-span-2 space-y-8">
                      <div className="p-8 rounded-3xl bg-white/[0.02] border-[0.5px] border-white/10 space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Master Service Identity</p>
                         <p className="text-lg font-mono opacity-60 truncate">vizual-x-sovereign-node-42@iam.gserviceaccount.com</p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                         <button className="px-8 py-4 bg-blue-600/10 border-[0.5px] border-blue-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 italic shadow-glow">Rotate Cluster Keys</button>
                         <button className="px-8 py-4 bg-white/5 border-[0.5px] border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic opacity-40 hover:opacity-100">Handshake Audit</button>
                         <button className="px-8 py-4 bg-white/5 border-[0.5px] border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic opacity-40 hover:opacity-100">Export Policy</button>
                      </div>
                   </div>
                   <div className="flex items-center justify-center p-12 bg-blue-500/[0.02] rounded-[40px] border-[0.5px] border-dashed border-blue-500/20 text-center py-20">
                      <div className="space-y-4">
                         <div className="text-4xl">🔐</div>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 italic leading-relaxed">System security validated across<br/>all universal cluster nodes.</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>
       </div>
    </div>
  );
};
