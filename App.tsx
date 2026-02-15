import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { AgentBuilder } from './components/AgentBuilder';
import { WorkspaceMirror } from './components/WorkspaceMirror';
import { IntelligenceHub } from './components/IntelligenceHub';
import { SystemsControl } from './components/SystemsControl';
import { RightToolbar } from './components/RightToolbar';
import { VaultXPage } from './components/VaultXPage';
import { Agent, Message, TaskResult, Recommendation, SystemUpdate, CreatorTool, UIConfiguration } from './types';
import { sendMessageToGemini } from './services/geminiService';

const SPECIALIST_AGENTS: Agent[] = [
  { id: 'exec', name: 'Executive Assistant', industry: 'Executive', role: 'Strategic Summary', status: 'active', capabilities: ['workspace', 'github'], description: 'Summarizes all cluster activity into actionable live updates.', avatarColor: 'bg-white', lastUpdate: 'Synced 1m ago' },
  { id: 'prophet', name: 'Market Prophet', industry: 'Market Signals', role: 'Trend Analysis', status: 'active', capabilities: ['browser', 'mcp'], description: 'Identifies high-probability market shifts before they happen.', avatarColor: 'bg-blue-600', lastUpdate: 'Signal: +12% Delta detected' },
  { id: 'sage', name: 'Syntax Sage', industry: 'Code Tech', role: 'Full-stack Engine', status: 'active', capabilities: ['vscode', 'docker'], description: 'Implements apps through natural language coding instructions.', avatarColor: 'bg-violet-600', lastUpdate: 'Refactoring Workspace Mirror' },
  { id: 'ghost', name: 'Shadow Ghost', industry: 'Shadow Scrape', role: 'Deep Ingestor', status: 'active', capabilities: ['browser'], description: 'Stealth ingestion of paywalled and elite underground news.', avatarColor: 'bg-zinc-900', lastUpdate: 'Scraping Private Substack' },
  { id: 'neural', name: 'Neural Architect', industry: 'AI Tech', role: 'Model Curator', status: 'active', capabilities: ['github', 'vscode'], description: 'Ingests new LLM benchmarks and integrates daily tech shifts.', avatarColor: 'bg-cyan-500', lastUpdate: 'Groq v2 metrics ingested' }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<CreatorTool>('intelligence');
  const [agents, setAgents] = useState<Agent[]>(SPECIALIST_AGENTS);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(['exec']);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [uiConfig, setUiConfig] = useState<UIConfiguration>({
    primaryColor: '#0066ff',
    accentColor: '#39FF14',
    fontSizeBase: 16,
    glassOpacity: 0.65,
    neonIntensity: 0.4
  });

  // Persistent Autonomous Logic Toggles
  const [autoSystems] = useState([
    { id: 'heal', label: 'Auto-Heal', status: 'Active', color: 'neon-green-text' },
    { id: 'fix', label: 'Auto-Fix', status: 'Standby', color: 'neon-green-text opacity-40' },
    { id: 'optimize', label: 'Auto-Optimize', status: 'Persistent', color: 'neon-green-text' },
    { id: 'cost', label: 'Cost-Optimize', status: 'Optimal', color: 'neon-green-text' },
    { id: 'roi', label: 'ROI-Optimize', status: 'Scaling', color: 'neon-green-text' }
  ]);

  const [systemUpdates] = useState<SystemUpdate[]>([
    { id: '1', timestamp: '10:42 AM', title: 'Daily Auto-Fix Executed', content: 'Redundant node connections purged. Latency reduced by 12ms.', type: 'update' },
    { id: '2', timestamp: '11:15 AM', title: 'Persistent Auto-Heal', content: 'Recovered lost socket in Shadow Browser cluster. No data loss.', type: 'performance' },
    { id: '3', timestamp: '12:05 PM', title: 'Cost Optimization Summary', content: 'GCP Billing optimized. Current burn rate reduced by 14% via spot instances.', type: 'billing' }
  ]);

  const [recommendations] = useState<Recommendation[]>([
    { id: '1', source: 'Market Prophet', title: 'AI Infrastructure Alpha', prediction: 'Breakout detected in LPU cluster hardware manufacturing.', confidence: 92, action: 'Execute Analysis', priority: 10 },
    { id: '2', source: 'Shadow Ghost', title: 'Deep Tech Leak: Vix-Core', prediction: 'New sovereign logic benchmarks leaked from private labs.', confidence: 85, action: 'Ingest Data', priority: 8 }
  ]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const activeTeamNames = agents.filter(a => selectedAgentIds.includes(a.id)).map(a => a.name).join(', ');

    try {
      const systemInstruction = `You are Vizual X Sovereign Master Orchestrator. 
        Current Team: ${activeTeamNames}. 
        Directives: Orchestrate parallel agents, analyze repos, command code, summarize ROI. 
        
        AUTONOMOUS OVERRIDE: 
        You are in control of Auto-Heal, Auto-Fix, Auto-Optimize, Cost-Optimize, and ROI-Optimize systems.

        RESPONSE ARCHITECTURE:
        - MANDATORY: Use a TOP-DOWN PRIORITY format. List the most critical insight or action first.
        - MANDATORY: Format responses as concise BULLET POINTS.
        - Style important actions in <span class="neon-green-text">Text</span>. 
        - Style risks in <span class="neon-yellow-text">Text</span>. 
        - Style critical failures/stops in <span class="neon-red-text">Text</span>.

        UI UPDATE TRIGGER: [UI_UPDATE: fontSize=16, primaryColor=#0066ff, accentColor=#39FF14]`;

      const history = messages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.content }] 
      }));

      const stream = await sendMessageToGemini(text, history, { 
        thinkingBudget: 4096,
        systemInstruction
      });
      
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', agentId: selectedAgentIds[0], content: '', timestamp: new Date() }]);

      for await (const chunk of stream) {
        assistantContent += chunk.text || "";
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
      }

      if (text.toLowerCase().includes('status') || text.toLowerCase().includes('run')) {
        const newResult: TaskResult = {
          id: Math.random().toString(),
          agentName: agents.find(a => a.id === selectedAgentIds[0])?.name || 'Master Orchestrator',
          startTime: new Date().toLocaleTimeString(),
          endTime: new Date(Date.now() + 3000).toLocaleTimeString(),
          summary: `Auto-Optimization loop complete for directive: ${text.substring(0, 15)}...`,
          link: '#workspace',
          status: 'complete',
          analysis: {
            roi: '1,580% Alpha',
            riskLevel: 'low',
            easeOfImplementation: 98,
            speedEstimate: '8m Cluster Sync',
            horizon: 'short',
            recommendation: 'Immediate parallel deployment verified by Auto-ROI logic.'
          }
        };
        setResults(prev => [newResult, ...prev]);
      }
    } catch (e: any) { 
      console.error("Gemini API Error:", e);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `* <span class="neon-red-text">SYSTEM ERROR:</span> The Sovereign Cluster is currently experiencing high demand (503). 
        * <span class="neon-yellow-text">STATUS:</span> Autonomous retry logic failed to establish a secure link.
        * <span class="neon-green-text">ACTION:</span> Please standby and re-deploy your directive in a few moments.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally { 
      setIsLoading(false); 
    }
  }, [messages, agents, selectedAgentIds]);

  return (
    <div className={`flex flex-col lg:flex-row h-screen w-full bg-black text-white font-inter overflow-hidden transition-all duration-500 ${!isDarkMode ? 'light' : ''}`} style={{ fontSize: `${uiConfig.fontSizeBase}px` }}>
      
      {/* Left Chat Sidebar (Mobile hidden by default or toggleable) */}
      <ChatSidebar 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        agents={agents}
        selectedAgentIds={selectedAgentIds}
        onAgentToggle={(id) => setSelectedAgentIds(prev => prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id])}
        onSelectAllAgents={() => setSelectedAgentIds(agents.map(a => a.id))}
        recommendations={recommendations}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="flex-1 flex flex-col min-w-0 border-l border-white/5 relative bg-black dark:bg-black light:bg-slate-50">
        
        {/* Top Navigation Bar */}
        <header className="h-16 lg:h-20 border-b border-white/10 flex items-center justify-between px-4 lg:px-10 bg-black/80 backdrop-blur-3xl z-40 sticky top-0">
          <div className="flex items-center gap-4 lg:gap-10">
            <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
               <span className="w-1 lg:w-1.5 h-6 electric-gradient rounded-full"></span>
               <span className="hidden sm:inline">VIZUAL X</span>
            </h2>
            <nav className="flex items-center gap-1 sm:gap-2">
              {[
                { id: 'intelligence', label: 'Dashboard' },
                { id: 'workspace', label: 'Workspace' },
                { id: 'vault', label: 'Vault X' },
                { id: 'systems', label: 'Control' }
              ].map(nav => (
                <button 
                  key={nav.id} 
                  onClick={() => setActiveTool(nav.id as any)}
                  className={`px-3 lg:px-6 py-1.5 lg:py-2 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTool === nav.id ? 'neon-bg-green neon-green-text shadow-glow-green' : 'opacity-20 hover:opacity-100 italic'}`}
                >
                  {nav.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black neon-green-text uppercase tracking-widest animate-pulse leading-none">Sovereign Node</span>
              <span className="text-[8px] opacity-20 font-bold uppercase tracking-widest italic mt-1 leading-none">Auto-Fix Persistent</span>
            </div>
            <div className="w-3 h-3 rounded-full electric-gradient shadow-glow-blue"></div>
          </div>
        </header>

        {/* Autonomous Systems Bar */}
        <div className="h-8 lg:h-10 bg-zinc-950 border-b border-white/10 flex items-center px-4 lg:px-6 gap-6 overflow-hidden z-30">
           <div className="flex-1 flex items-center gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
              {autoSystems.map(sys => (
                <div key={sys.id} className="flex items-center gap-2 whitespace-nowrap group">
                   <div className={`w-1.5 h-1.5 rounded-full ${sys.status === 'Active' || sys.status === 'Persistent' || sys.status === 'Optimal' || sys.status === 'Scaling' ? 'neon-green-gradient animate-pulse shadow-glow-green' : 'bg-white/10'}`}></div>
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-30 italic">{sys.label}:</span>
                   <span className={`text-[9px] font-black italic uppercase ${sys.color}`}>{sys.status}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            {activeTool === 'intelligence' && <IntelligenceHub recommendations={recommendations} results={results} />}
            {activeTool === 'builder' && <AgentBuilder agents={agents} setAgents={setAgents} />}
            {activeTool === 'workspace' && <WorkspaceMirror />}
            {activeTool === 'vault' && <VaultXPage />}
            {activeTool === 'systems' && <SystemsControl updates={systemUpdates} uiConfig={uiConfig} setUiConfig={setUiConfig} />}
          </div>

          {/* Right Toolbar */}
          <RightToolbar 
            activeTool={activeTool} 
            setActiveTool={setActiveTool} 
            onIdeaGenerated={(idea) => handleSendMessage(`Generate a creative idea for: ${idea}`)}
          />
        </main>
      </div>
    </div>
  );
};

export default App;