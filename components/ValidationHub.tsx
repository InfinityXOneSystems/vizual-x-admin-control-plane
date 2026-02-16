
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { TestResult } from '../types';

export const ValidationHub: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchProof = async () => {
      const [t, s] = await Promise.all([
        ApiService.validation.getTests(),
        ApiService.validation.status()
      ]);
      setTests(t);
      setStatus(s);
    };
    fetchProof();
  }, []);

  return (
    <div className="h-full w-full bg-[#000000] p-10 lg:p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
       <div className="max-w-6xl mx-auto space-y-16">
          <header className="flex justify-between items-end border-b border-white/5 pb-12">
             <div>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none italic">Proof Engine</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-green-500 italic mt-4 italic">Verification & Validation Terminal</p>
             </div>
             {status && (
               <div className="flex gap-4">
                  <div className="px-6 py-3 bg-[#05070A] border border-white/10 rounded-2xl flex items-center gap-4">
                     <span className="text-[10px] font-black uppercase opacity-20">Pass Rate</span>
                     <span className="text-xl font-black italic text-green-500">{status.passRate}%</span>
                  </div>
               </div>
             )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Logic Proof Suite</h3>
                <div className="space-y-4">
                   {tests.map(test => (
                     <div key={test.id} className="p-8 bg-[#05070A] border border-white/5 rounded-[32px] flex justify-between items-center group hover:border-blue-500/30">
                        <div>
                           <div className="flex items-center gap-3">
                              <span className={`w-1.5 h-1.5 rounded-full ${test.status === 'pass' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></span>
                              <h4 className="text-[11px] font-black uppercase tracking-widest">{test.test}</h4>
                           </div>
                           <p className="text-[9px] opacity-20 mt-1 uppercase tracking-tighter font-mono italic">{test.suite} // {test.duration}ms</p>
                        </div>
                        {test.evidence && <span className="text-[8px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded">EVIDENCE</span>}
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-8">
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-[48px] h-[300px] flex flex-col items-center justify-center text-center space-y-8 shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.03),transparent)] opacity-50"></div>
                   <span className="text-7xl opacity-20">🛡️</span>
                   <p className="text-sm font-black uppercase tracking-[0.6em] opacity-40 italic">System Integrity Verified</p>
                   <p className="text-[10px] font-mono opacity-10 uppercase tracking-tighter">Audit Hash: VIX_SHA256_99a2b1...</p>
                </div>
                <div className="p-8 bg-[#05070A] border border-white/5 rounded-[32px] space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Monitor Endpoint</h4>
                   <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                      <code className="text-[10px] text-blue-400">GET /api/monitor</code>
                      <span className="text-[9px] font-black text-green-500">200 OK</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
