
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the ApiService to prevent actual network calls during tests
vi.mock('../../services/apiService', () => ({
  ApiService: {
    auth: {
      demoLogin: vi.fn().mockResolvedValue({ success: true }),
    },
    users: { list: vi.fn().mockResolvedValue([]) },
    tokens: { list: vi.fn().mockResolvedValue([]) },
    flags: { list: vi.fn().mockResolvedValue([]) },
  }
}));

describe('App', () => {
  beforeEach(() => {
    // Clear local storage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('when logged out', () => {
    it('renders the LoginPage', () => {
      render(<App />);
      // Check for a unique element on the LoginPage
      expect(screen.getByPlaceholderText('OPERATOR EMAIL')).toBeInTheDocument();
      // Use a query that is specific enough to the login page header
      const loginHeaders = screen.getAllByText(/Vizual X/i);
      const loginHeader = loginHeaders.find(h => h.tagName === 'H1');
      expect(loginHeader).toBeInTheDocument();
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      // Mock being logged in
      localStorage.setItem('vix-session-active', 'true');
    });

    it('renders the main application header', () => {
      render(<App />);
      // The header has "Vizual X //" followed by the page name
      const headerElement = screen.getByText(/Vizual X \/\//i);
      expect(headerElement).toBeInTheDocument();
    });

    it('renders the Nexus chat interface by default', () => {
      render(<App />);
      // Check for a unique element in the MultiAgentNexus component
      const nexusTerminal = screen.getByText(/NEXUS TERMINAL/i);
      expect(nexusTerminal).toBeInTheDocument();
    });
  });
});