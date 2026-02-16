
import React, { useState, useEffect } from 'react';
import { Agent } from '../types';

interface SovereignMatrixProps {
  agents: Agent[];
}

export const SovereignMatrix: React.FC<SovereignMatrixProps> = ({ agents }) => {
  const [inhalationStats, setInhalationStats] = useState({
    scraped: 0,
    normalized: 0,
    learned: 0,
    activeThreads: 142
  });

  const [tickerLogs, setTickerLogs] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setInhalationStats(prev => ({
        scraped: prev.scraped + Math.floor(Math.random() * 10),
        normalized: prev.normalized + Math.floor(Math.random() * 5),
        learned: prev.learned + (Math.random() > 0.8 ? 1 : 0),
        activeThreads: 120 + Math.floor(Math.random() * 50)
      }));

      const logs = [
        `[INHALATION] Scraping LinkedIn sector signals...`,
        `[NORMALIZATION] Processing fragmented JSON from Crunchbase API...`,
        `[RECURSIVE] Logic node updated in Marketing Cluster.`,
        `[VERTEX AI] Prediction confidence at 94.2% for SaaS trend.`,
        `[SIMULATION] Running Monte Carlo scenario for Crypto expansion...`,
        `[ORGANIZATION] Vector embedding stored in Sovereign Vault.`
      ];
      setTickerLogs(prev => [logs[Math.floor(Math.random() * logs.length)], ...prev.slice(0, 15)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-10 lg:p-16 overflow-y-auto bg-black custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">Intelligence Matrix</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 electric-text italic">Live Inhalation & Recursive Learning Cycle</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Ingested', value: inhalationStats.scraped.toLocaleString() + ' KB', icon: '📥' },
            { label: 'Normalization Rate', value: '98.2%', icon: '⚙️' },
            { label: 'Active Inhalation Threads', value: inhalationStats.activeThreads, icon: '🌩️' },
            { label: 'Recursive Knowledge Gain', value: `+${inhalationStats.learned} Nodes`, icon: '🧠' }
          ].map((stat, i) => (
            <div key={i} className="p-8 glass-panel rounded-[35px] silver-border-glow shadow-2xl space-y-4">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-[10px] font-black opacity-30 tracking-[0.3em] uppercase italic">{stat.label}</p>
              <p className="text-3xl font-black italic tracking-tighter neon-green-text">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Live Thread Monitor */}
          <div className="xl:col-span-2 p-10 glass-panel rounded-[50px] space-y-10 silver-border-glow relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black italic uppercase tracking-widest italic">Asyncio Inhalation stream</h3>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-6 electric-gradient rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
              </div>
            </div>
            <div className="h-[400px] bg-black/40 rounded-[35px] p-10 border border-white/5 font-mono-code text-[11px] overflow-hidden relative shadow-inner">
               <div className="space-y-3 opacity-60">
                  {tickerLogs.map((log, i) => (
                    <div key={i} className="animate-in slide-in-from-left-4 duration-500 flex gap-4">
                      <span className="opacity-20 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('[RECURSIVE]') ? 'neon-green-text' : log.includes('[VERTEX]') ? 'electric-text' : ''}>{log}</span>
                    </div>
                  ))}
               </div>
               <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
            </div>
          </div>

          {/* Predictive Simulations */}
          <div className="p-10 glass-panel rounded-[50px] space-y-10 silver-border-glow">
             <h3 className="text-xl font-black italic uppercase tracking-widest italic">Vertex AI Forecasts</h3>
             <div className="space-y-8">
                {[
                  { sector: 'AI Infrastructure', confidence: 98, trend: 'Breakout' },
                  { sector: 'Global Supply Chain', confidence: 84, trend: 'Consolidation' },
                  { sector: 'Real Estate Tokenization', confidence: 91, trend: 'Expansion' }
                ].map((forecast, i) => (
                  <div key={i} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{forecast.sector}</span>
                      <span className="text-[10px] font-black neon-green-text uppercase">{forecast.trend}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full electric-gradient" style={{ width: `${forecast.confidence}%` }}></div>
                      </div>
                      <span className="text-lg font-black italic">{forecast.confidence}%</span>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full py-6 electric-gradient text-white rounded-[30px] font-black uppercase tracking-[0.4em] text-[10px] shadow-glow italic">Execute Global Ingestion</button>
          </div>
        </div>
      </div>
    </div>
  );
};
