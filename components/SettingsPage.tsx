
import React, { useState } from 'react';
import { UIConfiguration, User } from '../types';
import { ConnectorsManager } from './ConnectorsManager';

interface SettingsPageProps {
  config: UIConfiguration;
  setConfig: React.Dispatch<React.SetStateAction<UIConfiguration>>;
  currentUser: User | null;
  onUserUpdate: (user: User) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ config, setConfig, currentUser, onUserUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<'universal' | 'editor' | 'security' | 'connectors'>('universal');

  const updateConfig = (key: keyof UIConfiguration, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const updateEditor = (key: keyof UIConfiguration['editorConfig'], val: any) => {
    setConfig(prev => ({
      ...prev,
      editorConfig: { ...prev.editorConfig, [key]: val }
    }));
  };

  const CATEGORIES = [
    { id: 'universal', label: 'Appearance', icon: '🎨' },
    { id: 'editor', label: 'Monaco Core', icon: '🛠️' },
    { id: 'security', label: 'Vault Sec', icon: '🔐' },
    { id: 'connectors', label: 'Connectors', icon: '🔗' }
  ];

  const renderContent = () => {
    switch(activeCategory) {
      case 'universal':
        return (
          <div className="space-y-16 animate-in slide-in-from-left-4 duration-500">
             <section className="space-y-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Global Theming</h3>
                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-20 italic ml-2">Accent Token</label>
                      <div className="flex gap-4">
                         {['#2AF5FF', '#1E90FF', '#7000FF', '#FF0055'].map(c => (
                           <button 
                             key={c} 
                             onClick={() => updateConfig('primaryColor', c)}
                             className={`w-12 h-12 rounded-2xl border transition-all hover:scale-110 ${config.primaryColor === c ? 'border-blue-500' : 'border-white/10'}`} 
                             style={{backgroundColor: c}}
                           ></button>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-6">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-20 italic ml-2">Typography Stack</label>
                      <select 
                        value={config.fontFamily}
                        onChange={(e) => updateConfig('fontFamily', e.target.value)}
                        className="w-full bg-[#05070A] border border-white/10 rounded-2xl py-5 px-6 text-[11px] font-black uppercase italic outline-none focus:border-blue-500/40 text-[#C8D2DC]"
                      >
                         <option value="Inter">Inter // Default</option>
                         <option value="Fira Code">Fira Code // Monaco</option>
                         <option value="system-ui">OS Native</option>
                      </select>
                   </div>
                </div>
             </section>
          </div>
        );
      case 'editor':
        return (
          <div className="space-y-12 animate-in slide-in-from-left-4 duration-500">
             <section className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Editor Runtime</h3>
                <div className="space-y-4">
                   {[
                     { id: 'minimap', label: 'Enable Minimap' },
                     { id: 'bracketPairColorization', label: 'Bracket Pair Colorization' }
                   ].map(item => (
                     <div key={item.id} className="flex justify-between items-center p-8 bg-[#05070A] border border-white/5 rounded-[24px]">
                        <span className="text-[11px] font-black uppercase tracking-widest opacity-60 italic">{item.label}</span>
                        <button
                          onClick={() => updateEditor(item.id as any, !config.editorConfig[item.id as keyof UIConfiguration['editorConfig']])}
                          className={`w-12 h-6 rounded-full border border-white/10 transition-all flex items-center px-1 ${config.editorConfig[item.id as keyof UIConfiguration['editorConfig']] ? 'bg-blue-600/20' : 'bg-zinc-900'}`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-all ${config.editorConfig[item.id as keyof UIConfiguration['editorConfig']] ? 'bg-blue-400 translate-x-6' : 'bg-zinc-700 translate-x-0'}`}></div>
                        </button>
                     </div>
                   ))}
                </div>
             </section>
          </div>
        );
      case 'connectors':
        return <ConnectorsManager user={currentUser} onUserUpdate={onUserUpdate} />;
      default:
        return null;
    }
  }


  return (
    <div className="h-full w-full bg-[#000000] p-10 lg:p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
       <div className="max-w-6xl mx-auto space-y-24">
          <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-16">
             <div className="space-y-4">
                <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none italic">Control Matrix</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-blue-400 italic">E2E Configuration Hub</p>
             </div>
             <nav className="flex bg-[#05070A] p-1 rounded-2xl border border-white/10 shrink-0">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat.id 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
             </nav>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
             <div className="lg:col-span-8 space-y-20">
                {renderContent()}
             </div>

             <aside className="lg:col-span-4 space-y-12">
                <div className="p-10 rounded-[40px] bg-[#05070A] border border-white/5 space-y-10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Persistence</h3>
                   <div className="space-y-6">
                      <p className="text-[10px] leading-relaxed opacity-40 uppercase tracking-tighter">Configuration is mirrored across local vault and cloud cluster nodes.</p>
                      <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest italic">Export Workspace</button>
                      <button className="w-full py-4 bg-red-600/10 border border-red-500/20 text-red-400 rounded-2xl text-[9px] font-black uppercase tracking-widest italic">Factory Re-sync</button>
                   </div>
                </div>
             </aside>
          </div>
       </div>
    </div>
  );
};
