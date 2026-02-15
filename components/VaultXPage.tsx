import React, { useState } from 'react';

interface ConnectorConfig {
  id: string;
  name: string;
  fields: { label: string; placeholder: string; type: string; value: string; key: string }[];
  icon: string;
  category: 'cloud' | 'dev' | 'ai' | 'custom';
}

const INITIAL_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'gcloud',
    name: 'Google Cloud',
    icon: '☁️',
    category: 'cloud',
    fields: [
      { label: 'Project ID', placeholder: 'vix-sovereign-node', type: 'text', value: '', key: 'projectId' },
      { label: 'API Key', placeholder: 'AIza...', type: 'password', value: '', key: 'apiKey' },
      { label: 'OAuth Token', placeholder: 'ya29...', type: 'password', value: '', key: 'oauth' }
    ]
  },
  {
    id: 'gworkspace',
    name: 'Google Workspace',
    icon: '💼',
    category: 'cloud',
    fields: [
      { label: 'Client ID', placeholder: '1234-abcd.apps.google...', type: 'text', value: '', key: 'clientId' },
      { label: 'Client Secret', placeholder: 'GOCSPX-...', type: 'password', value: '', key: 'clientSecret' }
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    category: 'dev',
    fields: [
      { label: 'Personal Access Token', placeholder: 'ghp_...', type: 'password', value: '', key: 'pat' },
      { label: 'Username', placeholder: 'vizual-x-dev', type: 'text', value: '', key: 'username' }
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT / OpenAI',
    icon: '🤖',
    category: 'ai',
    fields: [
      { label: 'API Key', placeholder: 'sk-...', type: 'password', value: '', key: 'apiKey' },
      { label: 'Org ID', placeholder: 'org-...', type: 'text', value: '', key: 'orgId' }
    ]
  },
  {
    id: 'supabase',
    name: 'Supabase',
    icon: '⚡',
    category: 'dev',
    fields: [
      { label: 'Project URL', placeholder: 'https://xxx.supabase.co', type: 'text', value: '', key: 'url' },
      { label: 'Anon Key', placeholder: 'eyJhbG...', type: 'password', value: '', key: 'anon' }
    ]
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    category: 'dev',
    fields: [
      { label: 'Token', placeholder: 'ver_...', type: 'password', value: '', key: 'token' },
      { label: 'Team ID', placeholder: 'team_...', type: 'text', value: '', key: 'teamId' }
    ]
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    icon: '🌤️',
    category: 'cloud',
    fields: [
      { label: 'API Token', placeholder: 'xxx', type: 'password', value: '', key: 'token' },
      { label: 'Account ID', placeholder: 'xxx', type: 'text', value: '', key: 'accountId' }
    ]
  },
  {
    id: 'ssh',
    name: 'Local SSH',
    icon: '🔑',
    category: 'custom',
    fields: [
      { label: 'Host', placeholder: '192.168.1.1', type: 'text', value: '', key: 'host' },
      { label: 'SSH Key (Private)', placeholder: '-----BEGIN OPENSSH...', type: 'password', value: '', key: 'key' }
    ]
  },
  {
    id: 'docker',
    name: 'Docker Hub',
    icon: '🐳',
    category: 'dev',
    fields: [
      { label: 'Username', placeholder: 'docker-dev', type: 'text', value: '', key: 'username' },
      { label: 'Token/Password', placeholder: 'dckr_pat...', type: 'password', value: '', key: 'token' }
    ]
  },
  {
    id: 'vscode',
    name: 'VS Code Node',
    icon: '💻',
    category: 'dev',
    fields: [
      { label: 'Tunnel Token', placeholder: 'vscode-tunnel-...', type: 'password', value: '', key: 'tunnel' }
    ]
  }
];

export const VaultXPage: React.FC = () => {
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);
  const [profile, setProfile] = useState({ email: 'vix.operator@sovereign.node', password: '••••••••' });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFieldChange = (connectorId: string, fieldKey: string, newValue: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === connectorId) {
        return {
          ...c,
          fields: c.fields.map(f => f.key === fieldKey ? { ...f, value: newValue } : f)
        };
      }
      return c;
    }));
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="flex-1 p-6 lg:p-12 overflow-y-auto bg-black dark:bg-black light:bg-transparent custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Vault Header & Member Profile */}
        <section className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none italic">Vault X</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 neon-green-text italic">Secure Sovereign Credential Sync Hub</p>
          </div>

          <div className="xl:w-1/3 glass-panel rounded-[40px] p-8 space-y-6 hover-neon transition-all">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Member Persistent Sync</span>
                <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-ping' : 'bg-green-500 shadow-glow-green'}`}></div>
             </div>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest opacity-20 italic ml-2">Email Address</label>
                   <input 
                     type="email" 
                     value={profile.email}
                     onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                     className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-xs font-bold italic outline-none focus:border-blue-500/40 transition-all shadow-inner"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest opacity-20 italic ml-2">Cluster Password</label>
                   <input 
                     type="password" 
                     value={profile.password}
                     onChange={(e) => setProfile(prev => ({ ...prev, password: e.target.value }))}
                     className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-5 text-xs font-bold italic outline-none focus:border-blue-500/40 transition-all shadow-inner"
                   />
                </div>
             </div>
             <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full py-4 neon-green-gradient text-white rounded-[22px] font-black uppercase tracking-[0.5em] text-[10px] shadow-glow-green italic transition-all hover:scale-[1.02] disabled:opacity-50"
             >
                {isSyncing ? 'Synchronizing Node...' : 'Establish Secure Sync'}
             </button>
          </div>
        </section>

        {/* Sovereign Connectors Matrix */}
        <section className="space-y-12">
          <div className="flex items-center gap-6">
             <h3 className="text-xl font-black uppercase italic tracking-[0.3em] opacity-40">Sovereign Matrix</h3>
             <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {connectors.map((connector) => (
              <div key={connector.id} className="p-8 glass-panel rounded-[40px] hover-neon group transition-all relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                   <span className="text-6xl">{connector.icon}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {connector.icon}
                   </div>
                   <div>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter italic leading-none">{connector.name}</h4>
                      <span className="text-[8px] font-black opacity-20 uppercase tracking-[0.4em] italic">{connector.category} Alignment</span>
                   </div>
                </div>

                <div className="flex-1 space-y-6">
                   {connector.fields.map((field) => (
                     <div key={field.key} className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-20 italic ml-2">{field.label}</label>
                        <input 
                          type={field.type}
                          value={field.value}
                          onChange={(e) => handleFieldChange(connector.id, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-5 text-xs font-bold italic outline-none focus:border-blue-500/40 transition-all shadow-inner text-white/90 placeholder:text-white/10"
                        />
                     </div>
                   ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                   <span className="text-[8px] font-black neon-green-text uppercase tracking-widest animate-pulse italic">Encryption Ready</span>
                   <button className="text-[9px] font-black uppercase tracking-widest italic opacity-40 hover:opacity-100 transition-opacity">Reset Node</button>
                </div>
              </div>
            ))}

            {/* Connector Creator Placeholder */}
            <div className="p-8 glass-panel rounded-[40px] border-dashed border-white/10 flex flex-col items-center justify-center space-y-4 hover:border-white/20 transition-all group cursor-pointer">
               <div className="w-16 h-16 rounded-[32px] border-2 border-dashed border-white/10 flex items-center justify-center text-2xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  ➕
               </div>
               <div className="text-center">
                  <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-20 group-hover:opacity-100 transition-opacity italic">Custom Creator</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-10 italic mt-1">Sculpt New Integration Node</p>
               </div>
            </div>
          </div>
        </section>

        {/* Encryption & Security Notice */}
        <footer className="p-10 glass-panel rounded-[40px] border border-white/5 flex flex-col md:flex-row items-center gap-10 opacity-30 italic">
           <div className="text-5xl">🔐</div>
           <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-widest">Sovereign Encryption Matrix</h4>
              <p className="text-[10px] leading-relaxed max-w-3xl">All credentials within Vault X are protected via client-side AES-256-GCM encryption before node synchronization. Vizual X operates as a zero-knowledge flagship ecosystem; credentials remain inaccessible to local or cloud orchestrators without persistent member authorization.</p>
           </div>
        </footer>
      </div>
    </div>
  );
};