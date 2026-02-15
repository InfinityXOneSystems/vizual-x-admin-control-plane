import React, { useState } from 'react';
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

  return (
    <div className="flex-1 flex flex-col p-10 lg:p-16 overflow-auto bg-black dark:bg-black light:bg-transparent animate-in fade-in duration-700 custom-scrollbar h-full">
      <div className="mb-12">
        <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">{tool.toUpperCase()} HUB</h2>
        <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 electric-text italic">Autonomous Asset Synthesis Engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 flex-1">
        <div className="space-y-8 lg:space-y-12 h-min">
           <div className="p-8 lg:p-12 glass-panel rounded-[40px] space-y-10 shadow-4xl shadow-blue-900/10">
              {tool === 'business' && (
                <div className="space-y-6">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">System Blueprints</label>
                  <div className="grid grid-cols-2 gap-4">
                    {BUSINESS_BLUEPRINTS.map((bp) => (
                      <button
                        key={bp.id}
                        onClick={() => { setPrompt(bp.prompt); handleAction(bp.prompt); }}
                        className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/5 transition-all text-left group shadow-inner"
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:electric-text mb-2 italic">{bp.label}</p>
                        <p className="text-[8px] opacity-10 font-mono-code tracking-widest uppercase italic">Sovereign Node</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">Logic Parameters</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Define autonomous ${tool} directive...`}
                  className="w-full bg-black/40 border border-white/10 rounded-[28px] p-8 text-sm font-bold min-h-[200px] outline-none focus:border-blue-500 transition-all resize-none shadow-inner leading-relaxed italic"
                />
              </div>
              
              <button 
                onClick={() => handleAction()}
                disabled={isProcessing || !prompt.trim()}
                className="w-full py-6 lg:py-8 electric-gradient text-white rounded-[28px] font-black uppercase tracking-[0.5em] text-[11px] shadow-2xl active:scale-95 transition-all border border-white/10 italic"
              >
                {isProcessing ? 'Synthesizing Node...' : `EXECUTE OPS`}
              </button>
           </div>
        </div>

        <div className="space-y-12 flex flex-col h-full min-h-[400px]">
           <div className="flex-1 p-10 lg:p-16 glass-panel rounded-[40px] flex items-center justify-center relative overflow-hidden shadow-4xl">
              {!output && !isProcessing && (
                <div className="text-center opacity-10">
                  <div className="w-20 h-20 border-2 border-dashed border-white rounded-[32px] mx-auto mb-8 flex items-center justify-center animate-pulse">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] italic">Cluster Idle / Command Pending</p>
                </div>
              )}
              {isProcessing && (
                <div className="flex flex-col items-center gap-10">
                  <div className="w-16 h-16 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin shadow-glow"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] electric-text animate-pulse italic">Synthesizing Logic...</p>
                </div>
              )}
              {output && !isProcessing && (
                <div className="w-full h-full animate-in zoom-in-95 duration-1000 flex items-center justify-center p-4">
                  {tool === 'image' && <img src={output} className="max-w-full max-h-full object-contain rounded-[32px] shadow-4xl border border-white/5" alt="Vix Sovereign Output" />}
                  {tool === 'video' && <video src={output} controls className="max-w-full max-h-full rounded-[32px] shadow-4xl border border-white/5" />}
                  {(tool === 'ui' || tool === 'business') && (
                    <div className="p-10 bg-white/5 rounded-2xl overflow-auto max-h-full w-full">
                       <pre className="text-[10px] font-mono-code text-white/40">{output}</pre>
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