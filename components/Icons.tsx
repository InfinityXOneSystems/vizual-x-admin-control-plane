
import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="url(#icon-gradient)" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <defs>
      <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E5EAF0" />
        <stop offset="50%" stopColor="#BFC5CD" />
        <stop offset="100%" stopColor="#E5EAF0" />
      </linearGradient>
    </defs>
    {children}
  </svg>
);

export const Icons = {
  MCP: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></IconWrapper>,
  Nexus: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M18 8h-3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h3m-3 -10v12m-12 -6h9" /></IconWrapper>,
  Creator: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M12 15l8.385 -8.415a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3z" /><path d="M16 5l3 3" /><path d="M9 7.07a7 7 0 0 0 1 13.93a7 7 0 0 0 6.929 -6" /></IconWrapper>,
  Editor: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><polyline points="7 8 3 12 7 16" /><polyline points="17 8 21 12 17 16" /><line x1="14" y1="4" x2="10" y2="20" /></IconWrapper>,
  Pipelines: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M4 17v-10a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v10m-16 0h16" /><line x1="12" y1="17" x2="12" y2="21" /><line x1="8" y1="21" x2="16" y2="21" /></IconWrapper>,
  Comms: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M15 4l-4 16" /><path d="M11 4l-4 16" /><path d="M21 12h-17" /></IconWrapper>,
  Matrix: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><path d="M9 6v6" /><path d="M6 9h6" /><path d="M9 18v-6" /><path d="M6 15h6" /><path d="M15 6v6" /><path d="M18 9h-6" /><path d="M15 18v-6" /><path d="M18 15h-6" /></IconWrapper>,
  Builder: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" /><line x1="15" y1="4" x2="15" y2="20" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /></IconWrapper>,
  Admin: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></IconWrapper>,
  Settings: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></IconWrapper>,
  Logout: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M7 12h14l-3 -3m0 6l3 -3" /></IconWrapper>,
  Send: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><line x1="10" y1="14" x2="21" y2="3" /><path d="M21 3L14 21L10 14L3 10L21 3Z" /></IconWrapper>,
  Spinner: ({ className = 'w-6 h-6' }) => <IconWrapper className={className + ' animate-spin'}><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></IconWrapper>,
  File: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /></IconWrapper>,
  Search: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></IconWrapper>,
  Image: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></IconWrapper>,
  Video: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="8" y1="4" x2="8" y2="20" /><line x1="16" y1="4" x2="16" y2="20" /><rect x="4" y="8" width="16" height="8" /></IconWrapper>,
  Edit: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></IconWrapper>,
  Analyze: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M3 12h18M3 6h18M3 18h18" /></IconWrapper>,
  TTS: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M12 20v-12" /><path d="M8 8v8" /><path d="M4 12v4" /><path d="M16 10v6" /><path d="M20 12v4" /></IconWrapper>,
  User: ({ className = 'w-6 h-6' }) => <IconWrapper className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconWrapper>,
};
