import React from 'react';
import { Recommendation, TaskResult } from '../types';

interface IntelligenceHubProps {
  recommendations: Recommendation[];
  results: TaskResult[];
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ recommendations, results }) => {
  return (
    <div className="flex-1 p-6 lg:p-12 overflow-y-auto bg-black dark:bg-black light:bg-transparent custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Core System Health Dashboard */}
        <section className="space-y-8">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-2 italic">Sovereign Health</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 neon-green-text italic">Real-time Performance & Node Synthesis</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-[20px] shadow-glow-green">
                 <div className="w-2 h-2 rounded-full neon-green-gradient animate-ping"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest italic">All Systems Operational</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Latency', value: '12ms', status: 'Optimal', icon: '📡' },
                { label: 'Throughput', value: '16.4 GB/s', status: 'Scaling', icon: '⚡' },
                { label: 'Active Clusters', value: '1,642', status: 'Synced', icon: '💎' },
                { label: 'Risk Factor', value: '0.002%', status: 'Minimal', icon: '🛡️' }
              ].map((metric, i) => (
                <div key={i} className="p-8 glass-panel rounded-[32px] hover-neon group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">{metric.icon}</div>
                   <p className="text-[10px] font-black opacity-30 tracking-[0.3em] uppercase mb-4">{metric.label}</p>
                   <p className="text-3xl font-black italic tracking-tighter mb-2">{metric.value}</p>
                   <span className="text-[9px] font-black neon-green-text uppercase tracking-widest italic">{metric.status}</span>
                </div>
              ))}
           </div>
        </section>

        {/* ROI Matrix Section */}
        <section className="p-6 lg:p-10 glass-panel rounded-[50px] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <span className="text-9xl font-black italic">PRIORITY</span>
             </div>
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter italic">Priority ROI Matrix</h3>
                  <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-[15px] text-[9px] font-black uppercase tracking-widest italic hover-neon">Sync Node</button>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                   <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest opacity-20">
                          <th className="pb-6">Node Alignment</th>
                          <th className="pb-6">Alpha Potential</th>
                          <th className="pb-6">Risk Profile</th>
                          <th className="pb-6">Implementation</th>
                          <th className="pb-6">Master Alignment</th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px] font-bold italic">
                        {results.length > 0 ? results.map((res, i) => (
                          <tr key={i} className="border-b border-white/5 transition-all hover-neon group">
                            <td className="py-7">
                              <span className="block text-[16px] font-black group-hover:neon-green-text transition-colors">{res.agentName} Node</span>
                              <span className="text-[9px] opacity-30 uppercase tracking-widest">Sovereign Protocol Optimized</span>
                            </td>
                            <td className="py-7 text-xl font-black neon-green-text tracking-tighter">{res.analysis?.roi || '1,580%'}</td>
                            <td className="py-7">
                               <span className={res.analysis?.riskLevel === 'high' ? 'neon-red-text' : res.analysis?.riskLevel === 'medium' ? 'neon-yellow-text' : 'neon-green-text opacity-50'}>
                                  {res.analysis?.riskLevel?.toUpperCase() || 'SAFE'}
                               </span>
                            </td>
                            <td className="py-7">
                               <div className="flex items-center gap-4">
                                  <span className="font-black italic">{res.analysis?.easeOfImplementation || 98}%</span>
                                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full neon-green-gradient shadow-glow-green" style={{ width: `${res.analysis?.easeOfImplementation || 98}%` }}></div>
                                  </div>
                               </div>
                            </td>
                            <td className="py-7">
                               <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${res.status === 'complete' ? 'neon-green-gradient shadow-glow-green' : 'electric-gradient animate-pulse shadow-glow-blue'}`}></div>
                                  <span className="uppercase text-[11px] tracking-widest opacity-60 font-black">{res.status}</span>
                               </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="py-16 text-center opacity-10 uppercase tracking-[1.5em] text-[12px] font-black">Awaiting Master Ingress Logic...</td>
                          </tr>
                        )}
                      </tbody>
                   </table>
                </div>
             </div>
        </section>

        {/* Global Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-8 lg:p-10 glass-panel rounded-[48px] shadow-2xl relative overflow-hidden group hover-neon">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="px-5 py-2 rounded-full neon-bg-green neon-green-text text-[10px] font-black uppercase tracking-widest italic">{rec.source} Specialist</div>
                  <div className="text-2xl font-black italic neon-green-text tracking-tighter">{rec.confidence}% Match</div>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 italic leading-tight relative z-10 group-hover:neon-green-text transition-colors">{rec.title}</h4>
                <p className="text-[12px] opacity-40 font-medium leading-relaxed mb-10 italic relative z-10">{rec.prediction}</p>
                <div className="flex gap-4 relative z-10">
                  <button className="flex-1 py-4 lg:py-5 neon-green-gradient rounded-[24px] text-[10px] font-black uppercase tracking-widest text-white italic shadow-glow-green hover:scale-105 transition-transform">Deploy Protocol</button>
                  <button className="flex-1 py-4 lg:py-5 bg-white/5 border border-white/10 rounded-[24px] text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all">Simulation Run</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};