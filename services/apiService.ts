
import { User, ApiToken, FeatureFlag, TestResult, UIConfiguration, PromoCode } from '../types';

const API_BASE_URL = '/api';

/**
 * VIZUAL-X BACKEND CORE
 * Deterministic API Layer Client
 */
export const ApiService = {
  // AUTHENTICATION
  auth: {
    login: async (email: string, password: string):Promise<{success: boolean, message: string, user?: User}> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        return res.json();
      } catch (e) {
        console.error("Login API call failed:", e);
        return { success: false, message: 'Network error occurred.'};
      }
    },
    signup: async (email: string, password: string, promoCode?: string): Promise<{ success: boolean, message: string, user?: User }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, promoCode })
        });
        return res.json();
      } catch (e) {
        console.error("Signup API call failed:", e);
        return { success: false, message: 'Network error occurred.' };
      }
    },
    demoLogin: async (): Promise<{ success: boolean, message: string, user?: User }> => {
       try {
        const res = await fetch(`${API_BASE_URL}/auth/demo`, { method: 'POST' });
        return res.json();
      } catch (e) {
        console.error("Demo Login API call failed:", e);
        return { success: false, message: 'Network error occurred.'};
      }
    },
    logout: async (): Promise<{ success: boolean }> => {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
        return { success: true };
      } catch (e) {
        console.error("Logout API call failed:", e);
        return { success: false };
      }
    },
    checkSession: async (): Promise<{ authenticated: boolean, user: User | null }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/session`);
        if (!res.ok) return { authenticated: false, user: null };
        return res.json();
      } catch (e) {
        console.error("Session check failed:", e);
        return { authenticated: false, user: null };
      }
    },
    requestPasswordReset: async (email: string): Promise<{ success: boolean, message: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/request-reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        return res.json();
      } catch (e) {
        console.error("Password reset request API call failed:", e);
        return { success: false, message: 'Network error occurred.'};
      }
    }
  },
  
  // CONNECTIONS
  connections: {
    validate: async (service: string, token: string): Promise<{ success: boolean; message: string; user?: User }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/connections/${service}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        return res.json();
      } catch (e) {
        console.error(`API call to validate ${service} token failed:`, e);
        return { success: false, message: 'Network error during validation.' };
      }
    }
  },

  // PROMO CODES
  promo: {
    list: async (): Promise<PromoCode[]> => {
      const res = await fetch(`${API_BASE_URL}/promos`);
      return res.json();
    },
    create: async (code: Partial<PromoCode>): Promise<PromoCode> => {
      const res = await fetch(`${API_BASE_URL}/promos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(code)
      });
      return res.json();
    },
    validate: async (code: string): Promise<{ success: boolean; message: string; promo?: PromoCode }> => {
      if (!code) return { success: false, message: '' };
      try {
        const res = await fetch(`${API_BASE_URL}/promos/${code}`);
        if (!res.ok) {
           const errData = await res.json();
           return { success: false, message: errData.message || 'Invalid code.' };
        }
        return res.json();
      } catch (e) {
        console.error("Promo validation failed:", e);
        return { success: false, message: 'Network error.' };
      }
    }
  },

  // USER MANAGEMENT
  users: {
    list: async (): Promise<User[]> => {
      const res = await fetch(`${API_BASE_URL}/users`);
      return res.json();
    },
    update: async (user: User) => {
      // Implementation for user update API call
    }
  },

  // API TOKENS
  tokens: {
    list: async (): Promise<ApiToken[]> => {
      const res = await fetch(`${API_BASE_URL}/tokens`);
      return res.json();
    }
  },

  // FEATURE FLAGS
  flags: {
    list: async (): Promise<FeatureFlag[]> => {
      const res = await fetch(`${API_BASE_URL}/flags`);
      return res.json();
    },
    toggle: async (id: string): Promise<FeatureFlag | null> => {
      try {
        const res = await fetch(`${API_BASE_URL}/flags/${id}/toggle`, { method: 'POST' });
        if (!res.ok) return null;
        return res.json();
      } catch (e) {
        console.error("Failed to toggle flag:", e);
        return null;
      }
    }
  },

  // VALIDATION & PROOF SYSTEM
  validation: {
    status: async () => {
      const res = await fetch(`${API_BASE_URL}/validation/status`);
      return res.json();
    },
    getTests: async (): Promise<TestResult[]> => {
      const res = await fetch(`${API_BASE_URL}/validation/tests`);
      return res.json();
    }
  },
  
  // BILLING (Placeholder for live integration)
  billing: {
    getSummary: async (): Promise<any> => {
       try {
        const res = await fetch(`${API_BASE_URL}/billing/summary`);
        return res.json();
      } catch(e) {
        return { error: 'Billing API not configured.' };
      }
    }
  }
};
