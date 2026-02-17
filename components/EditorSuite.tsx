
import React, { useState } from 'react';
import { UIConfiguration, FileData } from '../types';
import { MonacoEditor } from './MonacoEditor';

const INITIAL_PROJECT_FILES: FileData[] = [
  { id: 'fe-app', name: 'SovereignDashboard.tsx', language: 'typescript', content: `import React from 'react';\n\nexport const Dashboard = () => {\n  return (\n    <div className="p-20">\n      <h1 className="text-6xl font-black italic tracking-tighter text-white">VIZUAL X</h1>\n      <p className="font-bold italic text-[#2AF5FF]">Autonomous Ingress Active.</p>\n    </div>\n  );\n};` },
  { id: 'styles', name: 'styles.css', language: 'css', content: `body {\n  background: #000;\n  color: #C8D2DC;\n  font-family: 'Inter', sans-serif;\n}\n\n.sovereign-panel {\n  border: 0.5px solid var(--electric-blue);\n  backdrop-filter: blur(20px);\n}` },
  { id: 'readme', name: 'README.md', language: 'markdown', content: '# Vizual X\n\nAutonomous Sovereign Workspace for enterprise-grade AI compilation.' }
];

interface EditorSuiteProps {
  config: UIConfiguration;
  onUpdate: (update: Partial<UIConfiguration>) => void;
}

export const EditorSuite: React.FC<EditorSuiteProps> = ({ config, onUpdate }) => {
  const [files, setFiles] = useState<FileData[]>(INITIAL_PROJECT_FILES);
  const [activeFileId, setActiveFileId] = useState<string | null>(files[0]?.id || null);

  const activeFile = files.find(f => f.id === activeFileId) || null;

  const handleContentChange = (content: string) => {
    if (!activeFileId) return;
    setFiles(prevFiles => prevFiles.map(f => f.id === activeFileId ? { ...f, content } : f));
  };
  
  return (
    <div className="h-full w-full flex bg-[#05070A] overflow-hidden animate-in fade-in duration-700">
      {/* File Explorer */}
      <div className="w-72 border-r-[0.5px] border-white/10 p-6 flex flex-col gap-8 shrink-0 bg-black/40">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Workspace Nodes</h3>
        <div className="space-y-1 overflow-y-auto custom-scrollbar">
          {files.map(file => (
            <button 
              key={file.id} 
              onClick={() => setActiveFileId(file.id)} 
              className={`w-full text-left p-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeFileId === file.id 
                  ? 'bg-blue-600/20 text-blue-300' 
                  : 'text-[var(--text-muted)] hover:bg-white/5'
              }`}
            >
              <span>📄</span>
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000]">
        <MonacoEditor 
          activeFile={activeFile}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
};