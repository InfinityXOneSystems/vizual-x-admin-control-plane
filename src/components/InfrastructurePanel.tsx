
import React, { useState } from 'react';
import { InfrastructureNode } from '../types';

export const InfrastructurePanel: React.FC = () => {
  const [nodes, setNodes] = useState<InfrastructureNode[]>([
    { id: '1', name: 'vix-nexus-api', type: 'cloud_run', status: 'online', uptime: '14d 2h', load: 12 },
    { id: '2', name: 'vix-vault-worker', type: 'container', status: 'online', uptime: '4d 18h', load: 45 },
    { id: '3', name: 'vix-infra-tf', type: 'terraform', status: 'online', uptime: 'N/A', load: 0 },
    { id: '4', name: 'vix-events-pub', type: 'pubsub', status: 'degraded', uptime: '122d', load: 88 },
  ]);

  return (
    <div className="h-full w-full bg-[#000000] p-10 lg:p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
       <div className="max-w-7xl mx-auto space-y-16">
          <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-16">
             <div className="space-y-4">
                <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none italic">Infra Matrix</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-4 italic">Enterprise Orchestration Control Plane</p>
             </div>
             <div className="flex gap-4">
                <button className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all">Terraform Plan</button>
                <button className="px-10 py-4 electric-gradient rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-white shadow-glow border border-white/10">Apply Topology</button>
             </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {nodes.map(node => (
               <div key={node.id} className="p-8 rounded-[40px] bg-white/[0.01] border border-white/10 hover:border-blue-500/40 transition-all group shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="text-6xl">{node.type === 'container' ? '🐳' : node.type === 'terraform' ? '🏗️' : '☁️'}</span>
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-white/10 bg-black shadow-inner`}>
                           {node.type === 'container' ? '🐳' : node.type === 'terraform' ? '🏗️' : '☁️'}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${node.status === 'online' ? 'bg-green-500 shadow-glow-green' : 'bg-amber-500 animate-pulse'}`}></div>
                     </div>
                     <div>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-1">{node.name}</h4>
                        <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] italic">{node.type.replace('_', ' ')} node</p>
                     </div>
                  </div>

                  <div className="space-y-5 relative z-10 pt-8 border-t border-white/5">
                     <div className="flex justify-between items-center text-[10px] font-mono opacity-30 uppercase italic">
                        <span>Uptime</span>
                        <span className="text-white">{node.uptime}</span>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono opacity-30 uppercase italic">
                           <span>Load</span>
                           <span className="text-white">{node.load}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full electric-gradient transition-all duration-1000`} style={{ width: `${node.load}%` }}></div>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          <section className="p-12 rounded-[56px] bg-zinc-950 border border-white/5 shadow-inner space-y-12">
             <div className="flex items-center gap-6">
                <h3 className="text-2xl font-black italic uppercase tracking-widest italic">Global Cluster Pulse</h3>
                <div className="h-px flex-1 bg-white/5"></div>
             </div>
             <div className="h-[400px] flex items-center justify-center border border-white/5 rounded-[40px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.03),transparent)]"></div>
                <div className="flex gap-1 items-end h-64">
                   {[...Array(40)].map((_, i) => (
                     <div key={i} className="w-2 bg-blue-500/20 rounded-full hover:bg-blue-400 transition-all hover:h-full cursor-help" style={{ height: (Math.random() * 80 + 20) + '%' }}></div>
                   ))}
                </div>
                <div className="absolute bottom-8 text-[10px] font-black uppercase tracking-[1em] opacity-10 italic">Real-time Cluster Telemetry // vX-992</div>
             </div>
          </section>
       </div>
    </div>
  );
};
