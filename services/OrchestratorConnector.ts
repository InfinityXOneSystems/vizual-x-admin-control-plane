import axios from 'axios';

// The URL where your Python Bridge is running (from the previous step)
const ORCHESTRATOR_API_URL = 'http://localhost:8000';

export interface CommandResponse {
  status: 'success' | 'error' | 'ignored';
  message: string;
  data?: any;
}

export const OrchestratorConnector = {
  /**
   * Checks if the Python Brain is online
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${ORCHESTRATOR_API_URL}/`);
      return response.data.status === 'online';
    } catch (error) {
      console.error('Orchestrator is offline:', error);
      return false;
    }
  },

  /**
   * Sends a command to the Infinity Orchestrator
   * @param action The action key (e.g., 'scan_inventory', 'deploy_agent')
   * @param target The target system or repo (optional)
   * @param params Additional parameters (optional)
   */
  async executeCommand(action: string, target?: string, params: object = {}): Promise<CommandResponse> {
    try {
      const response = await axios.post(`${ORCHESTRATOR_API_URL}/execute`, {
        action,
        target,
        params
      });
      return response.data;
    } catch (error) {
      console.error('Command failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};