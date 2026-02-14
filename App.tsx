
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { MonacoEditor } from './components/MonacoEditor';
import { 
  Message, FileData, AppView, Theme, 
  AppSettings, Connector, ProjectAction, AIRecommendation, AdminMetrics 
} from './types';
import { sendMessageToGemini } from './services/geminiService';
import { GenerateContentResponse } from '@google/genai';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [actionHistory, setActionHistory] = useState<ProjectAction[]>([]);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

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
        { id: 'chatgpt', name: 'OpenAI / GPT-4o', type: 'service', status: 'connected' }
      ]
    };
  });

  const [metrics, setMetrics] = useState<AdminMetrics>({
    cpuUsage: 12, memoryUsage: 450, apiLatency: 120, activeDeployments: 140
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

  const recordAction = useCallback((
    type: ProjectAction['type'], 
    description: string, 
    filesToSave: FileData[],
    codeSnippet?: string
  ) => {
    const status: ProjectAction['status'] = Math.random() > 0.85 ? 'warning' : 'perfect';
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
    
    if (status === 'perfect') {
      setRecommendation({ id: 'r1', text: "SYSTEM HEALTH: 100% OPERATIONAL. ALL GOVERNANCE POLICIES PASSED.", priority: 'low' });
    } else {
      setRecommendation({ id: 'r2', text: "URGENT: DETECTED SUB-OPTIMAL LINTING ON LINE 42. AUTO-REPAIR ACTIVE.", priority: 'high' });
    }

    return action.id;
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    const targetedActionIdMatch = text.match(/#([a-zA-Z0-9]{9})/);
    if (targetedActionIdMatch) {
      const targetId = targetedActionIdMatch[1];
      const action = actionHistory.find(a => a.id === targetId);
      if (action && action.isLocked) {
        if (!confirm(`LOCK WARNING: Are you sure you want to change the locked implementation #${targetId}? Results will affect system stability and TAP protocol compliance.`)) {
          return;
        }
      }
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
      const stream = await sendMessageToGemini(text, history);
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

      for await (const chunk of stream) {
        assistantContent += chunk.text || "";
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
      }

      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let match;
      const extracted: FileData[] = [];
      while ((match = codeBlockRegex.exec(assistantContent)) !== null) {
        extracted.push({ id: Math.random().toString(36).substr(2, 9), name: `update-${Date.now() % 1000}.tsx`, language: match[1] || 'tsx', content: match[2].trim() });
      }

      if (extracted.length > 0) {
        setFiles(prev => {
          const next = [...prev, ...extracted];
          const actionId = recordAction('code_injection', `AI Sandbox Injection: ${extracted.length} snippets`, next, extracted[0].content);
          setMessages(prevMsg => prevMsg.map(m => m.id === assistantId ? { ...m, actionId } : m));
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [messages, actionHistory, recordAction]);

  const renderViewContent = () => {
    const cardBase = "bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl";
    
    switch (view) {
      case 'admin':
        return (
          <div className="flex-1 flex flex-col p-12 overflow-auto space-y-12 custom-scrollbar">
            <header className="flex justify-between items-end border-b border-white/10 pb-8">
              <div>
                <h2 className="text-5xl font-black tracking-tighter">ADMIN CONTROL PLANE</h2>
                <p className="text-[10px] opacity-40 font-mono-code uppercase tracking-[0.3em] mt-2">Monaco E2E Infrastructure | Governance: active</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-600/30">GOOGLE CLOUD: ONLINE</button>
                <button className="px-6 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-black border border-white/10">GITHUB: SYNCED</button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className={`${cardBase} flex flex-col justify-between h-36 group hover:border-blue-500/50 transition-all`}>
                <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">CPU UTILIZATION</span>
                <span className="text-4xl font-black">{metrics.cpuUsage}%</span>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500" style={{width: `${metrics.cpuUsage}%`}}></div>
                </div>
              </div>
              <div className={`${cardBase} flex flex-col justify-between h-36 group hover:border-green-500/50 transition-all`}>
                <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">MEMORY WORKLOAD</span>
                <span className="text-4xl font-black">{metrics.memoryUsage}MB</span>
              </div>
              <div className={`${cardBase} flex flex-col justify-between h-36 group hover:border-yellow-500/50 transition-all`}>
                <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">API LATENCY (P99)</span>
                <span className="text-4xl font-black">{metrics.apiLatency}MS</span>
              </div>
              <div className={`${cardBase} flex flex-col justify-between h-36 group hover:border-purple-500/50 transition-all`}>
                <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">REPOS / SUB-SYSTEMS</span>
                <span className="text-4xl font-black">{metrics.activeDeployments}</span>
              </div>
            </div>

            <div className={`${cardBase} space-y-8`}>
              <h3 className="text-2xl font-black tracking-tighter">AUTHENTICATION & EXTERNAL SYSTEMS</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Sign in buttons requested */}
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">📁</div>
                       <div>
                          <p className="font-black text-sm uppercase">GITHUB INFINITY ORCHESTRATOR</p>
                          <p className="text-[10px] opacity-40">Runner Status: Optimized (140 Active Repos)</p>
                       </div>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">AUTH: SIGN OUT</button>
                 </div>
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-green-500/30">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">🌐</div>
                       <div>
                          <p className="font-black text-sm uppercase">GOOGLE CLOUD RUN PLATFORM</p>
                          <p className="text-[10px] opacity-40">Identity Provider: Vertex AI v3.0</p>
                       </div>
                    </div>
                    <button className="px-6 py-2 bg-zinc-800 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">AUTH: SIGN IN</button>
                 </div>
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-orange-500/30">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">🐳</div>
                       <div>
                          <p className="font-black text-sm uppercase">DOCKER DESKTOP / MCP TUNNEL</p>
                          <p className="text-[10px] opacity-40">Environment Mirror: Synchronized</p>
                       </div>
                    </div>
                    <button className="px-6 py-2 bg-zinc-800 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">CONNECT</button>
                 </div>
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-400/30">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">💻</div>
                       <div>
                          <p className="font-black text-sm uppercase">VS CODE / CLOUDFLARE GATEWAY</p>
                          <p className="text-[10px] opacity-40">Local Dev Connection: Latency 12ms</p>
                       </div>
                    </div>
                    <button className="px-6 py-2 bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest">ACTIVE</button>
                 </div>
              </div>
            </div>

            <div className={`${cardBase} flex-1 min-h-[500px] flex flex-col`}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black tracking-tighter uppercase">Monaco E2E Integrated Editor</h3>
                 <span className="text-[10px] font-mono-code opacity-40">Governance: Standard-Only Acceptance</span>
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
                <p className="text-[10px] opacity-40 font-mono-code uppercase tracking-[0.3em] mt-2">Personalization & Guardrail Benchmarks</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className={`${cardBase} space-y-8`}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">AI Model & Governance</h3>
                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest">Primary Logic Model</label>
                      <select className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm outline-none font-bold">
                        <option>Gemini 3 Pro (Benchmark Standard)</option>
                        <option>Gemini 2.5 Flash (Optimized Latency)</option>
                        <option>GitHub Sparks Engine v2</option>
                      </select>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                      <span className="text-sm font-bold">Auto-Linting (GitHub Protocol)</span>
                      <input type="checkbox" checked={settings.autoLint} onChange={e => setSettings({...settings, autoLint: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                      <span className="text-sm font-bold">Sandbox Enforcement (Google TAP)</span>
                      <input type="checkbox" checked={settings.sandboxMode} onChange={e => setSettings({...settings, sandboxMode: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                      <span className="text-sm font-bold">Advanced Guardrails (E2E)</span>
                      <input type="checkbox" checked={settings.advancedSecurity} onChange={e => setSettings({...settings, advancedSecurity: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                   </div>
                </div>
              </section>

              <section className={`${cardBase} space-y-8`}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">GitHub Sparks & IDE Logic</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-black">AI CREATIVITY (TEMP)</label>
                        <span className="text-xs font-mono-code">{settings.temperature}</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={e => setSettings({...settings, temperature: parseFloat(e.target.value)})} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-sm font-black">MAX RESPONSE TOKENS</label>
                      <input type="number" value={settings.maxTokens} onChange={e => setSettings({...settings, maxTokens: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm outline-none font-mono-code" />
                   </div>
                </div>
                
                <div className="pt-8 border-t border-white/10">
                   <h4 className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">Connected Developer Profiles</h4>
                   <div className="flex flex-wrap gap-2">
                      {settings.connectors.map(c => (
                        <div key={c.id} className="px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {c.name}: <span className="text-green-500">{c.status}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </section>
            </div>
            
            <div className={`${cardBase} text-center space-y-4`}>
               <h3 className="text-xl font-black">WORKSPACE DATA MANAGEMENT</h3>
               <p className="text-sm opacity-40">Standard Studio AI operating procedures. All changes immediately reflect in Monaco sandbox.</p>
               <button onClick={() => {if(confirm("Factory Reset: Wipe local environment?")) { localStorage.clear(); window.location.reload(); }}} className="px-10 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Destroy Local Session</button>
            </div>
          </div>
        );
      default:
        return <MonacoEditor activeFile={activeFile} lastSaved={lastSaved} onContentChange={(c) => activeFile && setFiles(prev => prev.map(f => f.id === activeFile.id ? {...f, content: c} : f))} theme={settings.theme} />;
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 ${settings.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-black text-white'} overflow-hidden`}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] ${settings.theme === 'light' ? 'bg-blue-200/20' : 'bg-blue-900/10'} blur-[150px] rounded-full`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] ${settings.theme === 'light' ? 'bg-purple-200/20' : 'bg-purple-900/10'} blur-[150px] rounded-full`}></div>
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

        <div className="flex-1 flex flex-col overflow-hidden">
          {renderViewContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
