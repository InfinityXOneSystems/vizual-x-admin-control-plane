/**
 * VIZUAL-X GOOGLE AI SERVICE
 * Integration with Google Gemini API for AI capabilities
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GoogleAIConfig, AIMessage } from '../types';

class GoogleAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private config: GoogleAIConfig | null = null;

  /**
   * Initialize the Google AI service with API key
   */
  initialize(apiKey: string, config?: Partial<GoogleAIConfig>): void {
    this.config = {
      apiKey,
      model: config?.model || import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro',
      temperature: config?.temperature || parseFloat(import.meta.env.VITE_GEMINI_TEMPERATURE || '0.7'),
      maxTokens: config?.maxTokens || parseInt(import.meta.env.VITE_GEMINI_MAX_TOKENS || '2048'),
      projectId: config?.projectId || import.meta.env.VITE_GOOGLE_PROJECT_ID,
    };

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.config.model });
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.isInitialized()) {
      return false;
    }

    try {
      const result = await this.model!.generateContent('Hello');
      return !!result.response;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate content from a prompt
   */
  async generateContent(prompt: string, model?: string): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('Google AI service not initialized. Call initialize() first.');
    }

    try {
      const targetModel = model 
        ? this.genAI!.getGenerativeModel({ model })
        : this.model!;

      const result = await targetModel.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to generate content. Please try again.');
    }
  }

  /**
   * Start a chat session
   */
  async chat(messages: AIMessage[]): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('Google AI service not initialized. Call initialize() first.');
    }

    try {
      const chat = this.model!.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    } catch (error: any) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Chat failed. Please try again.');
    }
  }

  /**
   * Generate content with streaming support
   */
  async *generateContentStream(prompt: string): AsyncGenerator<string, void, unknown> {
    if (!this.isInitialized()) {
      throw new Error('Google AI service not initialized. Call initialize() first.');
    }

    try {
      const result = await this.model!.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    } catch (error: any) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      throw new Error('Streaming failed. Please try again.');
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): GoogleAIConfig | null {
    return this.config;
  }

  /**
   * Reset the service
   */
  reset(): void {
    this.genAI = null;
    this.model = null;
    this.config = null;
  }
}

// Export singleton instance
export const googleAI = new GoogleAIService();
