
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message, GenerationConfig, ModalityType, UITheme, OperatingMode, SyncState, ProjectState, SimulationData, AgentCapabilities } from './types';
import { geminiService } from './services/geminiService';
import { 
  PlusIcon, MessageSquareIcon, SendIcon, SearchIcon, 
  SettingsIcon, LayoutIcon, CodeIcon, LayersIcon,
  MapPinIcon, MicIcon, BrainIcon, VideoIcon,
  RobotIcon, UserIcon, CPUIcon, GithubIcon, CloudIcon
} from './components/Icons';
import CodeEditor from './components/CodeEditor';
import TemplateLibrary from './components/TemplateLibrary';
import LowCodePanel from './components/LowCodePanel';

const App: React.FC = () => {
  const [uiTheme, setUiTheme] = useState<UITheme>({
    primaryColor: '#007fd4',
    sidebarBg: '#252526',
    mainBg: '#1e1e1e',
    fontFamily: "'Inter', sans-serif",
    borderRadius: '0px',
    logoText: 'VIZUAL-X',
    accentGradient: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(200,200,200,0.3) 50%, rgba(255,255,255,0) 100%)',
    baseFontSize: '15px'
  });

  const [operatingMode, setOperatingMode] = useState<OperatingMode>('hybrid');
  const [agentCaps, setAgentCaps] = useState<Record<OperatingMode, AgentCapabilities>>({
    autonomous: {
      logicSynthesis: true,
      autoRefinement: true,
      memoryInjection: true,
      selfCorrection: true,
      codeGeneration: true,
      visualOptimization: true
    },
    hybrid: {
      logicSynthesis: true,
      autoRefinement: false,
      memoryInjection: true,
      selfCorrection: true,
      codeGeneration: false,
      visualOptimization: true
    },
    manual: {
      logicSynthesis: false,
      autoRefinement: false,
      memoryInjection: false,
      selfCorrection: false,
      codeGeneration: false,
      visualOptimization: false
    }
  });

  const [syncState, setSyncState] = useState<SyncState>({
    github: false,
    googleCloud: false,
    google: true,
    vscode: false,
    mcp: true
  });

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiveEditingEnabled, setIsLiveEditingEnabled] = useState(false);
  const [isLowCodeEnabled, setIsLowCodeEnabled] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  const [config, setConfig] = useState<GenerationConfig>({
    model: 'gemini-3-flash-preview',
    aspectRatio: '16:9',
    imageSize: '1K',
    grounding: undefined,
    useThinking: false,
    isImageEditing: false,
    isVideoUnderstanding: false
  });
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const simulations: SimulationData[] = [
    { id: 'perf', title: 'Latency Simulation', description: 'Simulating neural node response times across global clusters.', metric: '42ms Avg', trend: 'down', color: '#007fd4' },
    { id: 'scale', title: 'User Load Stress', description: 'Testing system elasticity under 1M concurrent connections.', metric: '99.9% Stable', trend: 'up', color: '#00f2ff' },
    { id: 'sec', title: 'Security Perimeter', description: 'Synthesizing adversarial breach attempts in isolated sandbox.', metric: 'Zero Breaches', trend: 'stable', color: '#4d7c0f' },
    { id: 'cost', title: 'Quantum Token Flux', description: 'Projecting operational costs vs efficiency gains.', metric: '-15% Costs', trend: 'down', color: '#fcee0a' }
  ];

  useEffect(() => {
    document.body.style.fontFamily = uiTheme.fontFamily;
    document.documentElement.style.setProperty('--primary-color', uiTheme.primaryColor);
    document.documentElement.style.setProperty('--sidebar-bg', uiTheme.sidebarBg);
    document.documentElement.style.setProperty('--main-bg', uiTheme.mainBg);
  }, [uiTheme]);

  useEffect(() => {
    if (sidebarScrollRef.current) {
      sidebarScrollRef.current.scrollTop = sidebarScrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, isTyping]);

  const handleRestoreTechnology = () => {
    if (!activeSession) return;
    setInputValue("Run system restoration. Recover project vision and re-verify architectural strategy.");
    handleSendMessage();
    setIsSimulationActive(true);
  };

  const toggleSync = (key: keyof SyncState) => {
    setSyncState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCapability = (mode: OperatingMode, cap: keyof AgentCapabilities) => {
    setAgentCaps(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [cap]: !prev[mode][cap]
      }
    }));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() && !selectedFile) {
      setInputError("Neural command stream is null.");
      setTimeout(() => setInputError(null), 3000);
      return;
    }
    if (isTyping) return;
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: inputValue.slice(0, 25) || 'Neural Initializer',
        messages: [],
        updatedAt: new Date(),
        projectData: {
          vision: "Architectural Clarity: A high-performance, design-first engine for autonomous synthesis.",
          strategy: "Core Strategy: Multi-model orchestration with real-time feedback loops.",
          frontendDocs: "# Frontend Architecture\nUsing React 19 and Tailwind 4 with Monaco bindings.",
          backendDocs: "# Backend Architecture\nDistributed edge nodes with Gemini 2.5/3 Pro integration.",
          todoList: ["Define UI Tokens", "Sync MCP Layer", "Generate Simulations"],
          phases: [
            { name: 'Discovery', status: 'complete' },
            { name: 'Architectural Strategy', status: 'active' },
            { name: 'Implementation', status: 'pending' }
          ]
        }
      };
      setSessions([newSession, ...sessions]);
      currentSessionId = newSession.id;
      setActiveSessionId(currentSessionId);
    }
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      mediaUrl: selectedFile || undefined,
      mediaType: selectedFileType || undefined,
      timestamp: new Date()
    };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    setInputValue('');
    setSelectedFile(null);
    setSelectedFileType(null);
    setIsTyping(true);
    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
    
    try {
      let fullContent = "";
      await geminiService.streamChat([...(activeSession?.messages || []), userMsg], config, uiTheme, (chunk, links) => {
        fullContent += chunk;
        if (fullContent.includes('UI_THEME_UPDATE:')) {
            try {
              const jsonMatch = fullContent.match(/UI_THEME_UPDATE: ({.*})/);
              if (jsonMatch) {
                const themeData = JSON.parse(jsonMatch[1]);
                setUiTheme(prev => ({ ...prev, ...themeData }));
              }
            } catch (e) { }
          }
        updateAssistantMsg(currentSessionId!, assistantMsgId, fullContent, 'text', undefined, links);
      });
    } catch (err) {
      updateAssistantMsg(currentSessionId!, assistantMsgId, "Kernel Panic: " + (err as Error).message);
    } finally {
      setIsTyping(false);
    }
  };

  const updateAssistantMsg = (sid: string, mid: string, content: string, type: ModalityType = 'text', mediaUrl?: string, groundingLinks?: any[]) => {
    setSessions(prev => prev.map(s => s.id === sid ? {
      ...s,
      messages: s.messages.map(m => m.id === mid ? { ...m, content, type, mediaUrl, groundingLinks } : m)
    } : s));
  };

  const renderChatInput = (isMobile: boolean) => (
    <form onSubmit={handleSendMessage} className={`relative group ${isMobile ? 'px-2 pb-2' : ''}`}>
      <div className={`overflow-hidden silver-gradient-border transition-all duration-300 ${isMobile ? 'rounded-2xl border border-white/10' : 'rounded-lg'}`}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder="Neural command pulse..."
          rows={isMobile ? 1 : 2}
          className={`w-full bg-black/40 border-none outline-none p-3 pb-10 text-[14px] placeholder:opacity-20 resize-none transition-all shadow-inner font-medium scrollbar-none`}
        />
        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
          <div className="flex space-x-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-white/5 rounded transition-all text-white/30 hover:text-blue-500">
              <LayersIcon size={14} />
            </button>
          </div>
          <button type="submit" disabled={isTyping} className="p-1.5 text-white/40 hover:text-blue-500 transition-all hover:scale-110 active:scale-95 disabled:opacity-10">
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-blue-500/20" style={{ backgroundColor: uiTheme.mainBg, color: '#cccccc' }}>
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#252526] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h3 className="text-[14px] font-semibold text-white flex items-center">
                <SettingsIcon className="mr-3 text-blue-500" /> System Integration Hub
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-white/40 hover:text-blue-500 text-2xl transition-all hover:rotate-90">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-16 no-scrollbar">
              {/* Agent Autonomy Controls */}
              <section className="space-y-8">
                <h4 className="text-[12px] font-bold text-blue-400 border-b border-white/5 pb-3 flex items-center">
                  <RobotIcon className="mr-2" size={14} /> Agent Autonomy Matrix
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {(['autonomous', 'hybrid', 'manual'] as OperatingMode[]).map(mode => (
                    <div 
                      key={mode}
                      className={`p-6 rounded-xl border transition-all flex flex-col space-y-6 ${operatingMode === mode ? 'bg-blue-600/10 border-blue-500/50' : 'bg-black/20 border-white/5'}`}
                    >
                      <button 
                        onClick={() => setOperatingMode(mode)}
                        className={`text-xs font-bold py-3 rounded-lg text-center transition-all ${operatingMode === mode ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                      >
                        {mode === 'autonomous' ? 'Full Autonomous' : mode === 'hybrid' ? 'Hybrid Mode' : 'Manual Mode'}
                      </button>
                      
                      <div className="space-y-4">
                        {Object.entries(agentCaps[mode]).map(([capKey, enabled]) => (
                          <div 
                            key={capKey} 
                            onClick={() => toggleCapability(mode, capKey as keyof AgentCapabilities)}
                            className="flex items-center justify-between group cursor-pointer"
                          >
                            <span className={`text-[11px] font-medium transition-all ${enabled ? 'text-white/80' : 'text-white/20'}`}>
                              {capKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <div className={`w-7 h-4 rounded-full flex items-center px-1 transition-all ${enabled ? 'bg-blue-600' : 'bg-white/10'}`}>
                              <div className={`w-2 h-2 rounded-full bg-white transition-all ${enabled ? 'ml-auto' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-8">
                <h4 className="text-[12px] font-bold text-blue-400 border-b border-white/5 pb-3 flex items-center">
                  <LayersIcon className="mr-2" size={14} /> Workflow Engines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setIsLowCodeEnabled(!isLowCodeEnabled)}
                    className={`p-6 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isLowCodeEnabled ? 'bg-blue-600/10 border-blue-500/50 shadow-inner' : 'bg-black/20 border-white/5 hover:border-blue-500/30'}`}
                  >
                    <div className="flex items-center">
                      <div className={`mr-5 ${isLowCodeEnabled ? 'text-blue-400' : 'opacity-70'}`}><LayoutIcon size={20} /></div>
                      <div>
                        <p className={`text-sm font-semibold ${isLowCodeEnabled ? 'text-white' : 'text-white/40'}`}>Low Code Visual Engine</p>
                        <p className="text-[11px] opacity-40 mt-1">Direct visual parameter overrides.</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full transition-all ${isLowCodeEnabled ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-white/5'}`} />
                  </div>

                  <div 
                    onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                    className={`p-6 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isTemplatesOpen ? 'bg-blue-600/10 border-blue-500/50 shadow-inner' : 'bg-black/20 border-white/5 hover:border-blue-500/30'}`}
                  >
                    <div className="flex items-center">
                      <div className={`mr-5 ${isTemplatesOpen ? 'text-blue-400' : 'opacity-70'}`}><LayersIcon size={20} /></div>
                      <div>
                        <p className={`text-sm font-semibold ${isTemplatesOpen ? 'text-white' : 'text-white/40'}`}>Template Foundry</p>
                        <p className="text-[11px] opacity-40 mt-1">Pre-built manifest architectures.</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full transition-all ${isTemplatesOpen ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-white/5'}`} />
                  </div>
                </div>
              </section>

              {isTemplatesOpen && (
                <section className="space-y-8 animate-in slide-in-from-top-4">
                  <h4 className="text-[12px] font-bold text-blue-400 border-b border-white/5 pb-3 flex items-center">
                    <LayersIcon className="mr-2" size={14} /> Template Library
                  </h4>
                  <TemplateLibrary onSelect={(t) => { setUiTheme(t); setIsTemplatesOpen(false); setIsSettingsOpen(false); }} />
                </section>
              )}

              <section className="space-y-8">
                <h4 className="text-[12px] font-bold text-blue-400 border-b border-white/5 pb-3 flex items-center">
                  <CloudIcon className="mr-2" size={14} /> Cloud Sync
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { id: 'github', name: 'GitHub Manifest', icon: <GithubIcon size={18}/> },
                    { id: 'googleCloud', name: 'Cloud Deploy', icon: <CloudIcon size={18}/> }
                  ].map(sync => (
                    <div key={sync.id} className={`p-6 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${syncState[sync.id as keyof SyncState] ? 'bg-blue-600/10 border-blue-500/50 shadow-inner' : 'bg-black/20 border-white/5 hover:border-blue-500/30'}`} onClick={() => toggleSync(sync.id as keyof SyncState)}>
                      <div className="flex items-center">
                        <div className={`mr-5 ${syncState[sync.id as keyof SyncState] ? 'text-blue-400' : 'opacity-70'}`}>{sync.icon}</div>
                        <p className={`text-sm font-semibold ${syncState[sync.id as keyof SyncState] ? 'text-white' : 'text-white/40'}`}>{sync.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              <section className="pt-10 border-t border-white/5">
                <LowCodePanel theme={uiTheme} onChange={setUiTheme} />
              </section>
            </div>
            
            <div className="p-8 bg-black/40 border-t border-white/10 flex justify-center">
              <button onClick={() => setIsSettingsOpen(false)} className="px-16 py-4 bg-blue-600 text-white text-[12px] font-bold uppercase tracking-[0.2em] rounded-lg transition-all hover:bg-blue-500 hover:shadow-2xl active:scale-95">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Toolbar */}
      <header className="h-12 flex items-center justify-between px-4 silver-gradient-border z-50 shrink-0 shadow-lg" style={{ backgroundColor: uiTheme.sidebarBg }}>
        <div className="flex items-center h-full">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-3 p-1.5 hover:bg-white/5 rounded sm:hidden text-white/60"
          >
            <LayoutIcon size={20} />
          </button>
          <div className="flex items-center group cursor-pointer h-full">
            <div className="mr-3 transition-transform duration-500 group-hover:rotate-12 text-white">
              <VLogoIcon size={24} />
            </div>
            <span className="font-black tracking-[0.4em] uppercase text-white transition-all text-sm lg:text-lg group-hover:text-blue-500" style={{ fontFamily: uiTheme.fontFamily }}>{uiTheme.logoText}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={handleRestoreTechnology}
            className="px-2 sm:px-4 py-1.5 border border-blue-500/30 bg-blue-600/10 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_15px_rgba(0,127,212,0.1)] active:scale-95"
          >
            <span className="hidden xs:inline">Restore Tech</span>
            <span className="xs:hidden"><SyncIcon size={12} /></span>
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="sm:hidden p-1.5 text-white/40 hover:text-blue-500 transition-all">
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Reserved for Chat Only */}
        <aside 
          className={`fixed inset-y-0 left-0 z-[50] w-72 sm:relative sm:z-auto sm:flex sm:flex-col silver-gradient-border-v shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0 sm:w-80 lg:w-96'}`}
          style={{ backgroundColor: uiTheme.sidebarBg, borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/10">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Neural Core Chat</span>
            <button 
              onClick={() => { setSessions([]); setActiveSessionId(null); setIsSidebarOpen(false); }} 
              className="p-1.5 hover:bg-white/10 rounded transition-all text-white/40 hover:text-blue-500"
              title="New Chat Session"
            >
              <PlusIcon size={14} />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin" style={{ backgroundColor: uiTheme.mainBg }}>
              {!activeSession ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-6 p-4 mt-20">
                   <VLogoIcon size={60} />
                   <p className="text-[10px] lg:text-[12px] font-black uppercase tracking-[0.5em] leading-relaxed">System Idle. Awaiting Neural Pulse.</p>
                </div>
              ) : (
                activeSession.messages.map((msg) => (
                  <div key={msg.id} className="flex group animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className={`w-7 h-7 rounded shrink-0 flex items-center justify-center mr-3 text-[10px] font-black transition-transform group-hover:scale-110 shadow-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
                      {msg.role === 'user' ? 'U' : 'X'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black opacity-30 mb-1.5 flex justify-between items-center tracking-widest uppercase">
                        <span>{msg.role === 'user' ? 'OPERATOR' : 'VIZUAL-X'}</span>
                      </div>
                      <div className="leading-relaxed break-words whitespace-pre-wrap opacity-90 text-[13px]">{msg.content}</div>
                      {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.groundingLinks.map((link, idx) => (
                            <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-400 hover:underline">
                              [{link.title}]
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isTyping && <div className="text-[11px] opacity-30 animate-pulse tracking-[0.2em] font-black ml-10 italic uppercase text-blue-400">SYNCING...</div>}
            </div>

            {/* Desktop Side Input area (Fixed in Sidebar) */}
            <div className="hidden sm:block p-4 border-t border-white/10 silver-gradient-border bg-black/20" style={{ backgroundColor: uiTheme.sidebarBg }}>
              {renderChatInput(false)}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-500" style={{ backgroundColor: uiTheme.mainBg }}>
          {/* Simulation View */}
          {isSimulationActive && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-xl animate-in zoom-in-95 duration-500 overflow-y-auto">
              <div className="w-full max-w-6xl py-12">
                <div className="flex justify-between items-center mb-12">
                   <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.5em] text-white flex items-center">
                      <CPUIcon className="mr-4 text-blue-500 animate-spin-slow" /> Node Syms
                   </h2>
                   <button onClick={() => setIsSimulationActive(false)} className="px-6 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all">Terminate</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {simulations.map((sim, i) => (
                    <div 
                      key={sim.id} 
                      className="group p-8 bg-[#252526] border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all duration-500 hover:-translate-y-4 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <VLogoIcon size={80} />
                      </div>
                      <div className="w-12 h-12 rounded-full mb-8 flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-blue-500/50 transition-all">
                         <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: sim.color }} />
                      </div>
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 text-white/60 group-hover:text-white transition-colors">{sim.title}</h4>
                      <p className="text-[13px] leading-relaxed opacity-40 group-hover:opacity-80 transition-opacity mb-8">{sim.description}</p>
                      <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                        <div>
                           <p className="text-[10px] opacity-30 font-black uppercase tracking-widest mb-1">State Variable</p>
                           <p className="text-xl font-mono font-black tracking-tighter" style={{ color: sim.color }}>{sim.metric}</p>
                        </div>
                        <div className={`text-[10px] font-black uppercase ${sim.trend === 'up' ? 'text-green-500' : sim.trend === 'down' ? 'text-red-500' : 'text-blue-500'}`}>
                           {sim.trend === 'up' ? '▲ Trend' : sim.trend === 'down' ? '▼ Trend' : '— Flux'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className="h-9 flex items-center border-b border-white/5 silver-gradient-border shadow-md" style={{ backgroundColor: uiTheme.sidebarBg }}>
            <div className="hidden sm:flex items-center bg-black/30 px-6 h-full border-r border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 shrink-0">
               <span className="mr-3 opacity-30 tracking-tighter">ID</span> PROJECT_CANVAS_V1
            </div>
            <div className="flex-1"></div>
            <div className="px-4 text-[10px] font-bold text-white/40 tracking-wider">
              SYSTEM MODE: <span className="text-blue-500 font-black ml-1 uppercase">
                {operatingMode === 'autonomous' ? 'Full Autonomous' : operatingMode === 'hybrid' ? 'Hybrid' : 'Manual'}
              </span>
            </div>
          </div>

          <div className="flex-1 relative flex overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center transition-all duration-1000 overflow-hidden text-white">
                <VLogoIcon size={Math.min(window.innerWidth, window.innerHeight, 600)} />
            </div>

            <div className="flex-1 relative flex flex-col overflow-hidden z-10 pb-20 sm:pb-0">
              {isLiveEditingEnabled ? (
                <CodeEditor theme={uiTheme} onThemeChange={setUiTheme} />
              ) : isLowCodeEnabled ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
                   <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                     <div className="max-w-md w-full bg-[#252526] border border-white/5 rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="bg-black/20 p-4 border-b border-white/10">
                          <h4 className="text-[11px] font-semibold text-white/60">Visual Matrix Override</h4>
                        </div>
                        <LowCodePanel theme={uiTheme} onChange={setUiTheme} />
                     </div>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center relative p-8">
                  <div className="text-center max-w-3xl w-full">
                      <div className="inline-block p-10 sm:p-16 rounded-[40px] sm:rounded-[60px] bg-white/[0.01] border border-white/[0.03] backdrop-blur-3xl mb-8 sm:mb-12 shadow-3xl transition-all duration-700 hover:scale-105 group text-white">
                          <VLogoIcon size={80} className="sm:w-[160px] sm:h-[160px]" />
                      </div>
                      <h2 className="text-2xl sm:text-6xl font-black tracking-[0.5em] uppercase opacity-20 mb-6 animate-pulse-slow">{uiTheme.logoText}</h2>
                      <div className="flex flex-wrap justify-center gap-4 animate-in fade-in duration-1000 delay-500">
                        {['Vision', 'Strategy', 'Backend', 'Frontend', 'Simulation'].map((tag) => (
                          <span key={tag} className="px-4 py-1.5 border border-white/5 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:border-blue-500/30 hover:text-blue-400 transition-all cursor-default">
                             {tag}
                          </span>
                        ))}
                      </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Specific Bottom Area */}
          <div className="sm:hidden absolute bottom-0 left-0 right-0 z-50 silver-gradient-border-top px-3 pb-3 pt-4 backdrop-blur-md bg-black/40">
            {renderChatInput(true)}
            <div className="flex items-center justify-between mt-3 px-2">
              <button 
                onClick={() => { setIsSimulationActive(!isSimulationActive); setIsLiveEditingEnabled(false); setIsLowCodeEnabled(false); }}
                className={`flex flex-col items-center space-y-1 transition-all ${isSimulationActive ? 'text-blue-500' : 'text-white/40'}`}
              >
                <CPUIcon size={18} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Syms</span>
              </button>
              <button 
                onClick={() => setConfig(prev => ({...prev, grounding: prev.grounding === 'search' ? undefined : 'search'}))}
                className={`flex flex-col items-center space-y-1 transition-all ${config.grounding === 'search' ? 'text-blue-500' : 'text-white/40'}`}
              >
                <SearchIcon size={18} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Search</span>
              </button>
              <button 
                onClick={() => setConfig(p => ({...p, useThinking: !p.useThinking}))}
                className={`flex flex-col items-center space-y-1 transition-all ${config.useThinking ? 'text-blue-500' : 'text-white/40'}`}
              >
                <BrainIcon size={18} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Think</span>
              </button>
              <button 
                onClick={() => { setIsLiveEditingEnabled(!isLiveEditingEnabled); setIsLowCodeEnabled(false); setIsSimulationActive(false); }}
                className={`flex flex-col items-center space-y-1 transition-all ${isLiveEditingEnabled ? 'text-blue-500' : 'text-white/40'}`}
              >
                <CodeIcon size={18} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Code</span>
              </button>
              <button 
                onClick={() => { setIsLowCodeEnabled(!isLowCodeEnabled); setIsLiveEditingEnabled(false); setIsSimulationActive(false); }}
                className={`flex flex-col items-center space-y-1 transition-all ${isLowCodeEnabled ? 'text-blue-500' : 'text-white/40'}`}
              >
                <LayoutIcon size={18} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Visual</span>
              </button>
            </div>
          </div>
        </main>

        {/* Desktop Side Toolrail - Matched to Header Thickness Style */}
        <aside className="hidden sm:flex w-12 flex-col items-center py-6 space-y-6 border-l border-white/5 shrink-0 shadow-2xl z-40" style={{ backgroundColor: uiTheme.sidebarBg }}>
          <div 
            title="Chat Hub"
            className={`${!isLiveEditingEnabled && !isLowCodeEnabled && !isSimulationActive ? 'text-blue-500 border-r-4 border-blue-500 bg-blue-500/10 scale-105' : 'opacity-40 hover:text-blue-500'} w-full flex justify-center py-3 cursor-pointer transition-all`} 
            onClick={() => { setIsLiveEditingEnabled(false); setIsLowCodeEnabled(false); setIsSimulationActive(false); }}
          >
            <MessageSquareIcon size={20} />
          </div>

          <div 
            title="Toggle Simulation"
            className={`${isSimulationActive ? 'text-blue-500 border-r-4 border-blue-500 bg-blue-500/10 scale-105' : 'opacity-40 hover:text-blue-500'} w-full flex justify-center py-3 cursor-pointer transition-all`} 
            onClick={() => { setIsSimulationActive(!isSimulationActive); setIsLiveEditingEnabled(false); setIsLowCodeEnabled(false); }}
          >
            <CPUIcon size={20} />
          </div>

          <div 
            title="Matrix Code Engine"
            className={`${isLiveEditingEnabled ? 'text-blue-500 border-r-4 border-blue-500 bg-blue-500/10 scale-105' : 'opacity-40 hover:text-blue-500'} w-full flex justify-center py-3 cursor-pointer transition-all`} 
            onClick={() => { setIsLiveEditingEnabled(true); setIsLowCodeEnabled(false); setIsSimulationActive(false); }}
          >
            <CodeIcon size={20} />
          </div>

          <div className="flex-1"></div>
          
          <button 
            title="System Settings"
            onClick={() => setIsSettingsOpen(true)} 
            className={`${isSettingsOpen ? 'text-blue-500 rotate-90 scale-110' : 'opacity-40 hover:text-blue-500'} transition-all cursor-pointer p-2 mb-4 rounded-full`}
          >
            <SettingsIcon size={20} />
          </button>
        </aside>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
              setSelectedFile(re.target?.result as string);
              setSelectedFileType(file.type);
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
};

const VLogoIcon = ({ size = 16, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M10 20L50 85L90 20" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M35 20L50 45L65 20" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    </svg>
)

const SyncIcon = ({ size = 16, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
)

export default App;
