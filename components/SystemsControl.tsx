import React from 'react';
import { SystemUpdate, UIConfiguration } from '../types';

interface SystemsControlProps {
  updates: SystemUpdate[];
  uiConfig: UIConfiguration;
  setUiConfig: React.Dispatch<React.SetStateAction<UIConfiguration>>;
}

export const SystemsControl: React.FC<SystemsControlProps> = ({ updates, uiConfig, setUiConfig }) => {
  const updateConfig = (key: keyof UIConfiguration, val: any) => {
    setUiConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-black custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           <div>
              <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">System Architecture</h2>
              <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 neon-green-text italic">Live Sovereign UI & Performance Engineering Hub</p>
           </div>

           <section className="p-10 glass-panel rounded-[50px] space-y-12">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black italic uppercase tracking-widest italic">UI Configuration Node</h3>
                 <span className="text-[10px] font-black neon-green-text uppercase tracking-widest animate-pulse italic">Persistent Alignment Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Global Font Size Base</label>
                    <input 
                      type="range" min="12" max="22" step="1" 
                      value={uiConfig.fontSizeBase}
                      onChange={(e) => updateConfig('fontSizeBase', parseInt(e.target.value))}
                      className="w-full accent-[#39FF14] h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" 
                    />
                    <div className="flex justify-between text-[11px] font-black opacity-30 italic">
                       <span>12px Compact</span>
                       <span className="neon-green-text">{uiConfig.fontSizeBase}px</span>
                       <span>22px Cinematic</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Glass Panel Opacity</label>
                    <input 
                      type="range" min="0.2" max="0.9" step="0.05" 
                      value={uiConfig.glassOpacity}
                      onChange={(e) => updateConfig('glassOpacity', parseFloat(e.target.value))}
                      className="w-full accent-[#39FF14] h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" 
                    />
                    <div className="flex justify-between text-[11px] font-black opacity-30 italic">
                       <span>Minimal</span>
                       <span className="neon-green-text">{Math.round(uiConfig.glassOpacity * 100)}%</span>
                       <span>Heavy</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Neon Intensity</label>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={uiConfig.neonIntensity}
                      onChange={(e) => updateConfig('neonIntensity', parseFloat(e.target.value))}
                      className="w-full accent-[#39FF14] h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" 
                    />
                    <div className="flex justify-between text-[11px] font-black opacity-30 italic">
                       <span>Subtle</span>
                       <span className="neon-green-text">{Math.round(uiConfig.neonIntensity * 100)}%</span>
                       <span>Electric</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">System Palette Override</label>
                    <div className="flex gap-4">
                       {['#39FF14', '#00d4ff', '#ff00ff', '#FFFF00'].map(c => (
                         <button 
                           key={c}
                           onClick={() => updateConfig('accentColor', c)}
                           style={{ backgroundColor: c }}
                           className={`w-10 h-10 rounded-xl border-4 ${uiConfig.accentColor === c ? 'border-white shadow-glow-green' : 'border-transparent opacity-40 hover:opacity-100'} transition-all`}
                         />
                       ))}
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <button className="w-full py-6 neon-green-gradient text-white rounded-[24px] font-black uppercase tracking-[0.5em] text-[11px] shadow-glow-green italic">Synchronize Global Styles</button>
              </div>
           </section>
        </div>

        <div className="space-y-8">
           <h3 className="text-xl font-black uppercase tracking-widest opacity-20 italic px-4">Event Persistent Log</h3>
           <div className="space-y-4">
              {updates.map(u => (
                <div key={u.id} className="p-6 glass-panel rounded-[32px] hover-neon group transition-all">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black neon-green-text uppercase tracking-widest italic">{u.type} Cluster</span>
                      <span className="text-[8px] opacity-20 font-mono-code">{u.timestamp}</span>
                   </div>
                   <h4 className="text-sm font-black uppercase italic tracking-tight mb-1">{u.title}</h4>
                   <p className="text-[10px] opacity-40 font-medium leading-relaxed italic">{u.content}</p>
                </div>
              ))}
           </div>

           <div className="p-10 glass-panel rounded-[40px] text-center border-dashed border-white/10">
              <span className="text-3xl block mb-4 opacity-20">⚙️</span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 italic">Awaiting Autonomous System Refinement Commands</p>
           </div>
        </div>
      </div>
    </div>
  );
};