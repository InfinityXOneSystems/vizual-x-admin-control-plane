/**
 * VIZUAL-X AUTHENTICATION SERVICE
 * Handles login, logout, session management, and OAuth integration
 */

import { AuthResult, AuthUser } from '../types';

const STORAGE_KEYS = {
  TOKEN: 'vix_auth_token',
  USER: 'vix_auth_user',
  REFRESH_TOKEN: 'vix_refresh_token',
};

// Mock users for development (replace with actual API in production)
const MOCK_USERS = [
  { id: '1', email: 'admin@vizual.x', password: 'admin123', name: 'Master Operator', role: 'admin' as const },
  { id: '2', email: 'user@vizual.x', password: 'user123', name: 'System User', role: 'user' as const },
  { id: '3', email: 'operator@vizual.x', password: 'op123', name: 'Node Operator', role: 'operator' as const },
];

/**
 * Simulates API delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a mock JWT token
 */
const generateToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    iat: Date.now() 
  }));
  const signature = btoa(`vizual-x-${userId}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
};

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<AuthResult> => {
    try {
      await delay(800); // Simulate network delay

      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      const token = generateToken(user.id);
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));

      return {
        success: true,
        token,
        user: authUser
      };
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during login. Please try again.'
      };
    }
  },

  /**
   * Login with Google OAuth
   * Note: This is a simplified implementation. In production, implement proper OAuth flow.
   */
  loginWithGoogle: async (): Promise<AuthResult> => {
    try {
      await delay(1000);
      
      // In production, this would trigger OAuth flow
      // For now, simulate successful Google login
      const mockGoogleUser: AuthUser = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        role: 'user',
        avatar: 'https://via.placeholder.com/40'
      };

      const token = generateToken(mockGoogleUser.id);
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockGoogleUser));

      return {
        success: true,
        token,
        user: mockGoogleUser
      };
    } catch (error) {
      return {
        success: false,
        error: 'Google authentication failed. Please try again.'
      };
    }
  },

  /**
   * Logout and clear session
   */
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return false;

    try {
      // Parse token and check expiration
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp && payload.exp < Date.now();
      
      return !isExpired;
    } catch {
      return false;
    }
  },

  /**
   * Get current authenticated user
   */
  getUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Get authentication token
   */
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<void> => {
    const user = authService.getUser();
    if (!user) {
      throw new Error('No user to refresh token for');
    }

    await delay(500);
    const newToken = generateToken(user.id);
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: Partial<AuthUser>): Promise<AuthUser> => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    await delay(500);
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    return updatedUser;
  }
};
