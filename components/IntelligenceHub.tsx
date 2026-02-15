import React from 'react';
import { Recommendation, TaskResult } from '../types';

interface IntelligenceHubProps {
  recommendations: Recommendation[];
  results: TaskResult[];
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ recommendations, results }) => {
  return (
    <div className="flex-1 p-10 overflow-y-auto bg-black custom-scrollbar animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          
          {/* Autonomous Optimization Status Dashboard */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { id: 'heal', label: 'Auto-Heal', status: 'Active' },
              { id: 'fix', label: 'Auto-Fix', status: 'Synced' },
              { id: 'opt', label: 'Optimize', status: 'Persistent' },
              { id: 'cost', label: 'Cost-Opt', status: 'Minimal' },
              { id: 'roi', label: 'ROI-Opt', status: 'Scaling' }
            ].map((sys) => (
              <div key={sys.id} className="p-6 glass-panel rounded-[32px] hover-neon group text-center flex flex-col items-center">
                <div className="w-9 h-9 rounded-full neon-bg-green flex items-center justify-center mb-3">
                   <div className="w-2.5 h-2.5 rounded-full neon-green-gradient shadow-glow-green animate-pulse"></div>
                </div>
                <span className="text-[10px] font-black opacity-30 tracking-[0.3em] italic mb-1 uppercase">{sys.label}</span>
                <span className="text-[12px] font-black neon-green-text italic uppercase">{sys.status}</span>
              </div>
            ))}
          </section>

          {/* Enhanced Prioritized ROI Matrix */}
          <section className="p-10 glass-panel rounded-[50px] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5">
                <span className="text-9xl font-black italic">PRIORITY</span>
             </div>
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-2 italic">Priority Cluster Matrix</h3>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 neon-green-text italic">Autonomous Top-Down ROI Ingestion</p>
                  </div>
                  <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-[18px] text-[10px] font-black uppercase tracking-widest italic hover-neon">Flush Cache & Sync</button>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest opacity-20">
                          <th className="pb-6">Priority Level / Node</th>
                          <th className="pb-6">Alpha ROI</th>
                          <th className="pb-6">Risk Quotient</th>
                          <th className="pb-6">Implementation Speed</th>
                          <th className="pb-6">Node Latency</th>
                          <th className="pb-6">Master Alignment</th>
                        </tr>
                      </thead>
                      <tbody className="text-[14px] font-bold italic">
                        {results.length > 0 ? results.map((res, i) => (
                          <tr key={i} className="border-b border-white/5 transition-all hover-neon group">
                            <td className="py-7">
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black neon-green-text">0{i+1}</span>
                                <div>
                                  <span className="block text-[17px] font-black group-hover:neon-green-text transition-colors">{res.agentName} Cluster</span>
                                  <span className="text-[9px] opacity-30 uppercase tracking-widest">Optimized Sovereign Routine</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-7 text-2xl font-black neon-green-text tracking-tighter">{res.analysis?.roi || '1,580%'}</td>
                            <td className="py-7">
                               <span className={res.analysis?.riskLevel === 'high' ? 'neon-red-text' : res.analysis?.riskLevel === 'medium' ? 'neon-yellow-text' : 'neon-green-text opacity-50'}>
                                  {res.analysis?.riskLevel?.toUpperCase() || 'NEGLIGIBLE'}
                               </span>
                            </td>
                            <td className="py-7">
                               <div className="flex items-center gap-4">
                                  <span className="font-black italic">{res.analysis?.easeOfImplementation || 98}%</span>
                                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                     <div className="h-full neon-green-gradient shadow-glow-green" style={{ width: `${res.analysis?.easeOfImplementation || 98}%` }}></div>
                                  </div>
                               </div>
                            </td>
                            <td className="py-7 font-black opacity-30 italic tracking-tighter">{res.analysis?.speedEstimate || '8m Node Sync'}</td>
                            <td className="py-7">
                               <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${res.status === 'complete' ? 'neon-green-gradient shadow-glow-green' : 'electric-gradient animate-pulse shadow-glow-blue'}`}></div>
                                  <span className="uppercase text-[11px] tracking-widest opacity-60 font-black">{res.status}</span>
                               </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="py-20 text-center opacity-10 uppercase tracking-[1.5em] text-[12px] font-black">Awaiting Sovereign Master Directives...</td>
                          </tr>
                        )}
                      </tbody>
                   </table>
                </div>
             </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-10 glass-panel rounded-[48px] shadow-2xl relative overflow-hidden group hover-neon">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="px-5 py-2 rounded-full neon-bg-green neon-green-text text-[10px] font-black uppercase tracking-widest italic">{rec.source} Specialist</div>
                  <div className="text-3xl font-black italic neon-green-text tracking-tighter">{rec.confidence}% Match</div>
                </div>
                <h4 className="text-3xl font-black uppercase tracking-tighter mb-4 italic leading-tight relative z-10 group-hover:neon-green-text transition-colors">{rec.title}</h4>
                <p className="text-[13px] opacity-40 font-medium leading-relaxed mb-10 italic relative z-10">{rec.prediction}</p>
                <div className="flex gap-4 relative z-10">
                  <button className="flex-1 py-5 neon-green-gradient rounded-[24px] text-[10px] font-black uppercase tracking-widest text-white italic shadow-glow-green hover:scale-105 transition-transform">Deploy Protocol</button>
                  <button className="flex-1 py-5 bg-white/5 border border-white/10 rounded-[24px] text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all">Simulation Run</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Context Sidebar */}
        <div className="space-y-8">
          <div className="p-10 neon-bg-green rounded-[48px] shadow-glow-green relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] neon-green-text mb-6 italic">Auto-Cost Optimization</h4>
              <div className="text-6xl font-black italic mb-2 neon-green-text tracking-tighter">-$4,842.00</div>
              <p className="text-[11px] font-black opacity-40 uppercase tracking-widest italic mb-6 text-black">Net Sovereign Cluster Savings / Mo</p>
              <button className="w-full py-5 bg-black text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest italic hover:scale-105 transition-all shadow-2xl">Confirm Alignment</button>
            </div>
          </div>

          <div className="space-y-6 p-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest opacity-20 italic px-4">Global Signal Ingestion</h4>
            {[
              { topic: '#LPUInference', signal: 'Exponential Alpha', delta: '+1,120%' },
              { topic: '#SovereignAgents', signal: 'Cluster Standard', delta: '+214%' },
              { topic: '#VeoGenV4', signal: 'Synthetic Media', delta: '+152%' }
            ].map((t, i) => (
              <div key={i} className="p-6 glass-panel rounded-[36px] flex justify-between items-center hover-neon group">
                 <div className="flex flex-col">
                    <span className="text-[14px] font-black italic group-hover:neon-green-text transition-colors">{t.topic}</span>
                    <span className="text-[9px] opacity-30 font-bold uppercase tracking-widest">{t.signal}</span>
                 </div>
                 <span className="text-[12px] font-black neon-green-text tracking-tighter">{t.delta}</span>
              </div>
            ))}
          </div>

          <div className="p-10 glass-panel rounded-[48px] text-center">
            <h4 className="text-sm font-black uppercase tracking-widest opacity-20 mb-8 italic">Cluster Throughput Velocity</h4>
            <div className="flex justify-center items-end gap-3 mb-10 h-16">
              {[1,2,3,4,5,6,7,8].map(i => (
                // Fixed animationDelay syntax: ensure numeric operation results in a valid CSS time string (e.g., '0.5s')
                <div key={i} className={`w-2.5 rounded-full ${i < 7 ? 'neon-green-gradient shadow-glow-green' : 'bg-white/10'} animate-pulse`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] neon-green-text italic">Throughput: 16.8 GB/s</p>
          </div>
        </div>
      </div>
    </div>
  );
};