/**
 * VIZUAL-X LOGIN PAGE
 * Glass morphism authentication interface with dark/light theme support
 */

import React, { useState, FormEvent } from 'react';
import { authService } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordBlur = () => {
    if (password && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.loginWithGoogle();
      
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Google login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-absolute)] p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="metallic-border-card p-8 backdrop-blur-2xl">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black italic tracking-tighter mb-2 bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#2AF5FF] bg-clip-text text-transparent">
              VIZUAL X
            </h1>
            <p className="text-[var(--text-muted)] text-sm font-bold italic tracking-wide">
              ADMIN CONTROL PLANE
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-lg bg-black/20 border ${
                  emailError ? 'border-red-500' : 'border-white/20'
                } text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#3B82F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="admin@vizual.x"
                aria-label="Email address"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-xs text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-lg bg-black/20 border ${
                  passwordError ? 'border-red-500' : 'border-white/20'
                } text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#3B82F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Enter your password"
                aria-label="Password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              {passwordError && (
                <p id="password-error" className="mt-1 text-xs text-red-400">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full futuristic-btn px-6 py-3 font-bold text-sm uppercase tracking-widest"
              aria-label="Sign in"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AUTHENTICATING...
                </span>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Google login button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all text-[var(--text-primary)] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign in with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            CONTINUE WITH GOOGLE
          </button>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 rounded-lg bg-[#2AF5FF]/5 border border-[#2AF5FF]/20">
            <p className="text-xs text-[var(--text-muted)] font-bold mb-2 uppercase tracking-wider">Demo Credentials</p>
            <div className="text-xs text-[var(--text-primary)] space-y-1 font-mono">
              <p>📧 admin@vizual.x / admin123</p>
              <p>📧 user@vizual.x / user123</p>
              <p>📧 operator@vizual.x / op123</p>
            </div>
          </div>
        </div>

        {/* Google AI Studio branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--text-muted)] font-bold italic">
            Powered by <span className="text-[#2AF5FF]">Google AI Studio</span> • <span className="text-[#8B5CF6]">Gemini API</span>
          </p>
        </div>
      </div>
    </div>
  );
};
