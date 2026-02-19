
import React, { useState } from 'react';
import { SystemUpdate, UIConfiguration } from '../types';
// Fix: Use generateImagePro as it is the correctly named exported function in geminiService.ts
import { generateImagePro } from '../services/geminiService';

interface SystemsControlProps {
  updates: SystemUpdate[];
  uiConfig: UIConfiguration;
  setUiConfig: React.Dispatch<React.SetStateAction<UIConfiguration>>;
}

export const SystemsControl: React.FC<SystemsControlProps> = ({ updates, uiConfig, setUiConfig }) => {
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('Minimalist high-tech silver sovereign emblem, vector style, black background');

  const updateConfig = (key: keyof UIConfiguration, val: any) => {
    setUiConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleGenerateLogo = async () => {
    setIsGeneratingLogo(true);
    try {
      // Fix: Call generateImagePro instead of the non-existent generateImage
      const url = await generateImagePro(logoPrompt, "1:1", "1K");
      if (url) updateConfig('logoUrl', url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const toggleModule = (id: string) => {
    const isEnabled = uiConfig.enabledModules.includes(id);
    const newModules = isEnabled 
      ? uiConfig.enabledModules.filter(m => m !== id)
      : [...uiConfig.enabledModules, id];
    updateConfig('enabledModules', newModules);
  };

  const allModules = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'Direct Chat' },
    { id: 'group-chat', label: 'Multi-Agent Room' },
    { id: 'admin', label: 'Master Admin' },
    { id: 'business', label: 'Business Hub' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'prediction', label: 'Prediction' },
    { id: 'solver', label: 'Problem Solver' },
    { id: 'comm', label: 'AI Comms' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'github', label: 'GitHub' },
    { id: 'vscode', label: 'VS Code' }
  ];

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-black custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-6xl mx-auto space-y-16">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">System Architecture</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 neon-green-text italic">Live Sovereign UI & Feature Engineering Hub</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
             {/* THEME & COLOR FORGE */}
             <section className="p-10 glass-panel rounded-[50px] space-y-12 silver-border-glow">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black italic uppercase tracking-widest italic">Color Forge</h3>
                   <span className="text-[10px] font-black neon-green-text uppercase tracking-widest italic">Atomic Theme Node</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Primary Core</label>
                      <input 
                        type="color" 
                        value={uiConfig.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 p-2 cursor-pointer"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Neon Accent</label>
                      <input 
                        type="color" 
                        value={uiConfig.accentColor}
                        onChange={(e) => updateConfig('accentColor', e.target.value)}
                        className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 p-2 cursor-pointer"
                      />
                   </div>
                   <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Canvas Deep Background</label>
                      <div className="flex gap-4">
                         {['#000000', '#0a0a0a', '#121212', '#0f172a'].map(c => (
                           <button 
                             key={c}
                             onClick={() => updateConfig('backgroundColor', c)}
                             style={{ backgroundColor: c }}
                             className={`w-12 h-12 rounded-xl border-4 ${uiConfig.backgroundColor === c ? 'border-white' : 'border-transparent'} transition-all`}
                           />
                         ))}
                      </div>
                   </div>
                </div>
             </section>

             {/* TYPOGRAPHY LAB */}
             <section className="p-10 glass-panel rounded-[50px] space-y-12 silver-border-glow">
                <h3 className="text-2xl font-black italic uppercase tracking-widest italic">Typography Lab</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Font Stack</label>
                      <select 
                        value={uiConfig.fontFamily}
                        onChange={(e) => updateConfig('fontFamily', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-black uppercase italic text-sm outline-none"
                      >
                         <option value="Inter">Inter UI (Default)</option>
                         <option value="Fira Code">Fira Code (Monaco)</option>
                         <option value="system-ui">Native OS</option>
                         <option value="serif">Classic Serif</option>
                      </select>
                   </div>
                   <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">Global Scale: {uiConfig.fontSizeBase}px</label>
                      <input 
                        type="range" min="12" max="24" step="1" 
                        value={uiConfig.fontSizeBase}
                        onChange={(e) => updateConfig('fontSizeBase', parseInt(e.target.value))}
                        className="w-full accent-blue-500 h-2 bg-white/5 rounded-full"
                      />
                   </div>
                </div>
             </section>

             {/* LOGO ARCHITECT */}
             <section className="p-10 glass-panel rounded-[50px] space-y-12 silver-border-glow">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black italic uppercase tracking-widest italic">Logo Architect</h3>
                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                      {uiConfig.logoUrl ? <img src={uiConfig.logoUrl} className="w-full h-full object-contain" /> : <span className="text-2xl">?</span>}
                   </div>
                </div>
                <div className="space-y-6">
                   <textarea 
                     value={logoPrompt}
                     onChange={(e) => setLogoPrompt(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xs italic font-bold outline-none"
                     rows={3}
                   />
                   <button 
                     onClick={handleGenerateLogo}
                     disabled={isGeneratingLogo}
                     className="w-full py-6 electric-gradient text-white rounded-[24px] font-black uppercase tracking-[0.5em] text-[11px] shadow-glow italic disabled:opacity-30"
                   >
                     {isGeneratingLogo ? 'Synthesizing Brand Node...' : 'Generate New Emblem'}
                   </button>
                </div>
             </section>
          </div>

          <aside className="space-y-10">
             {/* FEATURE MANIFEST EDITOR */}
             <section className="p-10 glass-panel rounded-[50px] space-y-10 silver-border-glow">
                <h3 className="text-xl font-black italic uppercase tracking-widest italic">Feature Manifest</h3>
                <div className="space-y-4">
                   {allModules.map(mod => (
                     <div key={mod.id} className="flex justify-between items-center p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                        <span className="text-[11px] font-black uppercase italic tracking-widest opacity-60">{mod.label}</span>
                        <button 
                          onClick={() => toggleModule(mod.id)}
                          className={`w-12 h-6 rounded-full relative transition-all ${uiConfig.enabledModules.includes(mod.id) ? 'bg-blue-600' : 'bg-white/10'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${uiConfig.enabledModules.includes(mod.id) ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>
                   ))}
                </div>
             </section>

             <div className="p-10 glass-panel rounded-[40px] text-center border-dashed border-white/10 opacity-30 italic">
                <span className="text-3xl block mb-4">⚙️</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sovereign UI Synchronization Node Active</p>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
