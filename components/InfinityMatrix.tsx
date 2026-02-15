import React from 'react';
import { Subsystem } from '../types';

interface InfinityMatrixProps {
  subsystems: Subsystem[];
  onSync?: (repo: string) => void;
}

export const InfinityMatrix: React.FC<InfinityMatrixProps> = ({ subsystems, onSync }) => {
  const getStatusColor = (status: Subsystem['status']) => {
    switch (status) {
      case 'active':
        return 'neon-green-text';
      case 'inactive':
        return 'opacity-30';
      case 'error':
        return 'neon-red-text';
      default:
        return 'opacity-50';
    }
  };

  const getStatusDot = (status: Subsystem['status']) => {
    switch (status) {
      case 'active':
        return 'neon-green-gradient shadow-glow-green animate-pulse';
      case 'inactive':
        return 'bg-white/10';
      case 'error':
        return 'bg-red-600 shadow-glow-red animate-pulse';
      default:
        return 'bg-white/10';
    }
  };

  const getTypeIcon = (type: Subsystem['type']) => {
    switch (type) {
      case 'backend':
        return '🔧';
      case 'frontend':
        return '🎨';
      case 'orchestrator':
        return '🎯';
      case 'agent':
        return '🤖';
      default:
        return '📦';
    }
  };

  const getTypeLabel = (type: Subsystem['type']) => {
    switch (type) {
      case 'backend':
        return 'Core Backend';
      case 'frontend':
        return 'Interface';
      case 'orchestrator':
        return 'Orchestrator';
      case 'agent':
        return 'Agent System';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter mb-2">
            Infinity Matrix
          </h3>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 neon-green-text italic">
            Connected Subsystem Network
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-[20px]">
          <div className="w-2 h-2 rounded-full neon-green-gradient animate-pulse shadow-glow-green"></div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">
            {subsystems.filter(s => s.status === 'active').length} / {subsystems.length} Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subsystems.map((subsystem, index) => (
          <div
            key={index}
            className="p-8 glass-panel rounded-[32px] hover-neon group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 text-5xl pointer-events-none">
              {getTypeIcon(subsystem.type)}
            </div>

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusDot(subsystem.status)}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(subsystem.status)}`}>
                  {subsystem.status.toUpperCase()}
                </span>
              </div>
              <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-40">
                  {getTypeLabel(subsystem.type)}
                </span>
              </div>
            </div>

            <h4 className="text-xl font-black uppercase tracking-tighter mb-3 italic leading-tight relative z-10 group-hover:neon-green-text transition-colors">
              {subsystem.name}
            </h4>

            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-[11px] opacity-30 font-mono-code">
                {subsystem.repo}
              </span>
            </div>

            {onSync && (
              <button
                onClick={() => onSync(subsystem.repo)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-[20px] text-[9px] font-black uppercase tracking-widest italic hover:bg-white/10 hover:border-neon-green transition-all relative z-10"
              >
                Sync Repository
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
