import React, { useState, useEffect } from 'react';

interface SyncComponentStatus {
  component: 'git' | 'docker' | 'gcp' | 'cloudflare' | 'workspace';
  status: 'synced' | 'syncing' | 'error' | 'unknown';
  lastSync: string | null;
  message: string;
}

interface SyncState {
  git: SyncComponentStatus;
  docker: SyncComponentStatus;
  gcp: SyncComponentStatus;
  cloudflare: SyncComponentStatus;
  workspace: SyncComponentStatus;
  lastFullSync: string | null;
  isSyncing?: boolean;
  isWatchMode?: boolean;
}

const API_BASE_URL = '/api';

const ComponentIcon: Record<string, string> = {
  git: '🔄',
  docker: '🐳',
  gcp: '☁️',
  cloudflare: '🔐',
  workspace: '📊'
};

const StatusColor: Record<string, string> = {
  synced: 'bg-green-500',
  syncing: 'bg-blue-500',
  error: 'bg-red-500',
  unknown: 'bg-gray-500'
};

const StatusText: Record<string, string> = {
  synced: 'Synced',
  syncing: 'Syncing...',
  error: 'Error',
  unknown: 'Unknown'
};

export const SyncStatusPanel: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/status`);
      if (response.ok) {
        const data = await response.json();
        setSyncState(data);
        setError(null);
      } else {
        setError('Failed to fetch sync status');
      }
    } catch (err) {
      setError('Network error while fetching status');
      console.error('Failed to fetch sync status:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async (watch: boolean = false) => {
    setTriggering(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/sync/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ watch })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh status immediately after triggering
        setTimeout(() => fetchStatus(), 1000);
      } else {
        setError(result.message || 'Failed to trigger sync');
      }
    } catch (err) {
      setError('Network error while triggering sync');
      console.error('Failed to trigger sync:', err);
    } finally {
      setTriggering(false);
    }
  };

  const stopSync = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/stop`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (result.success) {
        setTimeout(() => fetchStatus(), 1000);
      } else {
        setError(result.message || 'Failed to stop sync');
      }
    } catch (err) {
      setError('Network error while stopping sync');
      console.error('Failed to stop sync:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm opacity-60">Loading sync status...</p>
        </div>
      </div>
    );
  }

  if (!syncState) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Failed to load sync status</p>
        <button
          onClick={() => fetchStatus()}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const components: Array<keyof Omit<SyncState, 'lastFullSync' | 'isSyncing' | 'isWatchMode'>> = [
    'git', 'docker', 'gcp', 'cloudflare', 'workspace'
  ];

  return (
    <div className="h-full w-full bg-[#000000] p-10 lg:p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-16">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">Infinity Sync</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-4 italic">
              Real-Time Ecosystem Synchronization
            </p>
            {syncState.lastFullSync && (
              <p className="text-xs opacity-40">
                Last full sync: {formatTimestamp(syncState.lastFullSync)}
              </p>
            )}
          </div>
          
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-xs opacity-60">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            
            {syncState.isWatchMode ? (
              <button
                onClick={stopSync}
                className="px-8 py-3 bg-red-600/20 border border-red-500/40 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-red-600/30 transition-all"
              >
                Stop Watch Mode
              </button>
            ) : (
              <>
                <button
                  onClick={() => triggerSync(false)}
                  disabled={triggering || syncState.isSyncing}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {triggering ? 'Triggering...' : 'Force Sync'}
                </button>
                <button
                  onClick={() => triggerSync(true)}
                  disabled={triggering || syncState.isSyncing}
                  className="px-8 py-3 electric-gradient rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-white shadow-glow border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start Watch Mode
                </button>
              </>
            )}
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/40 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Status Indicator */}
        {(syncState.isSyncing || syncState.isWatchMode) && (
          <div className="p-6 bg-blue-900/20 border border-blue-500/40 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold uppercase tracking-wider">
                {syncState.isWatchMode ? 'Watch Mode Active - Continuous Sync' : 'Sync in Progress'}
              </span>
            </div>
          </div>
        )}

        {/* Component Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {components.map((componentKey) => {
            const component = syncState[componentKey];
            return (
              <div
                key={componentKey}
                className="p-8 rounded-[40px] bg-white/[0.01] border border-white/10 hover:border-blue-500/40 transition-all group shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[280px]"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <span className="text-6xl">{ComponentIcon[componentKey]}</span>
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-white/10 bg-black shadow-inner">
                      {ComponentIcon[componentKey]}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${StatusColor[component.status]} ${component.status === 'syncing' ? 'animate-pulse' : ''} shadow-glow-green`}></div>
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-1">
                      {componentKey.toUpperCase()}
                    </h4>
                    <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] italic">
                      {StatusText[component.status]}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 relative z-10 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center text-[10px] font-mono opacity-30 uppercase italic">
                    <span>Last Sync</span>
                    <span className="text-white">{formatTimestamp(component.lastSync)}</span>
                  </div>
                  
                  <div className="text-[10px] opacity-40 italic">
                    {component.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health Visualization */}
        <section className="p-12 rounded-[56px] bg-zinc-950 border border-white/5 shadow-inner space-y-12">
          <div className="flex items-center gap-6">
            <h3 className="text-2xl font-black italic uppercase tracking-widest">Sync Pulse Monitor</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {components.map((comp) => {
              const component = syncState[comp];
              const healthScore = component.status === 'synced' ? 100 : 
                                 component.status === 'syncing' ? 75 :
                                 component.status === 'error' ? 25 : 50;
              
              return (
                <div key={comp} className="text-center space-y-3">
                  <div className="text-3xl mb-2">{ComponentIcon[comp]}</div>
                  <div className="h-32 bg-white/5 rounded-xl relative overflow-hidden">
                    <div 
                      className={`absolute bottom-0 w-full transition-all duration-1000 ${
                        component.status === 'synced' ? 'bg-green-500/40' :
                        component.status === 'syncing' ? 'bg-blue-500/40 animate-pulse' :
                        component.status === 'error' ? 'bg-red-500/40' :
                        'bg-gray-500/40'
                      }`}
                      style={{ height: `${healthScore}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-wider opacity-40">
                    {comp}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
