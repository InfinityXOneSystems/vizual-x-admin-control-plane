
import React from 'react';
import { Connector, Theme } from '../types';

interface ConnectorsPanelProps {
  connectors: Connector[];
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  theme: Theme;
}

export const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, onConnect, onDisconnect, theme }) => {
  const isDark = theme === 'dark';

  const getIcon = (id: string) => {
    switch (id) {
      case 'github': return '📁';
      case 'google': return '🌐';
      case 'vercel': return '▲';
      case 'docker': return '🐳';
      case 'supabase': return '⚡';
      case 'vscode': return '💻';
      default: return '🔌';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connectors.map((connector) => (
        <div 
          key={connector.id} 
          className={`p-5 rounded-2xl border transition-all duration-300 group hover:shadow-xl ${
            isDark 
              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
              : 'bg-white border-black/5 hover:border-blue-500/30'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              isDark ? 'bg-white/10' : 'bg-slate-100'
            }`}>
              {getIcon(connector.id)}
            </div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
              connector.status === 'connected' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-red-500/10 text-red-500'
            }`}>
              {connector.status}
            </div>
          </div>
          
          <h4 className="font-bold text-lg mb-1 capitalize">{connector.name}</h4>
          <p className="text-xs opacity-50 mb-6">
            {connector.status === 'connected' 
              ? `Connected on ${connector.lastSynced ? new Date(connector.lastSynced).toLocaleDateString() : 'Never'}`
              : `Sync your ${connector.name} workspace.`}
          </p>

          <div className="flex gap-2">
            {connector.status === 'connected' ? (
              <>
                <button 
                  onClick={() => onDisconnect(connector.id)}
                  className="flex-1 py-2 text-xs font-bold rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  Disconnect
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </>
            ) : (
              <button 
                onClick={() => onConnect(connector.id)}
                className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
              >
                Connect {connector.name}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
