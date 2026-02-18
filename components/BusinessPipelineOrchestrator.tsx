
import React, { useState } from 'react';
import { Industry } from '../types';

type PipelineTemplate = {
  id: Industry;
  name: string;
  stages: { title: string, description: string, agents: string[] }[];
};

const TEMPLATES: PipelineTemplate[] = [
  {
    id: 'Celebrity AI',
    name: 'Celebrity AI System Pipeline',
    stages: [
      { title: 'Phase 1: Ingestion', description: 'Scrape and inhale all public information across social media, news, and interviews.', agents: ['Shadow Scraper', 'Data Oracle'] },
      { title: 'Phase 2: Personality Mimic', description: 'Fine-tune a personality model based on ingested communication patterns.', agents: ['Architect', 'LLM Specialist'] },
      { title: 'Phase 3: App Scaffolding', description: 'Generate a gamified, educational mobile app shell.', agents: ['Monaco Developer', 'UI Architect'] },
      { title: 'Phase 4: Deployment', description: 'Deploy the application to a scalable serverless infrastructure on GCP.', agents: ['Architect'] },
    ]
  },
  {
    id: 'Construction',
    name: 'Construction E2E Business Pipeline',
    stages: [
      { title: 'Phase 1: AI Take-Off', description: 'Analyze construction blueprints (PDFs/CAD) to generate a materials list.', agents: ['Vision Cortex', 'Data Oracle'] },
      { title: 'Phase 2: Bid/Proposal', description: 'Generate a comprehensive bid and proposal based on materials and labor costs.', agents: ['Market Analyst', 'Exec Assistant'] },
      { title: 'Phase 3: Billing & Invoicing', description: 'Create and manage the billing cycle for the project.', agents: ['Exec Assistant'] },
      { title: 'Phase 4: Project Sync', description: 'Sync all documents to Google Workspace for client delivery.', agents: ['Workspace Agent'] },
    ]
  }
];

export const BusinessPipelineOrchestrator: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<PipelineTemplate>(TEMPLATES[0]);

  return (
    <div className="h-full w-full bg-black p-10 lg:p-12 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-12">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Pipeline Orchestrator</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.6em] opacity-30 text-blue-400 mt-2 italic">E2E Autonomous Business Logic</p>
          </div>
          <div className="flex items-center gap-4">
             <select 
                value={activeTemplate.id}
                onChange={(e) => setActiveTemplate(TEMPLATES.find(t => t.id === e.target.value) || TEMPLATES[0])}
                className="bg-[#05070A] border border-white/10 rounded-xl py-4 px-6 text-sm font-black uppercase italic outline-none focus:border-blue-500/40 text-[#C8D2DC]"
             >
                {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </select>
             <button className="px-8 py-4 electric-gradient rounded-xl text-sm font-black uppercase tracking-widest italic text-white shadow-glow border border-white/10">Execute</button>
          </div>
        </header>

        <div className="space-y-8">
            {activeTemplate.stages.map((stage, index) => (
                <div key={index} className="grid grid-cols-12 gap-8 items-center animate-in slide-in-from-left-4" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="col-span-1 text-center">
                        <div className="w-16 h-16 mx-auto bg-[#05070A] border border-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-black italic text-blue-400">{index + 1}</span>
                        </div>
                        {index < activeTemplate.stages.length - 1 && <div className="h-16 w-px bg-white/10 mx-auto mt-4"></div>}
                    </div>

                    <div className="col-span-11 p-8 bg-[#05070A] border border-white/5 rounded-[32px] hover:border-blue-500/30 transition-all">
                        <h3 className="text-2xl font-black italic uppercase tracking-widest mb-3">{stage.title}</h3>
                        <p className="text-sm opacity-50 mb-6">{stage.description}</p>
                        <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-30">Agents:</span>
                            <div className="flex gap-2">
                                {stage.agents.map(agentName => (
                                    <span key={agentName} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">{agentName}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
