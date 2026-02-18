import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { EditorSuite } from './components/EditorSuite';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsPage } from './components/SettingsPage';
import { ValidationHub } from './components/ValidationHub';
import { MultiAgentNexus } from './components/MultiAgentNexus';
import { InfrastructurePanel } from './components/InfrastructurePanel';
import { AutonomousPartnerModules } from './components/AutonomousPartnerModules';
import { HamburgerMenu } from './components/HamburgerMenu';
import { LoginPage } from './components/LoginPage';
import { MatrixLoadingScreen } from './components/MatrixLoadingScreen';
import { UserAccountDropdown } from './components/UserAccountDropdown';
import { PageNode, Message, UIConfiguration, Agent, User, Theme } from './types';
import { ApiService } from './services/apiService';
import { authService } from './services/authService';

const INITIAL_AGENTS: Agent[] = [
  { id: 'arch-1', name: 'Architect', industry: 'Cloud Architecture', role: 'System Designer', status: 'idle', capabilities: ['Terraform', 'GCP', 'Docker'], description: 'Expert in enterprise infrastructure.', avatarColor: 'bg-blue-600', lastUpdate: 'Ready', logs: [], load: 12, intelligenceScore: 98, recursiveProgress: 100, learnedNodes: 1024 }
];

const INITIAL_SYSTEM_STATE: UIConfiguration = {
  primaryColor: '#2AF5FF', accentColor: '#1E90FF', backgroundColor: '#000000', fontSizeBase: 14, fontFamily: 'Inter',
  enabledModules: ['dashboard', 'chat', 'editor', 'vault', 'admin', 'settings', 'validation', 'infra', 'git', 'creator'],
  editorConfig: { minimap: true, lineNumbers: 'on', wordWrap: 'on', bracketPairColorization: true },
  security: { twoFactor: true, sessionTimeout: 3600, auditLevel: 'high' }
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [activePage, setActivePage] = useState<PageNode>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [systemState, setSystemState] = useState<UIConfiguration>(INITIAL_SYSTEM_STATE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
        // Use the authService for the check
        const user = authService.getUser();
        if (user) {
            setIsAuthenticated(true);
            setCurrentUser(user);
        }
        setTimeout(() => setIsAuthenticating(false), 1000);
    };
    initAuth();
  }, []);

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-mode' : '';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLoginSuccess = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const navItems = [
    { id: 'dashboard', label: 'Pulse' },
    { id: 'chat', label: 'Nexus' },
    { id: 'creator', label: 'Creator' },
    { id: 'editor', label: 'Monaco' },
    { id: 'infra', label: 'Infra' },
    { id: 'validation', label: 'Proof' },
    { id: 'settings', label: 'Config' }
  ];

  const handleNavigate = (page: PageNode) => {
    setActivePage(page);
    setIsMenuOpen(false);
  };
  
  if (isAuthenticating) {
    return <MatrixLoadingScreen />;
  }

  // Show Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className='flex h-screen w-screen bg-[var(--bg-absolute)] text-[var(--text-primary)] overflow-hidden selection:bg-blue-500/50'>
      <aside style={{ width: isSidebarOpen ? '22%' : '0%' }} className='h-full bg-[var(--surface-primary)] border-r-[0.5px] border-[var(--border-color)] transition-all duration-300 flex flex-col z-[100] hidden md:flex'>
        <ChatSidebar messages={messages} setMessages={setMessages} onSystemUpdate={(u) => setSystemState(prev => ({...prev, ...u}))} isLoading={isLoading} setIsLoading={setIsLoading} isCollapsed={!isSidebarOpen} />
      </aside>

      <div className='flex-1 flex flex-col min-w-0 h-full relative border-l border-[var(--border-color)]'>
        <header className='h-16 border-b-[0.5px] border-[var(--border-color)] bg-[var(--surface-primary)] flex items-center justify-between px-6 shrink-0 z-50'>
          <div className='flex items-center gap-6'>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='p-2 hover:bg-white/5 rounded-lg space-y-1.5 z-50'>
              <div className={hamburger-line }></div>
              <div className={hamburger-line }></div>
              <div className={hamburger-line }></div>
            </button>
            <h1 className='text-xs font-black tracking-[0.4em] italic'>Vizual X // <span className='text-[#2AF5FF]'>{activePage.toUpperCase()}</span></h1>
          </div>
          <div className='flex items-center gap-4'>
            <nav className='hidden md:flex items-center gap-1 bg-black/60 p-1 rounded-xl border-[0.5px] border-white/20'>
              {navItems.map(item => (
                <button key={item.id} onClick={() => setActivePage(item.id as any)} className={px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all }>{item.label}</button>
              ))}
            </nav>
            <UserAccountDropdown user={currentUser} onLogout={handleLogout} />
          </div>
        </header>
        
        <HamburgerMenu 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          navItems={navItems}
          activePage={activePage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <main className='flex-1 overflow-hidden p-0 md:p-6 bg-[var(--bg-absolute)]'>
           <div className='h-full w-full md:monaco-frame overflow-hidden relative md:shadow-4xl'>
              {activePage === 'dashboard' && <AdminDashboard load={12} />}
              {activePage === 'chat' && <MultiAgentNexus agents={agents} setAgents={setAgents} />}
              {activePage === 'creator' && <AutonomousPartnerModules activeModule='creator' />}
              {activePage === 'infra' && <InfrastructurePanel />}
              {activePage === 'editor' && <EditorSuite config={systemState} onUpdate={(u) => setSystemState(prev => ({...prev, ...u}))} />}
              {activePage === 'validation' && <ValidationHub />}
              {activePage === 'settings' && <SettingsPage config={systemState} setConfig={setSystemState} currentUser={currentUser} onUserUpdate={setCurrentUser} />}
           </div>
        </main>
      </div>
    </div>
  );
};
export default App;
