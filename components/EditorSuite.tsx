
import React, { useState } from 'react';
import { UIConfiguration } from '../types';

interface EditorSuiteProps {
  config: UIConfiguration;
  onUpdate: (update: Partial<UIConfiguration>) => void;
}

export const EditorSuite: React.FC<EditorSuiteProps> = ({ config, onUpdate }) => {
  const [activeModule, setActiveModule] = useState<'ui' | 'backend' | 'api' | 'db'>('ui');
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleCompilerAction = () => {
    setIsCompiling(true);
    setTimeout(() => setIsCompiling(false), 2000);
  };

  const UI_TREE = [
    { id: 'root', name: 'Sovereign_Layout', type: 'Container' },
    { id: 'header', name: 'Global_Header', type: 'Navigation', parent: 'root' },
    { id: 'main', name: 'Workspace_Canvas', type: 'Main', parent: 'root' },
    { id: 'sidebar', name: 'Logic_Node_Sidebar', type: 'Aside', parent: 'root' },
  ];

  return (
    <div className="h-full w-full flex bg-[#05070A] overflow-hidden animate-in fade-in duration-700">
      {/* 22% Left: Structural Hierarchy / Component Tree */}
      <div className="w-72 border-r-[0.5px] border-white/10 p-6 flex flex-col gap-8 shrink-0 bg-black/40">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Module Selector</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'ui', label: 'UI' },
              { id: 'backend', label: 'Logic' },
              { id: 'api', label: 'API' },
              { id: 'db', label: 'Data' }
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id as any)}
                className={`py-3 rounded-xl border-[0.5px] text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeModule === mod.id 
                    ? 'bg-blue-600/10 border-blue-500/40 text-blue-400' 
                    : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                }`}
              >
                {mod.label} Suite
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-hidden">
          <div className="flex justify-between items-center">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Component Tree</h3>
             <button className="text-[18px] opacity-20 hover:opacity-100 transition-opacity">+</button>
          </div>
          <div className="space-y-1 overflow-y-auto custom-scrollbar pr-2">
            {UI_TREE.map(node => (
              <div 
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-[0.5px] cursor-pointer transition-all group ${
                  selectedNode === node.id ? 'bg-blue-600/5 border-blue-500/30' : 'border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <span className={`text-[10px] ${selectedNode === node.id ? 'text-blue-400' : 'opacity-20'}`}>
                  {node.parent ? '└─' : '●'}
                </span>
                <div className="flex-1 overflow-hidden">
                  <p className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedNode === node.id ? 'text-blue-200' : 'opacity-40 group-hover:opacity-80'}`}>
                    {node.name}
                  </p>
                  <p className="text-[8px] font-mono opacity-20 uppercase">{node.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleCompilerAction}
          disabled={isCompiling}
          className="w-full py-5 electric-gradient rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-white shadow-2xl transition-all active:scale-95 disabled:opacity-30 border-[0.5px] border-white/10"
        >
          {isCompiling ? 'Syncing Nodes...' : 'E2E DEPLOYMENT'}
        </button>
      </div>

      {/* 52% Center: Interactive Rendering Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000]">
        <div className="h-12 border-b-[0.5px] border-white/10 flex items-center px-8 justify-between bg-[#05070A]/40 shrink-0">
           <div className="flex gap-6 items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#2AF5FF] italic">Production Hub // Enterprise-vX</span>
              <div className="h-3 w-[0.5px] bg-white/10"></div>
              <span className="text-[9px] font-mono opacity-20 uppercase tracking-tighter">Status: Handshake Active</span>
           </div>
           <div className="flex gap-4">
              <button className="text-[9px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity italic">Preview</button>
              <button className="text-[9px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity italic">Audit</button>
           </div>
        </div>

        <div className="flex-1 p-6 lg:p-10 overflow-hidden relative flex flex-col">
          <div className="flex-1 border-[0.5px] border-white/10 rounded-[32px] bg-[#05070A] relative flex flex-col shadow-[inset_0_0_80px_rgba(0,150,255,0.02)] overflow-hidden">
             
             {/* Dynamic Context Header */}
             <div className="p-8 border-b-[0.5px] border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full electric-gradient"></div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                    {activeModule.toUpperCase()} Architecture Node
                  </h2>
                </div>
                <div className="flex gap-2">
                   {['Global', 'Local', 'Draft'].map(v => (
                     <span key={v} className="px-3 py-1 bg-white/[0.03] border-[0.5px] border-white/10 rounded-lg text-[8px] font-black uppercase opacity-20">{v}</span>
                   ))}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
               {activeModule === 'ui' && (
                 <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-3 gap-6">
                       {[1,2,3].map(i => (
                         <div key={i} className="aspect-video rounded-2xl bg-white/[0.01] border-[0.5px] border-white/5 border-dashed flex items-center justify-center opacity-20 group hover:opacity-60 transition-all cursor-pointer">
                            <span className="text-4xl group-hover:scale-125 transition-transform">+</span>
                         </div>
                       ))}
                    </div>
                    <div className="p-12 border-[0.5px] border-white/10 rounded-[40px] bg-black/40 relative overflow-hidden flex flex-col items-center justify-center text-center py-32 group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                        <span className="text-6xl mb-8 group-hover:rotate-12 transition-transform">👁️</span>
                        <h3 className="text-sm font-black uppercase tracking-[0.5em] italic opacity-40 mb-4">Live Canvas Node</h3>
                        <p className="text-[10px] leading-relaxed max-w-sm opacity-20 uppercase tracking-tighter">
                          Autonomous UI synthesis in progress. Logic handshake validated across all visual breakpoints.
                        </p>
                    </div>
                 </div>
               )}

               {activeModule === 'api' && (
                 <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Active Endpoints</h4>
                       {[
                         { method: 'GET', path: '/api/v1/ingress', status: '200' },
                         { method: 'POST', path: '/api/v1/handshake', status: 'PENDING' },
                         { method: 'PUT', path: '/api/v1/vault/sync', status: '403' },
                       ].map((route, i) => (
                         <div key={i} className="flex justify-between items-center p-6 bg-white/[0.02] border-[0.5px] border-white/10 rounded-2xl group hover:border-blue-500/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                               <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${route.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{route.method}</span>
                               <span className="text-[11px] font-mono opacity-60 font-bold">{route.path}</span>
                            </div>
                            <span className={`text-[9px] font-mono font-bold ${route.status === '200' ? 'text-green-500' : route.status === 'PENDING' ? 'text-yellow-500 animate-pulse' : 'text-red-500'}`}>[{route.status}]</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {activeModule === 'db' && (
                 <div className="h-full flex flex-col items-center justify-center space-y-12 opacity-30 italic animate-in zoom-in duration-500">
                    <span className="text-[140px] font-black leading-none italic tracking-tighter">ERD</span>
                    <p className="text-[10px] font-black uppercase tracking-[1em]">Schema Persistence Layer Standby</p>
                    <div className="grid grid-cols-4 gap-4 w-full max-w-2xl h-px bg-white/5 relative">
                       <div className="absolute -top-2 left-1/4 w-4 h-4 rounded-full electric-gradient"></div>
                       <div className="absolute -top-2 left-3/4 w-4 h-4 rounded-full border-[0.5px] border-white/20"></div>
                    </div>
                 </div>
               )}

               {activeModule === 'backend' && (
                 <div className="flex-1 flex flex-col space-y-8 font-mono animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex-1 bg-black/40 rounded-3xl p-10 border-[0.5px] border-white/10 overflow-y-auto custom-scrollbar shadow-inner relative">
                       <div className="absolute top-4 right-8 flex gap-2">
                          {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i*0.3}s` }}></div>)}
                       </div>
                       <code className="text-xs text-zinc-500 space-y-4 block">
                          <p className="text-blue-400 opacity-60">{"//"} INITIALIZING UNIVERSAL BACKEND HANDSHAKE v4.2</p>
                          <p className="opacity-40">{"cluster.ingress.verify({ vault: 'HANDSHAKE-001', mode: 'SOVEREIGN' });"}</p>
                          <p className="opacity-40">{"const state = await orchestrator.compile({ environment: 'PRODUCTION' });"}</p>
                          <p className="text-[#2AF5FF]">{"const node = System.Logic.spawn('AUTH_CONTROLLER');"}</p>
                          <p className="text-green-500/60">{"//"} OUTPUT: NODE_PERSISTENT_v4.2.0_STABLE</p>
                          <p className="opacity-20 italic">{"[DEBUG] Latency: 0.14ms across 42 cluster nodes..."}</p>
                       </code>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* 26% Right: Property Inspector / Logic Configuration */}
      <div className="w-[450px] bg-[#05070A] border-l-[0.5px] border-white/10 p-8 overflow-y-auto custom-scrollbar shrink-0">
        <div className="space-y-12">
          <section>
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 italic">Property Inspector</h3>
             {selectedNode ? (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border-[0.5px] border-white/10 space-y-4">
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">Node ID</p>
                     <p className="text-lg font-black italic tracking-tighter text-[#2AF5FF]">{selectedNode.toUpperCase()}</p>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-widest opacity-20 italic ml-2">Display Mode</label>
                     <select className="w-full bg-black border-[0.5px] border-white/10 rounded-xl py-4 px-5 text-[10px] font-black uppercase italic outline-none focus:border-blue-500/40 transition-all text-[#C8D2DC]">
                        <option>Block (Default)</option>
                        <option>Flex</option>
                        <option>Grid</option>
                        <option>Inline-Logic</option>
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-widest opacity-20 italic ml-2">Handshake Padding</label>
                     <input type="range" className="w-full h-1 bg-white/10 rounded-full accent-blue-500 appearance-none cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <button className="py-4 bg-white/5 border-[0.5px] border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest italic opacity-40 hover:opacity-100 transition-all">Reset</button>
                     <button className="py-4 bg-blue-600/10 border-[0.5px] border-blue-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-400 italic">Apply</button>
                  </div>
               </div>
             ) : (
               <div className="p-10 border-[0.5px] border-dashed border-white/10 rounded-[32px] text-center opacity-20 italic">
                  <p className="text-[10px] uppercase tracking-widest">Awaiting Node Selection</p>
               </div>
             )}
          </section>

          <section className="space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Outcome Analysis</h3>
             <div className="p-8 rounded-[32px] bg-blue-600/[0.03] border-[0.5px] border-blue-500/20 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2AF5FF] mb-4 italic">Compiler Health</p>
                <div className="flex justify-center gap-1 mb-4">
                   {[1,2,3,4,5,6,7].map(i => (
                     <div key={i} className="w-1 bg-blue-500/40 rounded-full animate-pulse" style={{ height: (Math.random() * 20 + 10) + 'px', animationDelay: `${i*0.1}s` }}></div>
                   ))}
                </div>
                <p className="text-[9px] opacity-20 uppercase tracking-tighter leading-relaxed">System logic encrypted at rest. Zero-trust editor architecture enforced by Vizual X.</p>
             </div> {/* Fixed: Properly close the div element from line 244 before closing the section */}
          </section>
        </div>
      </div>
    </div>
  );
};
