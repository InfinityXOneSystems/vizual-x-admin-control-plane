
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface UserAccountDropdownProps {
  user: User | null;
  onLogout: () => void;
}

export const UserAccountDropdown: React.FC<UserAccountDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl bg-[var(--surface-secondary)] border-[0.5px] border-white/20 flex items-center justify-center hover:border-white/50 transition-all"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-xl object-cover" />
        ) : (
          <svg className="w-5 h-5 text-[var(--text-muted)]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-56 metallic-border-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="p-2 space-y-1">
            <div className="px-3 py-2">
                <p className="text-xs font-bold text-[var(--text-primary)]">{user.name}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
            <div className="h-px bg-[var(--border-color)] my-1"></div>
            {['My Account', 'Settings', 'Billing'].map(item => (
                <button key={item} className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--button-alt-hover-bg)] hover:text-[var(--text-primary)] transition-colors">
                    {item}
                </button>
            ))}
            <div className="h-px bg-[var(--border-color)] my-1"></div>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
