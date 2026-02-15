import React, { useState, useEffect } from 'react';
import { InfinityMatrix } from './InfinityMatrix';
import { manusService, HealthStatus, MatrixStatus } from '../services/manusService';
import { Subsystem } from '../types';

export const AdminControlPlane: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [matrixStatus, setMatrixStatus] = useState<MatrixStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [healthData, matrixData] = await Promise.all([
        manusService.getHealth(),
        manusService.getMatrixStatus()
      ]);
      setHealth(healthData);
      setMatrixStatus(matrixData);
      setLastRefresh(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch admin data';
      console.error('Error fetching data:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (repo: string) => {
    try {
      setSyncMessage(null);
      const result = await manusService.syncRepo(repo);
      if (result.success) {
        setSyncMessage({ type: 'success', text: result.message });
        // Refresh data after sync
        await fetchData();
        // Clear message after 3 seconds
        setTimeout(() => setSyncMessage(null), 3000);
      } else {
        setSyncMessage({ type: 'error', text: 'Sync failed' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync repository';
      console.error('Error syncing repo:', error);
      setSyncMessage({ type: 'error', text: errorMessage });
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const getHealthColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'neon-green-text';
      case 'degraded':
        return 'neon-yellow-text';
      case 'error':
        return 'neon-red-text';
      default:
        return 'opacity-50';
    }
  };

  const getSyncStatusColor = (status?: string) => {
    switch (status) {
      case 'idle':
        return 'neon-green-text';
      case 'syncing':
        return 'electric-text';
      case 'error':
        return 'neon-red-text';
      default:
        return 'opacity-50';
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-12 overflow-y-auto bg-black dark:bg-black light:bg-transparent custom-scrollbar animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-[20px] flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-black neon-red-text uppercase tracking-wider">Error Loading Data</p>
              <p className="text-xs opacity-60 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Sync Message Banner */}
        {syncMessage && (
          <div className={`p-4 ${syncMessage.type === 'success' ? 'bg-green-900/20 border-green-600/50' : 'bg-red-900/20 border-red-600/50'} border rounded-[20px] flex items-center gap-3`}>
            <span className="text-2xl">{syncMessage.type === 'success' ? '✅' : '❌'}</span>
            <div>
              <p className={`text-sm font-black uppercase tracking-wider ${syncMessage.type === 'success' ? 'neon-green-text' : 'neon-red-text'}`}>
                {syncMessage.type === 'success' ? 'Sync Successful' : 'Sync Failed'}
              </p>
              <p className="text-xs opacity-60 mt-1">{syncMessage.text}</p>
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-2">
                Admin Control Plane
              </h2>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 neon-green-text italic">
                Infinity Orchestrator Management Hub
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-[20px] text-[9px] font-black uppercase tracking-widest italic hover-neon disabled:opacity-30"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* System Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 glass-panel rounded-[32px] hover-neon group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">🏥</div>
              <p className="text-[10px] font-black opacity-30 tracking-[0.3em] uppercase mb-4">
                Backend Status
              </p>
              <p className={`text-2xl font-black italic tracking-tighter mb-2 ${getHealthColor(health?.status)}`}>
                {health?.status?.toUpperCase() || 'UNKNOWN'}
              </p>
              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest italic">
                v{health?.version || 'N/A'}
              </span>
            </div>

            <div className="p-8 glass-panel rounded-[32px] hover-neon group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">⏱️</div>
              <p className="text-[10px] font-black opacity-30 tracking-[0.3em] uppercase mb-4">
                System Uptime
              </p>
              <p className="text-2xl font-black italic tracking-tighter mb-2 neon-green-text">
                {health ? formatUptime(health.uptime) : 'N/A'}
              </p>
              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest italic">
                Continuous
              </span>
            </div>

            <div className="p-8 glass-panel rounded-[32px] hover-neon group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">🤖</div>
              <p className="text-[10px] font-black opacity-30 tracking-[0.3em] uppercase mb-4">
                Active Agents
              </p>
              <p className="text-2xl font-black italic tracking-tighter mb-2 neon-green-text">
                {matrixStatus?.mcpState.activeAgents || 0}
              </p>
              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest italic">
                MCP Connected
              </span>
            </div>

            <div className="p-8 glass-panel rounded-[32px] hover-neon group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">🔄</div>
              <p className="text-[10px] font-black opacity-30 tracking-[0.3em] uppercase mb-4">
                Sync Status
              </p>
              <p className={`text-2xl font-black italic tracking-tighter mb-2 ${getSyncStatusColor(matrixStatus?.mcpState.syncStatus)}`}>
                {matrixStatus?.mcpState.syncStatus?.toUpperCase() || 'UNKNOWN'}
              </p>
              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest italic">
                {matrixStatus?.mcpState.lastSync ? new Date(matrixStatus.mcpState.lastSync).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </section>

        {/* MCP Connection Status */}
        <section className="p-8 lg:p-10 glass-panel rounded-[50px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <span className="text-9xl font-black italic">MCP</span>
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                  MCP Mesh Status
                </h3>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30 italic">
                  Model Context Protocol Network
                </p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-[20px]">
                <div className={`w-2 h-2 rounded-full ${matrixStatus?.mcpState.connected ? 'neon-green-gradient animate-pulse shadow-glow-green' : 'bg-red-600 animate-pulse'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">
                  {matrixStatus?.mcpState.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-[24px]">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">
                  Environment
                </p>
                <p className="text-lg font-black italic tracking-tighter">
                  {matrixStatus?.manifest.environment.toUpperCase() || 'N/A'}
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-[24px]">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">
                  Mode
                </p>
                <p className="text-lg font-black italic tracking-tighter">
                  {matrixStatus?.manifest.mode.toUpperCase() || 'N/A'}
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-[24px]">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">
                  Last Refresh
                </p>
                <p className="text-lg font-black italic tracking-tighter">
                  {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Infinity Matrix Component */}
        {matrixStatus && (
          <InfinityMatrix 
            subsystems={matrixStatus.manifest.subsystems}
            onSync={handleSync}
          />
        )}
      </div>
    </div>
  );
};
