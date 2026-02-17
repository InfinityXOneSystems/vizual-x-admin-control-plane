import React from 'react';

interface CloudRunService {
  name: string;
  status: string;
  url?: string;
  region?: string;
}

interface InfinityMatrixProps {
  cloudRunServices: CloudRunService[];
}

export const InfinityMatrix: React.FC<InfinityMatrixProps> = ({ cloudRunServices }) => {
  if (cloudRunServices.length === 0) {
    return (
      <section className="p-12 rounded-[56px] bg-zinc-950 border border-white/5 shadow-inner">
        <h3 className="text-2xl font-black italic uppercase tracking-widest mb-8">Infinity Matrix</h3>
        <div className="text-center py-16 text-white/30">
          <p className="text-sm uppercase tracking-widest">No Cloud Run services detected</p>
          <p className="text-xs mt-2 opacity-60">Run GCP audit to populate the matrix</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-6">
        <h3 className="text-2xl font-black italic uppercase tracking-widest">Infinity Matrix</h3>
        <div className="h-px flex-1 bg-white/5"></div>
        <div className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
          Cloud Run Services
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cloudRunServices.map((service, idx) => {
          const isOnline = service.status === 'True' || service.status === 'online';
          const statusColor = isOnline ? 'green' : 'amber';
          
          return (
            <div 
              key={idx}
              className="p-8 rounded-[40px] bg-white/[0.01] border border-white/10 hover:border-blue-500/40 transition-all group shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[280px]"
            >
              {/* Background Icon */}
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="text-6xl">☁️</span>
              </div>

              {/* Content */}
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-white/10 bg-black shadow-inner">
                    ☁️
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-${statusColor}-500 shadow-glow-${statusColor} ${!isOnline ? 'animate-pulse' : ''}`}></div>
                </div>
                
                <div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-1">
                    {service.name}
                  </h4>
                  <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] italic">
                    Cloud Run Service
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 relative z-10 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-mono opacity-30 uppercase italic">
                  <span>Status</span>
                  <span className={`text-${statusColor}-400 font-bold`}>
                    {isOnline ? 'ONLINE' : 'DEGRADED'}
                  </span>
                </div>
                
                {service.region && (
                  <div className="flex justify-between items-center text-[10px] font-mono opacity-30 uppercase italic">
                    <span>Region</span>
                    <span className="text-white">{service.region}</span>
                  </div>
                )}

                {service.url && (
                  <div className="mt-4">
                    <a 
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[9px] font-mono text-blue-400 hover:text-blue-300 truncate transition-colors"
                    >
                      {service.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
