
import React from 'react';
import { UITheme } from '../types';

interface Template {
  id: string;
  name: string;
  theme: UITheme;
  previewColor: string;
}

const templates: Template[] = [
  {
    id: 'monaco-classic',
    name: 'Monaco Classic',
    previewColor: '#007fd4',
    theme: {
      primaryColor: '#007fd4',
      sidebarBg: '#252526',
      mainBg: '#1e1e1e',
      fontFamily: "'Inter', sans-serif",
      borderRadius: '0px',
      logoText: 'VIZUAL-X',
      accentGradient: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(200,200,200,0.3) 50%, rgba(255,255,255,0) 100%)',
      baseFontSize: '15px'
    }
  },
  {
    id: 'synthwave',
    name: 'Synthwave 84',
    previewColor: '#ff7edb',
    theme: {
      primaryColor: '#ff7edb',
      sidebarBg: '#241b2f',
      mainBg: '#262335',
      fontFamily: "'JetBrains Mono', monospace",
      borderRadius: '8px',
      logoText: 'VAPOR-X',
      accentGradient: 'linear-gradient(90deg, #ff7edb 0%, #36f9f6 100%)',
      baseFontSize: '16px'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    previewColor: '#fcee0a',
    theme: {
      primaryColor: '#fcee0a',
      sidebarBg: '#000000',
      mainBg: '#050505',
      fontFamily: "'Inter', sans-serif",
      borderRadius: '2px',
      logoText: 'NIGHT-CITY',
      accentGradient: 'linear-gradient(90deg, #fcee0a 0%, #ff003c 100%)',
      baseFontSize: '14px'
    }
  },
  {
    id: 'forest',
    name: 'Forest Deep',
    previewColor: '#4d7c0f',
    theme: {
      primaryColor: '#4d7c0f',
      sidebarBg: '#14532d',
      mainBg: '#064e3b',
      fontFamily: "'Inter', sans-serif",
      borderRadius: '12px',
      logoText: 'EVERGREEN',
      accentGradient: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
      baseFontSize: '16px'
    }
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    previewColor: '#88c0d0',
    theme: {
      primaryColor: '#88c0d0',
      sidebarBg: '#2e3440',
      mainBg: '#3b4252',
      fontFamily: "'Inter', sans-serif",
      borderRadius: '4px',
      logoText: 'FROST-X',
      accentGradient: 'linear-gradient(90deg, #81a1c1 0%, #88c0d0 100%)',
      baseFontSize: '15px'
    }
  }
];

interface TemplateLibraryProps {
  onSelect: (theme: UITheme) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.theme)}
          className="group relative flex items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left overflow-hidden"
        >
          <div 
            className="w-12 h-12 rounded-lg shrink-0 mr-4 shadow-lg flex items-center justify-center text-black font-bold"
            style={{ backgroundColor: t.previewColor }}
          >
            {t.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white mb-1">{t.name}</h4>
            <p className="text-[10px] opacity-40 uppercase tracking-widest truncate">UI PRESET CONFIGURATION</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: t.previewColor }}></div>
        </button>
      ))}
    </div>
  );
};

export default TemplateLibrary;
