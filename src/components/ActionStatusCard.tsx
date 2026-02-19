
import React from 'react';

interface ActionStatusCardProps {
  status: 'idle' | 'pending' | 'success' | 'failure';
  title: string;
  description: string;
}

export const ActionStatusCard: React.FC<ActionStatusCardProps> = ({ status, title, description }) => {
  if (status === 'idle') return null;

  const statusConfig = {
    pending: { color: 'text-blue-400', borderColor: 'border-blue-500/30' },
    success: { color: 'text-green-400', borderColor: 'border-green-500/30' },
    failure: { color: 'text-red-400', borderColor: 'border-red-500/30' },
    idle: { color: 'text-zinc-500', borderColor: 'border-zinc-500/30' }
  };

  const Icon = () => {
    switch (status) {
      case 'pending': return <div className="w-5 h-5 border-2 border-blue-400/50 border-t-blue-400 rounded-full animate-spin"></div>;
      case 'success': return <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      case 'failure': return <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
      default: return null;
    }
  };

  return (
    <div className={`p-4 mx-4 mb-4 bg-black/50 border ${statusConfig[status].borderColor} rounded-xl shadow-lg animate-in fade-in`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <Icon />
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-sm ${statusConfig[status].color}`}>{title}</h4>
          <p className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap">{description}</p>
        </div>
      </div>
    </div>
  );
};
