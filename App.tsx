
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { AgentBuilder } from './components/AgentBuilder';
import { WorkspaceMirror } from './components/WorkspaceMirror';
import { IntelligenceHub } from './components/IntelligenceHub';
import { Agent, Message, TaskResult, Recommendation, Connector, CreatorTool } from './types';
import { sendMessageToGemini } from './services/geminiService';

const SPECIALIST_AGENTS: Agent[] = [
  { id: 'exec', name: 'Executive Assistant', industry: 'Executive', role: 'Strategic Summary', status: 'active', capabilities: ['workspace', 'github'], description: 'Summarizes all cluster activity into actionable live updates.', avatarColor: 'bg-white', lastUpdate: 'Synced 1m ago' },
  { id: 'prophet', name: 'Market Prophet', industry: 'Market Signals', role: 'Trend Analysis', status: 'active', capabilities: ['browser', 'mcp'], description: 'Identifies high-probability market shifts before they happen.', avatarColor: 'bg-blue-600', lastUpdate: 'Signal: +12% Delta detected' },
  { id: 'build', name: 'Build Master', industry: 'Construction', role: 'Project Architect', status: 'idle', capabilities: ['browser', 'workspace'], description: 'Autonomous management of construction workflows and bids.', avatarColor: 'bg-orange-600', lastUpdate: 'Standby' },
  { id: 'estate', name: 'Estate Pro', industry: 'Real Estate', role: 'Asset Strategist', status: 'idle', capabilities: ['browser', 'mcp'], description: 'Deep-scrapes property undervalued signals and zoning.', avatarColor: 'bg-emerald-600', lastUpdate: 'Standby' },
  { id: 'chain', name: 'Chain Seer', industry: 'Crypto', role: 'DeFi Oracle', status: 'active', capabilities: ['browser', 'github'], description: 'Underground wallet tracking and sentiment ingestion.', avatarColor: 'bg-indigo-600', lastUpdate: 'Tracking 10 whale wallets' },
  { id: 'neural', name: 'Neural Architect', industry: 'AI Tech', role: 'Model Curator', status: 'active', capabilities: ['github', 'vscode'], description: 'Ingests new LLM benchmarks and integrates daily tech shifts.', avatarColor: 'bg-cyan-500', lastUpdate: 'Groq v2 metrics ingested' },
  { id: 'repo', name: 'Repo Stalker', industry: 'GitHub OS', role: 'OSS Hunter', status: 'idle', capabilities: ['github', 'vscode'], description: 'Auto-finds trending repos and summarizes code utility.', avatarColor: 'bg-zinc-800', lastUpdate: 'Standby' },
  { id: 'data', name: 'Data Oracle', industry: 'Stats', role: 'Consensus Specialist', status: 'idle', capabilities: ['browser', 'mcp'], description: 'Verifies statistics across conflicting news sources.', avatarColor: 'bg-rose-600', lastUpdate: 'Standby' },
  { id: 'sage', name: 'Syntax Sage', industry: 'Code Tech', role: 'Full-stack Engine', status: 'active', capabilities: ['vscode', 'docker'], description: 'Implements apps through natural language instructions.', avatarColor: 'bg-violet-600', lastUpdate: 'Refactoring Workspace Mirror' },
  { id: 'ghost', name: 'Shadow Ghost', industry: 'Shadow Scrape', role: 'Deep Ingestor', status: 'active', capabilities: ['browser'], description: 'Stealth ingestion of paywalled and elite underground news.', avatarColor: 'bg-zinc-900', lastUpdate: 'Scraping Private Substack' }
];

const INITIAL_CONNECTORS: Connector[] = [
  { id: 'workspace', name: 'Google Workspace', category: 'workspace', status: 'connected', icon: '💼' },
  { id: 'github', name: 'GitHub Remote', category: 'dev', status: 'connected', icon: '📁' },
  { id: 'vscode', name: 'VS Code Sync', category: 'dev', status: 'connected', icon: '💻' },
  { id: 'docker', name: 'Docker Local', category: 'dev', status: 'connected', icon: '🐳' },
  { id: 'browser', name: 'Shadow Browser', category: 'llm', status: 'connected', icon: '🌐' },
  { id: 'mcp', name: 'MCP Node', category: 'cloud', status: 'connected', icon: '📡' }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<CreatorTool>('intelligence');
  const [agents, setAgents] = useState<Agent[]>(SPECIALIST_AGENTS);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(['exec']);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    { id: '1', source: 'Market Prophet', title: '10 Stocks identified for 20% gain', prediction: 'Historical events suggest a massive breakout in semiconductor sector.', confidence: 88, action: 'Review Analysis' },
    { id: '2', source: 'Shadow Ghost', title: 'New tech leak found on private forum', prediction: 'New LPU hardware architecture discovered; 10x faster inference.', confidence: 94, action: 'Synthesize Report' }
  ]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const activeTeamNames = agents.filter(a => selectedAgentIds.includes(a.id)).map(a => a.name).join(', ');

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
      const stream = await sendMessageToGemini(text, history, { systemInstruction: `You are orchestrating: ${activeTeamNames}. Provide short, jargon-free, actionable responses.` });
      
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', agentId: selectedAgentIds[0], content: '', timestamp: new Date() }]);

      for await (const chunk of stream) {
        assistantContent += chunk.text || "";
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
      }

      // Simulate Result Generation
      if (text.toLowerCase().includes('run') || text.toLowerCase().includes('start')) {
        const newResult: TaskResult = {
          id: Math.random().toString(),
          agentName: agents.find(a => a.id === selectedAgentIds[0])?.name || 'Vix Agent',
          startTime: new Date().toLocaleTimeString(),
          endTime: new Date(Date.now() + 5000).toLocaleTimeString(),
          summary: `Successfully completed ${text} operation with 98% efficiency.`,
          link: '#workspace',
          status: 'complete'
        };
        setResults(prev => [newResult, ...prev]);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [messages, agents, selectedAgentIds]);

  return (
    <div className="flex h-screen w-full bg-black text-white font-inter overflow-hidden">
      <ChatSidebar 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        agents={agents}
        selectedAgentIds={selectedAgentIds}
        onAgentToggle={(id) => setSelectedAgentIds(prev => prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id])}
        // Passed onSelectAllAgents prop to handle line 90 in ChatSidebar
        onSelectAllAgents={() => setSelectedAgentIds(agents.map(a => a.id))}
        recommendations={recommendations}
      />

      <div className="flex-1 flex flex-col min-w-0 border-l border-white/5 relative">
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-12 bg-black/80 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-12">
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Sovereign / {activeTool.toUpperCase()}</h2>
            <nav className="flex items-center gap-2">
              {[
                { id: 'intelligence', label: 'Dashboard' },
                { id: 'builder', label: 'Agent Builder' },
                { id: 'workspace', label: 'Workspace' },
                { id: 'editor', label: 'Node Code' }
              ].map(nav => (
                <button 
                  key={nav.id} 
                  onClick={() => setActiveTool(nav.id as any)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTool === nav.id ? 'bg-white/10 text-white' : 'opacity-20 hover:opacity-100 italic'}`}
                >
                  {nav.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black electric-text uppercase tracking-widest animate-pulse">Orchestrator Online</span>
            <div className="w-2.5 h-2.5 rounded-full electric-gradient shadow-glow"></div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex bg-black">
          {activeTool === 'intelligence' && <IntelligenceHub recommendations={recommendations} results={results} />}
          {activeTool === 'builder' && <AgentBuilder agents={agents} setAgents={setAgents} />}
          {activeTool === 'workspace' && <WorkspaceMirror />}
          {activeTool === 'editor' && <div className="p-20 text-center opacity-10 uppercase tracking-[1em] text-xs">Kernel Access Pending...</div>}
        </main>
      </div>
    </div>
  );
};

export default App;