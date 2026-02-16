
import React, { useState } from 'react';
import { PageNode, FileData, GitCommit } from '../types';
import { MonacoEditor } from './MonacoEditor';
import { CreatorHub } from './CreatorHub';
import { WorkspaceMirror } from './WorkspaceMirror';
import { GitPanel } from './GitPanel';

interface AutonomousPartnerModulesProps {
  activeModule: PageNode;
  files?: FileData[];
  stagedFiles?: string[];
  history?: GitCommit[];
  onStage?: (id: string) => void;
  onUnstage?: (id: string) => void;
  onCommit?: (message: string) => void;
}

export const AutonomousPartnerModules: React.FC<AutonomousPartnerModulesProps> = ({ 
  activeModule, files = [], stagedFiles = [], history = [], onStage, onUnstage, onCommit 
}) => {
  const [projectFiles, setProjectFiles] = useState<FileData[]>(files);
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');

  const renderModule = () => {
    switch (activeModule) {
      case 'creator': return <CreatorHub tool="image" />;
      case 'workspace': return <WorkspaceMirror />;
      case 'git': return (
        <div className="flex-1 p-8 lg:p-16 overflow-y-auto bg-black custom-scrollbar">
          <h2 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">Lineage Matrix</h2>
          <GitPanel files={files} stagedFiles={stagedFiles} history={history} onStage={onStage!} onUnstage={onUnstage!} onCommit={onCommit!} theme="dark" />
        </div>
      );
      default: return <div className="flex-1 flex items-center justify-center opacity-10"><span className="text-[120px] font-black italic tracking-tighter">VIX</span></div>;
    }
  };

  return <div className="w-full h-full overflow-hidden bg-black">{renderModule()}</div>;
};
