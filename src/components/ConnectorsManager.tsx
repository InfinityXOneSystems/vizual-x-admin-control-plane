
import React, { useState } from 'react';
import { User } from '../types';
import { ApiKeyModal } from './ApiKeyModal';
import { ApiService } from '../services/apiService';

interface ConnectorsManagerProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
}

type Service = {
  id: string;
  name: string;
  icon: string;
  category: string;
  authType: 'oauth' | 'token' | 'local';
  details?: string;
}

const ALL_CONNECTORS: Service[] = [
  { id: 'github', name: 'GitHub', icon: '🐙', category: 'DEV', authType: 'oauth' },
  { id: 'gcp', name: 'Google Cloud', icon: '☁️', category: 'CLOUD', authType: 'oauth' },
  { id: 'gworkspace', name: 'Google Workspace', icon: '💼', category: 'CLOUD', authType: 'oauth' },
  { id: 'vercel', name: 'Vercel', icon: '▲', category: 'DEV', authType: 'token' },
  { id: 'supabase', name: 'Supabase', icon: '⚡', category: 'DEV', authType: 'token' },
  { id: 'openai', name: 'ChatGPT', icon: '🤖', category: 'AI', authType: 'token' },
  { id: 'cloudflare', name: 'Cloudflare', icon: '🌐', category: 'CLOUD', authType: 'token' },
  { id: 'docker', name: 'Docker Hub', icon: '🐳', category: 'DEV', authType: 'local' },
  { id: 'vscode', name: 'VS Code Tunnel', icon: '💻', category: 'DEV', authType: 'local' },
  { id: 'ssh', name: 'Local SSH Key', icon: '🔑', category: 'DEV', authType: 'local' },
];

export const ConnectorsManager: React.FC<ConnectorsManagerProps> = ({ user, onUserUpdate }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; service: Service | null }>({ isOpen: false, service: null });
  const [syncingIds, setSyncingIds] = useState<string[]>([]);
  
  const handleTokenSubmit = async (apiKey: string) => {
    if (!modalState.service) return;
    const serviceId = modalState.service.id;
    setSyncingIds(prev => [...prev, serviceId]);
    try {
      const { success, message, user: updatedUser } = await ApiService.connections.validate(serviceId, apiKey);
      if (success && updatedUser) {
        onUserUpdate(updatedUser);
      } else {
        throw new Error(message || 'Validation failed');
      }
    } finally {
      setSyncingIds(prev => prev.filter(id => id !== serviceId));
    }
  };
  
  const renderSyncButton = (service: Service) => {
    const isConnected = user?.connections?.[service.id]?.connected;
    const isSyncing = syncingIds.includes(service.id);

    const commonProps = {
      disabled: isSyncing,
      className: "w-full mt-4 py-3 bg-white/5 border-[0.5px] border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
    };

    if (service.authType === 'oauth') {
      return (
        <a href={`/api/auth/${service.id}`} {...commonProps} style={{display: 'block', textAlign: 'center'}}>
          {isConnected ? 'Re-Auth' : 'Connect'}
        </a>
      );
    }
    
    if (service.authType === 'token') {
      return (
        <button onClick={() => setModalState({ isOpen: true, service })} {...commonProps}>
          {isSyncing ? 'Validating...' : isConnected ? 'Update Key' : 'Connect'}
        </button>
      );
    }

    return <button {...commonProps} onClick={() => alert('Local connection setup required.')}>Check Status</button>;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic mb-10">Universal Sync</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_CONNECTORS.map(service => {
          const connection = user?.connections?.[service.id];
          const isConnected = connection?.connected;
          const status = isConnected ? 'connected' : 'disconnected';
          
          return (
            <div key={service.id} className="p-8 rounded-[40px] bg-white/[0.01] border-[0.5px] border-white/10 hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-7xl">{service.icon}</span>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">{service.icon}</div>
                  <div className={`w-2.5 h-2.5 rounded-full ${ isConnected ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-zinc-800' }`}></div>
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-1">{service.name}</h4>
                  <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.3em] italic">{connection?.username || status}</span>
                </div>
              </div>
              <div className="relative z-10">{renderSyncButton(service)}</div>
            </div>
          );
        })}
      </div>
      
      {modalState.isOpen && modalState.service && (
        <ApiKeyModal 
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, service: null })}
          onSubmit={handleTokenSubmit}
          serviceName={modalState.service.name}
          serviceIcon={modalState.service.icon}
        />
      )}
    </div>
  );
};
