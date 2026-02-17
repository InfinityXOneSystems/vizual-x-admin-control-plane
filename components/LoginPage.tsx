
import React, { useState, useRef, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { Theme, User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  theme: Theme;
  toggleTheme: () => void;
}

type AuthView = 'login' | 'forgot';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [view, setView] = useState<AuthView>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  const [promoStatus, setPromoStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [promoMessage, setPromoMessage] = useState('');
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!isSignUp || !promoCode.trim()) {
      setPromoStatus('idle');
      setPromoMessage('');
      return;
    }

    setPromoStatus('validating');
    debounceTimer.current = window.setTimeout(async () => {
      const response = await ApiService.promo.validate(promoCode);
      if (response.success) {
        setPromoStatus('valid');
        setPromoMessage(response.message);
      } else {
        setPromoStatus('invalid');
        setPromoMessage(response.message);
      }
    }, 500); // 500ms debounce delay

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [promoCode, isSignUp]);
  
  const clearFormState = () => {
    setEmail('');
    setPassword('');
    setError('');
    setResetEmail('');
    setResetMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setIsLoading(true);
    setError('');

    const response = isSignUp 
      ? await ApiService.auth.signup(email, password, promoCode)
      : await ApiService.auth.login(email, password);
    
    setIsLoading(false);
    if (response.success && response.user) {
      onLoginSuccess(response.user);
    } else {
      setError(response.message);
    }
  };

  const handleDemo = async () => {
    setIsLoading(true);
    setError('');
    const response = await ApiService.auth.demoLogin();
    setIsLoading(false);
    if (response.success && response.user) {
      onLoginSuccess(response.user);
    } else {
      setError(response.message);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Email is required to reset passcode.');
      return;
    }
    setIsLoading(true);
    setError('');
    const response = await ApiService.auth.requestPasswordReset(resetEmail);
    setIsLoading(false);
    if (response.success) {
      setResetMessage(response.message);
      setTimeout(() => {
        setView('login');
        clearFormState();
      }, 3000);
    } else {
      setError(response.message);
    }
  };

  const renderLoginView = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">Vizual X</h1>
        <div className="h-1 w-12 bg-[#2AF5FF] mt-2 mx-auto"></div>
      </div>

      {error && <p className="mb-4 text-center text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg">{error}</p>}
      {promoStatus === 'invalid' && promoMessage && <p className="mb-4 text-center text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg">{promoMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <input
            type="email"
            placeholder="OPERATOR EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--input-bg)] border-[0.5px] border-[var(--border-color)] rounded-xl p-4 text-sm font-bold outline-none focus:border-[#2AF5FF] transition-all text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] shadow-inner"
          />
          <input
            type="password"
            placeholder="PASSCODE"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--input-bg)] border-[0.5px] border-[var(--border-color)] rounded-xl p-4 text-sm font-bold outline-none focus:border-[#2AF5FF] transition-all text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] shadow-inner"
          />
        </div>

        <div className="flex items-center justify-end">
          <button type="button" onClick={() => { setView('forgot'); clearFormState(); }} className="text-xs font-bold text-blue-400 hover:underline">Forgot Passcode?</button>
        </div>

        <button type="submit" disabled={isLoading} className="w-full p-4 futuristic-btn text-sm font-black uppercase tracking-widest">
          {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : (isSignUp ? 'Create Account' : 'Authenticate')}
        </button>
        
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-[var(--border-color)]"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-[var(--text-muted)]">OR</span>
          <div className="flex-grow border-t border-[var(--border-color)]"></div>
        </div>
        
        {isSignUp && (
           <div className="relative">
              <input
                type="text"
                placeholder="PROMO / ACCESS CODE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-[var(--input-bg)] border-[0.5px] border-[var(--border-color)] rounded-xl p-4 text-sm font-bold outline-none focus:border-[#2AF5FF] transition-all text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] shadow-inner text-center pr-10"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                {promoStatus === 'validating' && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                {promoStatus === 'valid' && <span className="text-green-500 text-xl font-bold">✓</span>}
                {promoStatus === 'invalid' && promoCode.length > 0 && <span className="text-red-500 text-xl font-bold">✗</span>}
              </div>
           </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <a href="/api/auth/google" className="w-full p-4 bg-[var(--button-alt-bg)] border border-[var(--border-color)] rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-[var(--button-alt-hover-bg)] transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 10.8842C12.0003 11.2356 11.8582 11.5721 11.6077 11.8227C11.3572 12.0732 11.0207 12.2153 10.6693 12.2153C10.3178 12.2153 9.98132 12.0732 9.73078 11.8227C9.48025 11.5721 9.33813 11.2356 9.33813 10.8842V7.89368H7.84277V10.8842C7.84277 11.6253 8.13848 12.3371 8.66579 12.8644C9.1931 13.3917 9.90494 13.6874 10.6693 13.6874C11.4336 13.6874 12.1455 13.3917 12.6728 12.8644C13.2001 12.3371 13.4958 11.6253 13.4958 10.8842V7.89368H12.0003V10.8842ZM21.9988 12.0002C21.9988 17.5217 17.5218 22.0002 11.9997 22.0002C6.47761 22.0002 2 17.5217 2 12.0002C2 6.47864 6.47761 2 11.9997 2C17.5218 2 21.9988 6.47864 21.9988 12.0002ZM16.1487 7.89368H14.6534V13.513H16.1487V7.89368Z"/></svg>
              Google
          </a>
          <a href="/api/auth/github" className="w-full p-4 bg-[var(--button-alt-bg)] border border-[var(--border-color)] rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-[var(--button-alt-hover-bg)] transition-all">
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
              GitHub
          </a>
        </div>
        
        <button type="button" onClick={handleDemo} className="w-full text-xs text-center font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">1-Time Access Demo</button>
        
        <div className="text-center pt-2">
          <p className="text-xs text-[var(--text-muted)]">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-blue-400 hover:underline">
              {isSignUp ? 'Authenticate' : 'Create Account'}
            </button>
          </p>
          <button
              type="button"
              onClick={toggleTheme}
              className="p-3 mt-6 rounded-full text-[var(--metallic-mid)] hover:bg-[var(--button-alt-hover-bg)] transition-colors"
              aria-label="Toggle theme"
          >
              {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 101.414 1.414zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" /></svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
          </button>
        </div>
      </form>
    </>
  );

  const renderForgotView = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">Reset Passcode</h1>
        <div className="h-1 w-12 bg-[#2AF5FF] mt-2 mx-auto"></div>
      </div>

      {error && <p className="mb-4 text-center text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg">{error}</p>}
      {resetMessage && <p className="mb-4 text-center text-green-400 text-xs font-bold bg-green-500/10 p-3 rounded-lg">{resetMessage}</p>}

      <form onSubmit={handlePasswordReset} className="space-y-6">
        <p className="text-center text-sm text-[var(--text-muted)]">Enter your operator email to receive a secure link to reset your passcode.</p>
        <input
          type="email"
          placeholder="OPERATOR EMAIL"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className="w-full bg-[var(--input-bg)] border-[0.5px] border-[var(--border-color)] rounded-xl p-4 text-sm font-bold outline-none focus:border-[#2AF5FF] transition-all text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] shadow-inner"
        />
        <button type="submit" disabled={isLoading} className="w-full p-4 futuristic-btn text-sm font-black uppercase tracking-widest">
          {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : 'Send Reset Link'}
        </button>
        <div className="text-center">
            <button type="button" onClick={() => { setView('login'); clearFormState(); }} className="text-xs font-bold text-blue-400 hover:underline">Back to Login</button>
        </div>
      </form>
    </>
  );

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[var(--bg-absolute)] p-0 sm:p-6 overflow-hidden relative transition-colors duration-300">
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(30,144,255,0.2),transparent_40%)]"></div>

      <div className="w-full h-full p-10 flex flex-col justify-center sm:w-full sm:max-w-md sm:h-auto sm:rounded-[16px] metallic-border-card rounded-none animate-in fade-in zoom-in-95 duration-500 relative z-10">
        {view === 'login' ? renderLoginView() : renderForgotView()}
      </div>
    </div>
  );
};
