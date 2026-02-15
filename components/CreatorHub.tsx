
import React, { useState, useEffect } from 'react';
// Corrected import from App to types
import { CreatorTool, FileData } from '../types';
import { generateImage, generateVideo, sendMessageToGemini } from '../services/geminiService';

interface CreatorHubProps {
  tool: CreatorTool;
  activeFile: FileData | null;
  onCodeGenerated: (code: string) => void;
}

const BUSINESS_BLUEPRINTS = [
  { id: 'marketing', label: 'Marketing Plan', prompt: 'Create a comprehensive 12-month marketing plan for a high-tech SaaS product. Include target audience, channel strategy, budget allocation, and KPI tracking. Design it as a sleek React component.' },
  { id: 'proposal', label: 'Project Proposal', prompt: 'Draft a professional project proposal for a cloud infrastructure migration. Include executive summary, scope of work, timeline, and cost breakdown. Format as a clean, interactive React document.' },
  { id: 'exec', label: 'Executive Summary', prompt: 'Generate a high-impact executive summary for a seed-stage AI startup pitch. Focus on problem/solution, market opportunity, and traction. Use a sophisticated dark-mode UI.' },
  { id: 'financial', label: 'Financial Forecast', prompt: 'Build a 3-year financial forecasting dashboard template with charts for revenue, burn rate, and runway. Ensure it uses Tailwind for a financial-tech aesthetic.' }
];

export const CreatorHub: React.FC<CreatorHubProps> = ({ tool, activeFile, onCodeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  
  // Headless Browser States
  const [url, setUrl] = useState('https://social.vix.sovereign.ai');
  const [browserLogs, setBrowserLogs] = useState<string[]>(['[SYSTEM] Initializing Headless Shadow Runtime...', '[CORE] Handshake with Vertex AI successful.']);
  const [browserMode, setBrowserMode] = useState<'idle' | 'typing' | 'scrolling' | 'ingesting'>('scrolling');
  const [intelligenceMetrics, setIntelligenceMetrics] = useState({
    scrapeRate: '0.0 kb/s',
    normalization: 0,
    predictionConfidence: 0,
    socialEngagement: 0
  });

  // Simulate background autonomous activity for the Headless Browser
  useEffect(() => {
    if (tool !== 'browser') return;

    const logInterval = setInterval(() => {
      const logs = [
        `[BROWSER] Autonomous AsyncIO capturing segments from ${url.substring(0, 15)}...`,
        `[INGEST] Ingesting raw DOM segments for Vertex normalization...`,
        `[OPS] Typing simulated sequence: "Market disruption is near..."`,
        `[SOCIAL] Replying to thread ID: 29482-B with LLM context...`,
        `[AGENT] Auto-creating LinkedIn profile: "Vix Architect Bot"...`,
        `[SOVEREIGN] Cross-platform sync: COMPLETE.`,
        `[BROWSER] Scroll speed optimized for pattern ingestion.`
      ];
      setBrowserLogs(prev => [...prev.slice(-15), logs[Math.floor(Math.random() * logs.length)]]);
      
      setIntelligenceMetrics(prev => ({
        scrapeRate: (Math.random() * 850 + 150).toFixed(1) + ' mb/s',
        normalization: Math.min(100, prev.normalization + Math.floor(Math.random() * 4)),
        predictionConfidence: 92 + Math.random() * 7.5,
        socialEngagement: Math.min(1000, prev.socialEngagement + Math.floor(Math.random() * 50))
      }));

      const modes: any[] = ['typing', 'scrolling', 'ingesting', 'idle'];
      setBrowserMode(modes[Math.floor(Math.random() * modes.length)]);
    }, 2500);

    return () => clearInterval(logInterval);
  }, [tool, url]);

  const handleAction = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;
    setIsProcessing(true);
    try {
      if (tool === 'image') {
        const url = await generateImage(finalPrompt);
        setOutput(url);
      } else if (tool === 'video') {
        const url = await generateVideo(finalPrompt);
        setOutput(url);
      } else if (tool === 'ui' || tool === 'business') {
        const systemInstruction = `You are a high-end ${tool} architect. Return ONLY code for a React component using Tailwind CSS. High-fidelity only.`;
        const response = await sendMessageToGemini(finalPrompt, [], { systemInstruction });
        let fullCode = '';
        for await (const chunk of response) {
          fullCode += chunk.text || '';
        }
        onCodeGenerated(fullCode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderToolHeader = () => {
    const info = {
      ui: { title: 'UI Architect', desc: 'Design flagship interfaces with electric glassmorphism' },
      video: { title: 'Veo Video Engine', desc: 'Cinematic 16:9 sovereign motion synthesis' },
      image: { title: 'Imagen Core', desc: 'High-fidelity asset synthesis from complex logic' },
      music: { title: 'Sonic Hub', desc: 'Autonomous melodic composition nodes' },
      business: { title: 'Business Blueprint', desc: 'Strategic corporate architecture & documentation' },
      browser: { title: 'Shadow Browser', desc: 'Headless Agent / Social Ops / Autonomous Ingestion' },
      editor: { title: 'Monaco Node', desc: 'Recursive NL Coding Engine' }
    }[tool as any] || { title: 'Sovereign Core', desc: 'Logic Processor' };

    return (
      <div className="mb-16 animate-in fade-in slide-in-from-left-4 duration-1000">
        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">{info.title}</h2>
        <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 electric-text">{info.desc}</p>
      </div>
    );
  };

  if (tool === 'browser') {
    return (
      <div className="flex-1 flex flex-col p-16 animate-in fade-in duration-700 bg-black overflow-hidden h-full">
        {renderToolHeader()}
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-12 overflow-hidden">
           {/* Dash Sidebar */}
           <div className="p-12 bg-white/5 border border-white/10 rounded-[40px] shadow-4xl backdrop-blur-3xl flex flex-col gap-12">
              <div className="space-y-8">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] electric-text opacity-50 italic">Agent Telemetry</label>
                <div className="space-y-6">
                  <div className="p-8 bg-black/40 border border-white/5 rounded-3xl shadow-inner group">
                    <p className="text-[9px] font-black uppercase opacity-20 mb-4 tracking-widest italic">Ingestion Confidence</p>
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-black electric-text italic tracking-tighter">{intelligenceMetrics.predictionConfidence.toFixed(1)}%</p>
                      <div className="flex gap-2 mb-2">
                        {[1,2,3,4,5,6].map(i => <div key={i} className={`w-2 h-5 rounded-full ${i <= 5 ? 'electric-gradient' : 'bg-white/10'} transition-all`}></div>)}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-black/40 border border-white/5 rounded-3xl shadow-inner">
                    <p className="text-[9px] font-black uppercase opacity-20 mb-4 tracking-widest italic">Normalization Progress</p>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full electric-gradient shadow-glow transition-all duration-1000" style={{ width: `${intelligenceMetrics.normalization}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <span className="text-[10px] font-mono-code opacity-20 italic">{intelligenceMetrics.scrapeRate}</span>
                      <span className="text-[10px] font-black electric-text uppercase tracking-widest animate-pulse italic">SYNC ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-50 italic mb-6">Headless Stream</label>
                <div className="flex-1 bg-black/80 rounded-[32px] border border-white/5 p-8 font-mono-code text-[10px] overflow-y-auto custom-scrollbar leading-relaxed">
                  {browserLogs.map((log, i) => (
                    <div key={i} className="mb-3 last:mb-0 animate-in slide-in-from-left-2 duration-300">
                      <span className="text-white/10 mr-3">[{i.toString().padStart(2, '0')}]</span>
                      <span className={log.includes('BROWSER') || log.includes('AGENT') ? 'electric-text font-bold' : 'text-white/30 italic'}>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           {/* Main Render Area */}
           <div className="lg:col-span-2 flex flex-col gap-10 overflow-hidden">
              <div className="bg-white/5 border border-white/10 rounded-[40px] shadow-4xl overflow-hidden flex flex-col h-full backdrop-blur-3xl">
                 <div className="h-24 bg-white/[0.02] border-b border-white/5 flex items-center px-12 gap-12">
                    <div className="flex gap-4">
                       <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 text-white/20 hover:text-white">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" /></svg>
                       </button>
                       <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 text-white/20 hover:text-white">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" /></svg>
                       </button>
                    </div>

                    <div className="flex-1 h-14 bg-black/60 rounded-[22px] border border-white/5 flex items-center px-8 gap-5 group focus-within:border-blue-500/50 transition-all shadow-inner">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-glow"></div>
                      <input 
                        type="text" 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-xs font-mono-code text-white/40 focus:text-white transition-colors tracking-tight italic" 
                      />
                    </div>

                    <div className="flex gap-3">
                       {[1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full ${i === 3 ? 'electric-gradient' : 'bg-white/5'} border border-white/10 shadow-glow`}></div>)}
                    </div>
                 </div>

                 <div className="flex-1 p-16 bg-[#010101] relative flex flex-col items-center justify-center">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--electric-blue-hex) 1px, transparent 0)', backgroundSize: '64px 64px' }}></div>
                    
                    <div className="w-full max-w-3xl aspect-video rounded-[48px] bg-white/[0.98] flex flex-col items-center justify-center text-black shadow-[0_60px_120px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-1000 overflow-hidden relative group">
                      <div className="absolute top-12 left-12 p-6 bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-4xl italic">{browserMode.toUpperCase()}...</div>
                      <div className="text-center relative z-10 p-12">
                         <div className={`w-28 h-28 rounded-[36px] border-[6px] border-black/10 flex items-center justify-center mb-10 mx-auto transition-all duration-700 ${browserMode !== 'idle' ? 'animate-electric-pulse scale-110' : ''}`}>
                            <div className="w-6 h-6 bg-black rounded-full shadow-2xl"></div>
                         </div>
                         <h3 className="text-5xl font-black uppercase tracking-tighter italic mb-4 italic">Shadow Agent</h3>
                         <p className="text-[12px] font-black uppercase tracking-[0.5em] opacity-30 max-w-[400px] mx-auto leading-relaxed italic">Parallel Social Media Operation & Pattern Ingestion Core</p>
                      </div>
                      
                      {/* Visual Feed Sim */}
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col p-10 justify-end">
                         <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-black animate-[ping_2s_infinite]" style={{ width: '100%' }}></div>
                         </div>
                         <div className="flex justify-between items-center px-4">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Ingesting DOM...</span>
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">Node ID: SHDW-74</span>
                         </div>
                      </div>
                    </div>

                    <div className="mt-16 flex gap-8">
                       <button className="px-12 py-5 bg-white/5 border border-white/10 rounded-[24px] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all hover:electric-text italic">Post Update</button>
                       <button className="px-12 py-5 electric-gradient rounded-[24px] text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-blue-600/40 active:scale-95 transition-all border border-white/10 italic">Force Full Scrape</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-16 overflow-auto bg-black animate-in fade-in duration-700 custom-scrollbar h-full">
      {renderToolHeader()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
           <div className="p-16 bg-white/5 border border-white/10 rounded-[40px] space-y-12 backdrop-blur-3xl shadow-4xl shadow-blue-900/10">
              {tool === 'business' && (
                <div className="space-y-8">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">System Blueprints</label>
                  <div className="grid grid-cols-2 gap-6">
                    {BUSINESS_BLUEPRINTS.map((bp) => (
                      <button
                        key={bp.id}
                        onClick={() => { setPrompt(bp.prompt); handleAction(bp.prompt); }}
                        className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/5 transition-all text-left group shadow-inner"
                      >
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white group-hover:electric-text mb-3 italic">{bp.label}</p>
                        <p className="text-[9px] opacity-10 font-mono-code tracking-widest uppercase italic">Sovereign Cluster Node</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-8">
                <label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">Logic Parameters</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Define autonomous ${tool} directive...`}
                  className="w-full bg-black/40 border border-white/10 rounded-[32px] p-10 text-sm font-bold min-h-[250px] outline-none focus:border-blue-500 transition-all resize-none shadow-inner tracking-tight leading-relaxed italic"
                />
              </div>
              
              <button 
                onClick={() => handleAction()}
                disabled={isProcessing || !prompt.trim()}
                className="w-full py-8 electric-gradient text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-[11px] shadow-2xl shadow-blue-600/50 active:scale-95 transition-all border border-white/10 italic"
              >
                {isProcessing ? 'Synthesizing Node...' : `EXECUTE ${tool.toUpperCase()} OPS`}
              </button>
           </div>
        </div>

        <div className="space-y-12 flex flex-col h-full min-h-[600px]">
           <div className="flex-1 p-16 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-center relative overflow-hidden shadow-4xl backdrop-blur-3xl">
              {!output && !isProcessing && (
                <div className="text-center opacity-10">
                  <div className="w-24 h-24 border-2 border-dashed border-white rounded-[40px] mx-auto mb-10 flex items-center justify-center animate-pulse">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-[12px] font-black uppercase tracking-[0.6em] italic">Cluster Idle / Command Pending</p>
                </div>
              )}
              {isProcessing && (
                <div className="flex flex-col items-center gap-12">
                  <div className="w-20 h-20 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin shadow-glow"></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] electric-text animate-pulse italic">Synthesizing High-Fidelity Logic...</p>
                </div>
              )}
              {output && !isProcessing && (
                <div className="w-full h-full animate-in zoom-in-95 duration-1000 flex items-center justify-center p-4">
                  {tool === 'image' && <img src={output} className="max-w-full max-h-full object-contain rounded-[40px] shadow-4xl border border-white/5" alt="Vix Sovereign Output" />}
                  {tool === 'video' && <video src={output} controls className="max-w-full max-h-full rounded-[40px] shadow-4xl border border-white/5" />}
                  {tool === 'music' && (
                    <div className="p-20 bg-blue-600/5 border border-blue-500/20 rounded-[48px] text-center shadow-4xl w-full">
                       <span className="text-7xl mb-12 block animate-bounce">🎵</span>
                       <p className="text-sm font-black electric-text uppercase tracking-[0.3em] mb-6 italic leading-relaxed">{output}</p>
                       <p className="text-[11px] opacity-20 font-black uppercase tracking-[0.4em] italic">Audio Node Sync Persistent</p>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};