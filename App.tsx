
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { MonacoEditor } from './components/MonacoEditor';
import { 
  Message, FileData, AppView, Theme, 
  AppSettings, ProjectAction, AIRecommendation, AdminMetrics,
  RefactorSuggestion, EditingMode, PipelineStep
} from './types';
import { sendMessageToGemini, analyzeCodeForRefactoring } from './services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [actionHistory, setActionHistory] = useState<ProjectAction[]>([]);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('vizual-x-sovereign-settings');
    if (saved) return JSON.parse(saved);
    return {
      theme: 'dark',
      userName: 'Architect-One',
      autoLint: true,
      sandboxMode: true,
      advancedSecurity: true,
      aiModel: 'gemini-3-pro-preview',
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxTokens: 8192,
      thinkingBudget: 0,
      googleStudioFeatures: true,
      githubSparksEnabled: true,
      groundingEnabled: false,
      editingMode: 'full-code',
      vertexEndpoint: 'us-central1',
      autonomousAgentActive: false,
      parallelInstanceCount: 4,
      hybridCloudSync: true,
      safety: {
        harassment: 'BLOCK_LOW_AND_ABOVE',
        hateSpeech: 'BLOCK_LOW_AND_ABOVE',
        sexuallyExplicit: 'BLOCK_LOW_AND_ABOVE',
        dangerousContent: 'BLOCK_LOW_AND_ABOVE'
      },
      connectors: [
        { id: 'github', name: 'GitHub Enterprise', type: 'github', status: 'connected' },
        { id: 'google', name: 'GCP Vertex Console', type: 'google', status: 'connected' },
        { id: 'docker', name: 'Docker Engine', type: 'service', status: 'connected' },
      ]
    };
  });

  const [metrics, setMetrics] = useState<AdminMetrics>({
    cpuUsage: 14, memoryUsage: 1024, apiLatency: 38, activeDeployments: 24, globalTraffic: 15400, serverlessExecutionCount: 890201
  });

  const [files, setFiles] = useState<FileData[]>(() => {
    const saved = localStorage.getItem('glass-code-files');
    return saved ? JSON.parse(saved) : [
      { id: 'core', name: 'AutonomousCore.tsx', language: 'tsx', content: 'export default function Agent() {\n  return (\n    <div className="flex flex-col gap-4 p-8 bg-zinc-950 border border-white/5 rounded-3xl">\n      <h1 className="text-3xl font-black italic text-blue-500">MANUS AGENT ACTIVE</h1>\n      <p className="text-xs opacity-40 uppercase tracking-[0.3em]">Recursive Pipeline Engine</p>\n    </div>\n  );\n}' }
    ];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>('core');
  const activeFile = files.find(f => f.id === activeFileId) || null;

  useEffect(() => {
    localStorage.setItem('vizual-x-sovereign-settings', JSON.stringify(settings));
    document.body.className = settings.theme;
  }, [settings]);

  useEffect(() => {
    if (settings.autonomousAgentActive) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          cpuUsage: Math.floor(Math.random() * 30) + 10,
          apiLatency: Math.floor(Math.random() * 20) + 30,
          serverlessExecutionCount: prev.serverlessExecutionCount + Math.floor(Math.random() * 10)
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [settings.autonomousAgentActive]);

  const recordAction = useCallback((
    type: ProjectAction['type'], 
    description: string, 
    filesToSave: FileData[],
    codeSnippet?: string
  ) => {
    const action: ProjectAction = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      description,
      type,
      filesSnapshot: JSON.parse(JSON.stringify(filesToSave)),
      status: 'perfect',
      isLocked: true,
      codeSnippet,
    };
    setActionHistory(prev => [action, ...prev]);
    return action.id;
  }, []);

  const triggerPipeline = useCallback(async () => {
    setView('pipeline');
    const steps: PipelineStep[] = [
      { id: '1', label: 'Spawning Parallel Instances', status: 'active', timestamp: new Date(), logs: ['Allocating us-central1 nodes...', 'Spawning 4 Docker containers...'] },
      { id: '2', label: 'Analyzing Workspace Graph', status: 'pending', timestamp: new Date(), logs: [] },
      { id: '3', label: 'Recursive Refactoring', status: 'pending', timestamp: new Date(), logs: [] },
      { id: '4', label: 'Cloud-Hybrid Persistence Sync', status: 'pending', timestamp: new Date(), logs: [] },
    ];
    setPipelineSteps(steps);

    // Simulate Manus-style autonomous progression
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500));
      setPipelineSteps(prev => prev.map((s, idx) => {
        if (idx === i) return { ...s, status: 'completed' as const, logs: [...s.logs, 'Step finalized successfully.'] };
        if (idx === i + 1) return { ...s, status: 'active' as const, logs: ['Requesting Gemini Pro inference...', 'Injecting patterns...'] };
        return s;
      }));
    }
    
    setRecommendation({ id: 'r1', text: 'Pipeline Optimized. 4 new micro-service patterns identified.', priority: 'high' });
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
      const stream = await sendMessageToGemini(text, history, settings);
      
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

      for await (const chunk of stream) {
        assistantContent += chunk.text || "";
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
      }

      // Natural language code ingestion
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let match;
      const extracted: FileData[] = [];
      while ((match = codeBlockRegex.exec(assistantContent)) !== null) {
        extracted.push({ 
          id: Math.random().toString(36).substr(2, 9), 
          name: `autonomous-${Date.now() % 1000}.${match[1] || 'tsx'}`, 
          language: match[1] || 'tsx', 
          content: match[2].trim() 
        });
      }

      if (extracted.length > 0) {
        setFiles(prev => {
          const next = [...prev, ...extracted];
          recordAction('autonomous_patch', `Autonomous Agent Update: ${extracted.length} nodes injected`, next, extracted[0].content);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [messages, settings, recordAction]);

  const renderViewContent = () => {
    const cardBase = "bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl transition-all hover:border-blue-500/30";
    
    switch (view) {
      case 'settings':
        return (
          <div className="flex-1 flex flex-col p-12 overflow-auto space-y-12 custom-scrollbar animate-in fade-in duration-500">
            <header className="flex justify-between items-end border-b border-white/10 pb-8">
              <div>
                <h2 className="text-6xl font-black tracking-tighter uppercase bg-gradient-to-r from-blue-500 to-white bg-clip-text text-transparent italic">Vertex Studio</h2>
                <p className="text-[11px] opacity-40 font-mono-code uppercase tracking-[0.5em] mt-3">Sovereign Flagship Configuration</p>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={() => setSettings(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark'}))}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                 >
                   <div className={`w-2 h-2 rounded-full ${settings.theme === 'dark' ? 'bg-indigo-500' : 'bg-orange-500'}`}></div>
                   Theme: {settings.theme}
                 </button>
              </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Agent Settings */}
              <div className={`${cardBase} space-y-8`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Autonomous Agent</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-xs font-black uppercase">Enable Manus Engine</p>
                      <p className="text-[9px] opacity-40 uppercase mt-1">Recursive Pipeline Cycles</p>
                    </div>
                    <input type="checkbox" checked={settings.autonomousAgentActive} onChange={e => setSettings({...settings, autonomousAgentActive: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Parallel Instance Count</label>
                    <div className="flex gap-2">
                       {[1, 2, 4, 8, 16].map(num => (
                         <button key={num} onClick={() => setSettings({...settings, parallelInstanceCount: num})} className={`flex-1 py-3 rounded-xl border text-xs font-black transition-all ${settings.parallelInstanceCount === num ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20 text-white' : 'bg-white/5 border-white/10 hover:border-white/30 text-slate-400'}`}>
                           {num}x
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-xs font-black uppercase">Hybrid Cloud Sync</span>
                    <input type="checkbox" checked={settings.hybridCloudSync} onChange={e => setSettings({...settings, hybridCloudSync: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                  </div>
                </div>
              </div>

              {/* Vertex Core */}
              <div className={`${cardBase} xl:col-span-2 space-y-10`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Vertex Core Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-60">
                           <span>Reasoning Temp</span>
                           <span className="text-blue-500">{settings.temperature}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.01" value={settings.temperature} onChange={e => setSettings({...settings, temperature: parseFloat(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-60">
                           <span>Top-P Sampling</span>
                           <span className="text-blue-500">{settings.topP}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.01" value={settings.topP} onChange={e => setSettings({...settings, topP: parseFloat(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                     </div>
                   </div>
                   <div className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Sovereign Model</label>
                        <select value={settings.aiModel} onChange={e => setSettings({...settings, aiModel: e.target.value})} className="w-full bg-black/60 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none text-blue-400">
                           <option value="gemini-3-pro-preview">Gemini 3 Pro Sovereign</option>
                           <option value="gemini-3-flash-preview">Gemini 3 Flash Native</option>
                           <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Regional Endpoint</label>
                        <select value={settings.vertexEndpoint} onChange={e => setSettings({...settings, vertexEndpoint: e.target.value as any})} className="w-full bg-black/60 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none">
                           <option value="us-central1">Iowa (us-central1)</option>
                           <option value="europe-west1">Belgium (europe-west1)</option>
                           <option value="asia-northeast1">Tokyo (asia-northeast1)</option>
                        </select>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="flex-1 flex flex-col p-12 overflow-auto space-y-12 bg-black animate-in fade-in duration-700">
             <header className="flex justify-between items-end border-b border-white/10 pb-8">
              <div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic">Autonomous Pipeline</h2>
                <p className="text-[10px] opacity-40 font-mono-code uppercase tracking-[0.4em] mt-2">Recursive State Synchronization Engine</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase opacity-40">Agent Status</span>
                  <span className="text-xs font-black text-blue-500 animate-pulse">RECURSIVE REFACTORING ACTIVE</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               {pipelineSteps.map((step) => (
                 <div key={step.id} className={`${cardBase} flex flex-col gap-6 ${step.status === 'active' ? 'border-blue-500 shadow-blue-500/20' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                        step.status === 'completed' ? 'bg-green-500 text-white' : 
                        step.status === 'active' ? 'bg-blue-600 text-white animate-pulse' : 'bg-white/5 text-white/20'
                      }`}>
                        {step.id}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        step.status === 'completed' ? 'text-green-500' : 
                        step.status === 'active' ? 'text-blue-500' : 'opacity-20'
                      }`}>{step.status}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase text-white mb-2">{step.label}</h4>
                      <div className="space-y-1 mt-4">
                        {step.logs.map((log, i) => (
                          <p key={i} className="text-[9px] font-mono-code opacity-40 leading-relaxed truncate">{log}</p>
                        ))}
                      </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className={`${cardBase} flex-1 min-h-[400px] flex flex-col p-0 overflow-hidden`}>
               <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                 <h3 className="text-sm font-black uppercase tracking-widest">Active Execution Sandbox</h3>
                 <div className="flex items-center gap-4">
                    <span className="text-[9px] font-mono-code opacity-30">Thread: T-X144</span>
                    <button className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase">Kill Process</button>
                 </div>
               </div>
               <div className="flex-1 bg-black">
                  <MonacoEditor activeFile={{ id: 'sandbox', name: 'sandbox-execution.log', language: 'markdown', content: pipelineSteps.flatMap(s => s.logs).join('\n') }} theme={settings.theme} />
               </div>
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="flex-1 flex flex-col p-12 overflow-auto space-y-12 animate-in slide-in-from-bottom-10 duration-500">
             <header className="flex justify-between items-end border-b border-white/10 pb-8">
              <div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic">Infrastructure Admin</h2>
                <p className="text-[10px] opacity-40 font-mono-code uppercase tracking-[0.4em] mt-2">Bare Metal & Docker Container Orchestrator</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Cluster Load', val: `${metrics.cpuUsage}%`, color: 'text-blue-400' },
                { label: 'Api P99', val: `${metrics.apiLatency}ms`, color: 'text-purple-400' },
                { label: 'Active Containers', val: '24', color: 'text-green-400' },
                { label: 'Cloud Executions', val: '890.2k', color: 'text-orange-400' }
              ].map(stat => (
                <div key={stat.label} className={`${cardBase} h-32 flex flex-col justify-between`}>
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-3xl font-black ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className={`${cardBase} space-y-6`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest">Persistent Docker Sync</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black uppercase opacity-60">Connected: Desktop Mirror</span>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                     <div className="p-4 border-b border-white/5 flex justify-between items-center text-[10px] font-black uppercase opacity-40">
                        <span>Image ID</span>
                        <span>Status</span>
                     </div>
                     {[1, 2, 3].map(i => (
                       <div key={i} className="p-4 border-b border-white/5 last:border-0 flex justify-between items-center group hover:bg-white/5 transition-all">
                          <span className="text-xs font-mono-code opacity-80">vix-runtime-0{i}:latest</span>
                          <span className="text-[10px] font-black text-green-500 uppercase">Running</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className={`${cardBase} space-y-6`}>
                  <h3 className="text-sm font-black uppercase tracking-widest">GCP Governance</h3>
                  <div className="space-y-4">
                     {[
                       { label: 'Vertex AI API', status: 'Enabled' },
                       { label: 'Cloud Run Service', status: 'Healthy' },
                       { label: 'BigQuery Persistence', status: 'Active' },
                       { label: 'Identity Engine', status: 'Locked' },
                     ].map(gov => (
                       <div key={gov.label} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-white/60">{gov.label}</span>
                          <span className="text-[9px] font-black text-blue-500 uppercase">{gov.status}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="flex-1 flex flex-col bg-black p-6">
            <div className="h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-8 backdrop-blur-xl mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Preview Container: {activeFile?.name}</h3>
               </div>
               <button onClick={() => setView('chat')} className="px-5 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">Exit Sandbox</button>
            </div>
            <div className="flex-1 rounded-3xl bg-white overflow-hidden shadow-2xl relative">
              {livePreviewUrl ? (
                <iframe src={livePreviewUrl} className="w-full h-full border-0" title="Vizual X Live Preview" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400 font-mono-code text-sm">Initializing Runtime Engine...</div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex flex-col h-full relative">
            <MonacoEditor 
              activeFile={activeFile} 
              onRefactor={async (f) => analyzeCodeForRefactoring(f.name, f.content)}
              lastSaved={lastSaved} 
              onContentChange={(c) => activeFile && setFiles(prev => prev.map(f => f.id === activeFile.id ? {...f, content: c} : f))} 
              theme={settings.theme} 
            />
            {/* Autonomous Action Bar */}
            <div className={`h-16 border-t px-8 flex items-center justify-between ${settings.theme === 'light' ? 'bg-white border-black/10' : 'bg-zinc-900 border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]'}`}>
               <div className="flex items-center gap-6">
                  <button onClick={triggerPipeline} className="flex items-center gap-3 px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.243a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM16 18a1 1 0 100-2 1 1 0 000 2z" /></svg>
                    Recursive Pipeline
                  </button>
                  <button onClick={() => setSettings(s => ({...s, hybridCloudSync: !s.hybridCloudSync}))} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.hybridCloudSync ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                    Cloud/Docker Sync: {settings.hybridCloudSync ? 'Active' : 'Offline'}
                  </button>
               </div>
               <div className="flex items-center gap-4 text-[9px] font-mono-code opacity-30 uppercase tracking-[0.3em]">
                  <span>Instances: {settings.parallelInstanceCount}x</span>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Sovereign Link: Stable</span>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 ${settings.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-black text-white'} overflow-hidden font-inter`}>
      {/* Sovereign Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 ${settings.theme === 'light' ? 'opacity-[0.03]' : 'opacity-[0.15]'}`} style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${settings.theme === 'light' ? 'black' : 'white'} 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] ${settings.theme === 'light' ? 'bg-blue-400/10' : 'bg-blue-600/5'} blur-[250px] rounded-full`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${settings.theme === 'light' ? 'bg-indigo-400/10' : 'bg-indigo-600/5'} blur-[200px] rounded-full`}></div>
      </div>

      <div className="relative z-10 flex w-full h-full">
        <ChatSidebar 
          messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} files={files} activeFileId={activeFileId} 
          onSelectFile={setActiveFileId} onDeleteFile={(id) => setFiles(prev => prev.filter(f => f.id !== id))} 
          currentView={view} onViewChange={setView} theme={settings.theme} 
          onToggleTheme={() => setSettings(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark'}))} 
          onRollback={(id) => {
            const snap = actionHistory.find(a => a.id === id);
            if (snap) { setFiles(snap.filesSnapshot); }
          }} 
          actionHistory={actionHistory} recommendation={recommendation}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {renderViewContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
