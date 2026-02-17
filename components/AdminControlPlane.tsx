import React, { useState, useEffect } from 'react';
import { InfinityMatrix } from './InfinityMatrix';

interface CloudRunService {
  name: string;
  status: string;
  url?: string;
  region?: string;
}

interface PubSubTopic {
  name: string;
  labels?: Record<string, string>;
}

interface EnabledAPI {
  name: string;
  title: string;
  state: string;
}

interface DockerContainer {
  name: string;
  image: string;
  status: string;
}

interface OllamaModel {
  name: string;
  size?: string;
}

interface SystemHealth {
  score: number;
  status: 'healthy' | 'degraded' | 'critical';
  cloudRunCount: number;
  pubSubCount: number;
  apiCount: number;
  dockerCount: number;
  ollamaCount: number;
}

interface InventoryData {
  timestamp: string;
  health: SystemHealth;
  cloud: {
    cloudRunServices: CloudRunService[];
    pubSubTopics: PubSubTopic[];
    enabledAPIs: EnabledAPI[];
  };
  local: {
    dockerContainers: DockerContainer[];
    ollamaModels: OllamaModel[];
  };
}

export const AdminControlPlane: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
    // Refresh every 30 seconds
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInventory = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/inventory/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setInventory(data);
      setError(null);
    } catch (err) {
      console.error('[AdminControlPlane] Failed to fetch inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-[#000000] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Loading Inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-[#000000] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full p-8 rounded-3xl bg-red-950/20 border border-red-500/30">
          <h3 className="text-2xl font-black uppercase italic text-red-400 mb-4">Connection Error</h3>
          <p className="text-white/60 mb-4">{error}</p>
          <button 
            onClick={fetchInventory}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return null;
  }

  const healthColor = inventory.health.status === 'healthy' ? 'green' : 
                      inventory.health.status === 'degraded' ? 'amber' : 'red';

  return (
    <div className="h-full w-full bg-[#000000] p-10 lg:p-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-16">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Admin Control Plane
            </h2>
            <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-4 italic">
              Infinity Consolidation Architecture
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className={`text-sm font-black uppercase tracking-widest italic text-${healthColor}-400`}>
                System {inventory.health.status}
              </div>
              <div className="text-[10px] font-mono opacity-40">Score: {inventory.health.score}/100</div>
            </div>
            <div className={`w-4 h-4 rounded-full bg-${healthColor}-500 shadow-glow-${healthColor} ${inventory.health.status === 'degraded' ? 'animate-pulse' : ''}`}></div>
          </div>
        </header>

        {/* Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-blue-500/40 transition-all">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Cloud Run</div>
            <div className="text-4xl font-black italic">{inventory.health.cloudRunCount}</div>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-blue-500/40 transition-all">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Pub/Sub Topics</div>
            <div className="text-4xl font-black italic">{inventory.health.pubSubCount}</div>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-blue-500/40 transition-all">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Enabled APIs</div>
            <div className="text-4xl font-black italic">{inventory.health.apiCount}</div>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-blue-500/40 transition-all">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Docker Containers</div>
            <div className="text-4xl font-black italic">{inventory.health.dockerCount}</div>
          </div>
        </div>

        {/* Infinity Matrix - Cloud Run Services */}
        <InfinityMatrix cloudRunServices={inventory.cloud.cloudRunServices} />

        {/* Local Resources */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black italic uppercase tracking-widest">Local Resources</h3>
          
          {/* Docker Containers */}
          {inventory.local.dockerContainers.length > 0 && (
            <div className="p-8 rounded-[40px] bg-zinc-950 border border-white/5">
              <h4 className="text-lg font-black uppercase italic tracking-wider mb-6 opacity-60">Docker Containers</h4>
              <div className="space-y-3">
                {inventory.local.dockerContainers.map((container, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl">
                    <div>
                      <div className="font-mono text-sm">{container.name}</div>
                      <div className="text-[10px] opacity-40">{container.image}</div>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60">{container.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ollama Models */}
          {inventory.local.ollamaModels.length > 0 && (
            <div className="p-8 rounded-[40px] bg-zinc-950 border border-white/5">
              <h4 className="text-lg font-black uppercase italic tracking-wider mb-6 opacity-60">Ollama Models</h4>
              <div className="space-y-3">
                {inventory.local.ollamaModels.map((model, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl">
                    <div className="font-mono text-sm">{model.name}</div>
                    {model.size && <div className="text-xs opacity-40">{model.size}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="text-center text-[10px] font-mono opacity-20">
          Last updated: {new Date(inventory.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
