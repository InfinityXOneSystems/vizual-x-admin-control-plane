
import React, { useState } from 'react';

export const WorkspaceMirror: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'sheets' | 'slides'>('docs');

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden animate-in fade-in duration-700">
      <div className="h-16 bg-white/[0.02] border-b border-white/10 flex items-center px-12 justify-between">
        <div className="flex items-center gap-8">
          {[
            { id: 'docs', label: 'Sovereign Docs', icon: '📄' },
            { id: 'sheets', label: 'Quantum Sheets', icon: '📊' },
            { id: 'slides', label: 'Flash Slides', icon: '🎬' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-2 rounded-full transition-all ${
                activeTab === tab.id ? 'bg-white/10 text-white' : 'opacity-20 hover:opacity-100'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest italic">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] opacity-20 italic">
          Synced with Google Workspace Core
        </div>
      </div>

      <div className="flex-1 p-16 flex flex-col items-center custom-scrollbar overflow-y-auto">
        <div className="w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-[64px] min-h-[1000px] shadow-[0_80px_160px_rgba(0,0,0,0.9)] p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <span className="text-[200px] font-black italic">VIX</span>
          </div>
          
          <div className="relative z-10 space-y-16">
            <header className="space-y-6">
              <div className="text-[10px] font-black electric-text uppercase tracking-[0.5em] italic">Output Report / Auto-Generated</div>
              <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none italic">Sovereign Asset Analysis</h1>
              <div className="flex gap-10 opacity-30 text-[10px] font-black uppercase tracking-widest italic border-t border-white/5 pt-6">
                <span>Created by: Exec Assistant</span>
                <span>Date: Oct 2024</span>
                <span>Security: Class A Sovereign</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <h2 className="text-3xl font-black uppercase italic tracking-tight italic">Executive Summary</h2>
                <p className="text-sm font-medium leading-[2] opacity-50 italic">The Market Prophet node has identified a convergence of technical signals across three distinct sectors. Historical regression testing confirms an 80% probability of growth in semiconductor infrastructure within the next 72 hours. This report outlines the specific entry points and risk assessments synthesized by the Data Oracle specialist.</p>
              </div>
              <div className="p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest italic">Signal Ingestion</h3>
                {[
                  { label: 'Market Sentiment', val: 'Bullish' },
                  { label: 'Volitality Index', val: 'Low' },
                  { label: 'Node Sync Status', val: 'Optimal' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{item.label}</span>
                    <span className="text-xs font-black electric-text italic">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-12">
               <h2 className="text-3xl font-black uppercase italic tracking-tight italic text-center">Simulated Market Trajectory</h2>
               <div className="aspect-[21/9] w-full bg-black/40 rounded-[48px] border border-white/5 flex items-center justify-center shadow-inner overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center p-20 opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 1000 300">
                      <path d="M0,250 L100,220 L200,240 L300,180 L400,190 L500,120 L600,140 L700,60 L800,80 L900,20 L1000,40" fill="none" stroke="url(#line-grad)" strokeWidth="6" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0066ff" />
                          <stop offset="100%" stopColor="#00d4ff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="relative z-10 text-[10px] font-black uppercase tracking-[1em] opacity-20 italic">Quantum Projection Mode</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
