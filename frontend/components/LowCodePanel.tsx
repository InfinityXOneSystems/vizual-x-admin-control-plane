
import React from 'react';
import { UITheme } from '../types';

interface LowCodePanelProps {
  theme: UITheme;
  onChange: (newTheme: UITheme) => void;
}

const LowCodePanel: React.FC<LowCodePanelProps> = ({ theme, onChange }) => {
  const updateField = (field: keyof UITheme, value: string) => {
    onChange({ ...theme, [field]: value });
  };

  return (
    <div className="space-y-10 p-4">
      <div className="space-y-5">
        <label className="text-[12px] font-bold text-blue-400">Primary Branding</label>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-[11px] font-medium text-white/60">Accent Color</span>
            <input 
              type="color" 
              value={theme.primaryColor} 
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="w-full h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden border border-white/10" 
            />
          </div>
          <div className="space-y-3">
            <span className="text-[11px] font-medium text-white/60">Logo Text</span>
            <input 
              type="text" 
              value={theme.logoText} 
              onChange={(e) => updateField('logoText', e.target.value)}
              className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none focus:border-blue-500 text-white" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <label className="text-[12px] font-bold text-purple-400">Structural Geometry</label>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[11px]">
              <span className="font-medium text-white/60">Border Radius</span>
              <span className="font-mono text-white/80">{theme.borderRadius}</span>
            </div>
            <input 
              type="range" 
              min="0" max="32" step="2"
              value={parseInt(theme.borderRadius)} 
              onChange={(e) => updateField('borderRadius', `${e.target.value}px`)}
              className="w-full accent-purple-500" 
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[11px]">
              <span className="font-medium text-white/60">Base Font Size</span>
              <span className="font-mono text-white/80">{theme.baseFontSize}</span>
            </div>
            <input 
              type="range" 
              min="12" max="24" step="1"
              value={parseInt(theme.baseFontSize)} 
              onChange={(e) => updateField('baseFontSize', `${e.target.value}px`)}
              className="w-full accent-blue-500" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <label className="text-[12px] font-bold text-green-400">Surface Colors</label>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-[11px] font-medium text-white/60">Main Surface</span>
            <input 
              type="color" 
              value={theme.mainBg} 
              onChange={(e) => updateField('mainBg', e.target.value)}
              className="w-full h-10 bg-transparent cursor-pointer rounded-lg border border-white/10" 
            />
          </div>
          <div className="space-y-3">
            <span className="text-[11px] font-medium text-white/60">Sidebar Surface</span>
            <input 
              type="color" 
              value={theme.sidebarBg} 
              onChange={(e) => updateField('sidebarBg', e.target.value)}
              className="w-full h-10 bg-transparent cursor-pointer rounded-lg border border-white/10" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowCodePanel;
