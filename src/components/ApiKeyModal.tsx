
import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => Promise<void>;
  serviceName: string;
  serviceIcon: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSubmit, serviceName, serviceIcon }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API Key cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onSubmit(apiKey);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Validation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg metallic-border-card shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                        {serviceIcon}
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tighter text-white">Connect {serviceName}</h3>
                        <p className="text-xs opacity-40 font-mono-code uppercase tracking-widest mt-1">Enter API Key to sync</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-center text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg">{error}</p>}
                
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`${serviceName} API Key`}
                    className="w-full bg-[var(--input-bg)] border-[0.5px] border-[var(--border-color)] rounded-xl p-4 text-sm font-bold outline-none focus:border-[#2AF5FF] transition-all text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] shadow-inner"
                />

                <button type="submit" disabled={isLoading} className="w-full p-4 futuristic-btn text-sm font-black uppercase tracking-widest">
                    {isLoading 
                        ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> 
                        : `Validate & Connect`
                    }
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
