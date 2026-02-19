
import React from 'react';
import { PageNode } from '../types';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { id: string; label: string }[];
  activePage: PageNode;
  onNavigate: (page: PageNode) => void;
  onLogout: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose, navItems, activePage, onNavigate, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-40 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="absolute top-20 left-6 w-64 metallic-border-card shadow-2xl animate-in slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as PageNode)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activePage === item.id 
                  ? 'bg-blue-600/20 text-blue-300' 
                  : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 mt-2 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};