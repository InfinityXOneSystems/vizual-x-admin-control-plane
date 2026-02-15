
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { MonacoEditor } from './components/MonacoEditor';
import { 
  Message, FileData, AppView, Theme, 
  AppSettings, Connector, ProjectAction, AIRecommendation, AdminMetrics,
  CloudRunService, DockerContainer, MediaItem
} from './types';
import { sendMessageToGemini, generateImage, generateVideo, textToSpeech } from './services/geminiService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [actionHistory, setActionHistory] = useState<ProjectAction[]>([]);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  const [cloudRunServices, setCloudRunServices] = useState<CloudRunService[]>([
    { id: 'fe-svc', name: 'frontend-service', status: 'READY', traffic: 100, location: 'us-central1', lastDeployed: new Date(), type: 'core' },
    { id: 'be-svc', name: 'backend-backend-service', status: 'READY', traffic: 0, location: 'us-central1', lastDeployed: new Date(), type: 'core' },
    { id: 'async-scraper', name: 'async-scraper-service', status: 'READY', traffic: 0, location: 'us-central1', lastDeployed: new Date(), type: 'scraper' },
    { id: 'builder-svc', name: 'builder-service', status: 'READY', traffic: 0, location: 'us-central1', lastDeployed: new Date(), type: 'builder' },
    { id: 'media-svc', name: 'media-generation-service', status: 'READY', traffic: 0, location: 'us-central1', lastDeployed: new Date(), type: 'media' },
    { id: 'trading-svc', name: 'trading-simulation-service', status: 'READY', traffic: 0, location: 'us-central1', lastDeployed: new Date(), type: 'trading' },
  ]);

  const [dockerMirror, setDockerMirror] = useState<DockerContainer[]>([
    { id: 'c1', name: 'infinity-proxy', image: 'nginx:alpine', status: 'running', ports: '80:80' },
    { id: 'c2', name: 'scraper-worker-01', image: 'infinity/scraper:latest', status: 'running', ports: 'None' },
    { id: 'c3', name: 'mcp-tunnel', image: 'cloudflare/cloudflared', status: 'running', ports: 'None' },
  ]);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('glass-coder-v4-settings');
    if (saved) return JSON.parse(saved);
    return {
      theme: 'dark',
      userName: 'LeadEngineer',
      autoLint: true,
      sandboxMode: true,
      advancedSecurity: true,
      aiModel: 'gemini-3-flash-preview',
      temperature: 0.7,
      maxTokens: 2048,
      googleStudioFeatures: true,
      githubSparksEnabled: true,
      connectors: [
        { id: 'github', name: 'GitHub Remote', type: 'github', status: 'connected' },
        { id: 'google', name: 'Google Cloud Run', type: 'google', status: 'connected' },
        { id: 'vscode', name: 'VS Code Tunnel', type: 'service', status: 'connected' },
        { id: 'docker', name: 'Docker Desktop', type: 'service', status: 'connected' },
      ]
    };
  });

  const [metrics, setMetrics] = useState<AdminMetrics>({
    cpuUsage: 14, memoryUsage: 512, apiLatency: 88, activeDeployments: 6, globalTraffic: 2400, serverlessExecutionCount: 14202
  });

  const [files, setFiles] = useState<FileData[]>(() => {
    const saved = localStorage.getItem('glass-code-files');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    return localStorage.getItem('glass-code-active-id');
  });

  const activeFile = files.find(f => f.id === activeFileId) || null;

  useEffect(() => {
    localStorage.setItem('glass-coder-v4-settings', JSON.stringify(settings));
    document.body.className = settings.theme;
  }, [settings]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 20) + 5,
        apiLatency: Math.floor(Math.random() * 50) + 70,
        serverlessExecutionCount: prev.serverlessExecutionCount + Math.floor(Math.random() * 5)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const recordAction = useCallback((
    type: ProjectAction['type'], 
    description: string, 
    filesToSave: FileData[],
    codeSnippet?: string
  ) => {
    const status: ProjectAction['status'] = Math.random() > 0.9 ? 'warning' : 'perfect';
    const action: ProjectAction = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      description,
      type,
      filesSnapshot: JSON.parse(JSON.stringify(filesToSave)),
      status,
      isLocked: true,
      codeSnippet,
      fixSuggestion: status === 'warning' ? "GITHUB LINT: CORRECTING AUTO-GENERATED TYPE DEFINITIONS FOR GOOGLE PROTOBUF COMPLIANCE." : undefined,
      enhancementSuggestion: status === 'perfect' ? "AUTO-RECOMMEND: IMPLEMENTING EDGE-CACHING LOGIC VIA CLOUDFLARE WORKERS TUNNEL." : undefined
    };

    setActionHistory(prev => [action, ...prev]);
    return action.id;
  }, []);

  // Guidelines: Mandatory API Key selection check for paid features like Veo and Gemini 3 Pro Image.
  const ensureApiKeySelection = async () => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 1. Check for specific commands (Image, Video, etc.)
      if (text.toLowerCase().startsWith('/image')) {
        await ensureApiKeySelection();
        const prompt = text.replace('/image', '').trim();
        const imageUrl = await generateImage(prompt);
        if (imageUrl) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Generated image for: ${prompt}`,
            timestamp: new Date(),
            media: { type: 'image', url: imageUrl }
          }]);
        }
      } else if (text.toLowerCase().startsWith('/video')) {
        await ensureApiKeySelection();
        const prompt = text.replace('/video', '').trim();
        const videoUrl = await generateVideo(prompt);
        if (videoUrl) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Generated video for: ${prompt}`,
            timestamp: new Date(),
            media: { type: 'video', url: videoUrl }
          }]);
        }
      } else {
        // 2. Standard Chat with Thinking / Grounding support
        const config: any = {
          temperature: settings.temperature,
          thinking: text.toLowerCase().includes('think') || text.length > 200,
          googleSearch: text.toLowerCase().includes('search') || text.toLowerCase().includes('news')
        };

        const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
        const stream = await sendMessageToGemini(text, history, config);
        
        let assistantContent = '';
        let groundingSources: { title: string; url: string }[] = [];
        const assistantId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

        for await (const chunk of stream) {
          assistantContent += chunk.text || "";
          
          // Guidelines: Extract grounding chunks to display URLs when Google Search is used.
          const metadata = chunk.candidates?.[0]?.groundingMetadata;
          if (metadata?.groundingChunks) {
            metadata.groundingChunks.forEach((c: any) => {
              if (c.web) {
                groundingSources.push({ title: c.web.title, url: c.web.uri });
              }
            });
          }

          setMessages(prev => prev.map(m => m.id === assistantId ? { 
            ...m, 
            content: assistantContent,
            sources: groundingSources.length > 0 ? Array.from(new Set(groundingSources.map(s => JSON.stringify(s)))).map(s => JSON.parse(s)) : undefined
          } : m));
        }

        // 3. Process Code Extractions
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        const extracted: FileData[] = [];
        while ((match = codeBlockRegex.exec(assistantContent)) !== null) {
          extracted.push({ id: Math.random().toString(36).substr(2, 9), name: `update-${Date.now() % 1000}.${match[1] || 'tsx'}`, language: match[1] || 'tsx', content: match[2].trim() });
        }

        if (extracted.length > 0) {
          setFiles(prev => {
            const next = [...prev, ...extracted];
            const actionId = recordAction('code_injection', `AI Sandbox Injection: ${extracted.length} snippets`, next, extracted[0].content);
            setMessages(prevMsg => prevMsg.map(m => m.id === assistantId ? { ...m, actionId } : m));
            return next;
          });
        }
      }
    } catch (e: any) {
      console.error(e);
      // Guidelines: If the request fails with 'Requested entity was not found', prompt for key selection again.
      if (e?.message?.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, settings.temperature, recordAction]);

  const renderViewContent = () => {
    const cardBase = "bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl transition-all hover:border-blue-500/30";
    
    switch (view) {
      case 'admin':
        return (
          <div className="flex-1 flex flex-col p-12 overflow-auto space-y-12 custom-scrollbar">
            <header className="flex justify-between items-end border-b border-white/10 pb-8">
              <div>
                <h2 className="text-5xl font-black tracking-tighter">ADMIN CONTROL PLANE</h2>
                <p className="text-[10px] opacity-40 font-mono-code uppercase tracking-[0.3em] mt-2">Infinity-X-One Flagship Infrastructure</p>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black opacity-30 uppercase">Node: us-central1-a</span>
                   <span className="text-xs font-bold text-green-500">GLOBAL LB: ACTIVE</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`${cardBase} h-32 flex flex-col justify-between`}>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">CPU LOAD</span>
                <span className="text-3xl font-black">{metrics.cpuUsage}%</span>
              </div>
              <div className={`${cardBase} h-32 flex flex-col justify-between`}>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">P99 LATENCY</span>
                <span className="text-3xl font-black">{metrics.apiLatency}ms</span>
              </div>
              <div className={`${cardBase} h-32 flex flex-col justify-between`}>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">TRAFFIC (REQ/S)</span>
                <span className="text-3xl font-black">2.4k</span>
              </div>
              <div className={`${cardBase} h-32 flex flex-col justify-between`}>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">SERVERLESS EXECS</span>
                <span className="text-3xl font-black">{(metrics.serverlessExecutionCount / 1000).toFixed(1)}k</span>
              </div>
            </div>

            <div className={`${cardBase} space-y-8`}>
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black tracking-tighter uppercase">Cloud Run Orchestrator</h3>
                 <button className="text-[10px] font-black uppercase text-blue-500 hover:underline">Provision New Instance</button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {cloudRunServices.map(svc => (
                  <div key={svc.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-black/60 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${svc.status === 'READY' ? 'bg-green-500' : 'bg-yellow-500'} shadow-lg shadow-inherit`}></div>
                      <div>
                        <p className="font-black text-sm uppercase">{svc.name}</p>
                        <p className="text-[9px] opacity-30 font-mono-code">{svc.location} | v1.0.42</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                       <div className="text-right">
                          <p className="text-[9px] font-black opacity-40">TRAFFIC</p>
                          <p className="text-xs font-bold">{svc.traffic}%</p>
                       </div>
                       <button className="p-2 opacity-0 group-hover:opacity-100 bg-white/5 rounded-lg hover:text-blue-500 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className={`${cardBase} space-y-6`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black tracking-tighter">DOCKER DESKTOP MIRROR</h3>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-[9px] font-black rounded">LOCAL SYNC: ON</span>
                  </div>
                  <div className="space-y-2">
                    {dockerMirror.map(container => (
                      <div key={container.id} className="p-4 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600/10 rounded flex items-center justify-center text-blue-500">🐳</div>
                            <div>
                               <p className="text-xs font-bold uppercase">{container.name}</p>
                               <p className="text-[9px] opacity-40 font-mono-code">{container.image} | {container.ports}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            <span className="text-[9px] font-black uppercase opacity-60">{container.status}</span>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className={`${cardBase} space-y-6`}>
                  <h3 className="text-xl font-black tracking-tighter uppercase">Vertex AI Status</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60">Gemini 3 Pro (Thinking)</span>
                        <span className="text-green-500 font-bold uppercase text-xs">Healthy</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60">Imagen 4.0 / Nano Banana</span>
                        <span className="text-green-500 font-bold uppercase text-xs">Healthy</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60">Veo Video Engine</span>
                        <span className="text-green-500 font-bold uppercase text-xs">Healthy</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className={`${cardBase} flex-1 min-h-[500px] flex flex-col`}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black tracking-tighter uppercase">Infrastructure Sandbox</h3>
                 <span className="text-[10px] font-mono-code opacity-40">Command Center Console</span>
               </div>
               <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black">
                 <MonacoEditor activeFile={activeFile} theme={settings.theme} />
               </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 flex flex-col p-12 overflow-auto space-y-12 custom-scrollbar">
            <header className="flex justify-between items-end border-b border-white/10 pb-8">
              <div>
                <h2 className="text-5xl font-black tracking-tighter">STUDIO SETTINGS</h2>
                <p className="text-[10px] opacity-40 font-mono-code uppercase tracking-[0.3em] mt-2">Governance & Account Settings</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className={`${cardBase} space-y-8`}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">AI Model Orchestration</h3>
                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest">Global Default Model</label>
                      <select className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm outline-none font-bold">
                        <option>Gemini 3 Pro (Thinking Active)</option>
                        <option>Gemini 3 Flash (Real-time)</option>
                        <option>Gemini 2.5 Flash Lite (Edge)</option>
                      </select>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                      <span className="text-sm font-bold text-white">Automated Governance Checks</span>
                      <input type="checkbox" checked={settings.autoLint} onChange={e => setSettings({...settings, autoLint: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                      <span className="text-sm font-bold text-white">Standard Sandbox Isolation</span>
                      <input type="checkbox" checked={settings.sandboxMode} onChange={e => setSettings({...settings, sandboxMode: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                   </div>
                </div>
              </section>

              <section className={`${cardBase} space-y-8`}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Developer Identity</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-sm font-black text-white">AI REASONING BUDGET (TEMP)</label>
                      <input type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={e => setSettings({...settings, temperature: parseFloat(e.target.value)})} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                   </div>
                </div>
              </section>
            </div>
          </div>
        );
      default:
        return <MonacoEditor activeFile={activeFile} lastSaved={lastSaved} onContentChange={(c) => activeFile && setFiles(prev => prev.map(f => f.id === activeFile.id ? {...f, content: c} : f))} theme={settings.theme} />;
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 ${settings.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-black text-white'} overflow-hidden font-inter`}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] ${settings.theme === 'light' ? 'bg-blue-200/10' : 'bg-blue-900/10'} blur-[180px] rounded-full`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] ${settings.theme === 'light' ? 'bg-purple-200/10' : 'bg-purple-900/10'} blur-[180px] rounded-full`}></div>
      </div>

      <div className="relative z-10 flex w-full h-full">
        <ChatSidebar 
          messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} files={files} activeFileId={activeFileId} 
          onSelectFile={setActiveFileId} onDeleteFile={(id) => setFiles(prev => prev.filter(f => f.id !== id))} 
          currentView={view} onViewChange={setView} theme={settings.theme} 
          onToggleTheme={() => setSettings(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark'}))} 
          onRollback={(id) => {
            const snap = actionHistory.find(a => a.id === id);
            if (snap) { setFiles(snap.filesSnapshot); recordAction('rollback', `Manual Rollback to Snapshot #${id}`, snap.filesSnapshot); }
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
