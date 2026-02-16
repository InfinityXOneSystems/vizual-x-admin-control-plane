import * as vscode from 'vscode';
import { LLMProviderManager } from './LLMProviderManager';
import axios from 'axios';

export class NaturalLanguageCodeGenerator {
  private context: vscode.ExtensionContext;
  private llmManager: LLMProviderManager;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext, llmManager: LLMProviderManager) {
    this.context = context;
    this.llmManager = llmManager;
    this.outputChannel = vscode.window.createOutputChannel(
      'Vizual-X NL Code Gen'
    );
  }

  async initialize(): Promise<void> {
    this.log('Natural Language Code Generator initialized');
  }

  async generateFromNL(
    nlDescription: string,
    language: string = 'typescript',
    context?: string
  ): Promise<string> {
    this.log(`🔨 Generating ${language} code from: "${nlDescription}"`);

    try {
      // Get optimal LLM provider
      const provider = await this.llmManager.getOptimalProvider({
        requestType: 'balanced'
      });

      if (!provider) {
        throw new Error('No LLM provider available');
      }

      // Construct prompt for code generation
      const prompt = this.constructPrompt(nlDescription, language, context);

      // Call LLM provider
      let generatedCode: string;

      if (provider.name === 'Ollama') {
        generatedCode = await this.callOllama(provider.endpoint, prompt);
      } else if (provider.name === 'Groq') {
        generatedCode = await this.callGroq(
          provider.endpoint,
          provider.apiKey!,
          prompt
        );
      } else if (provider.name === 'Vertex AI') {
        generatedCode = await this.callVertexAI(provider.endpoint, prompt);
      } else {
        throw new Error(`Unsupported provider: ${provider.name}`);
      }

      this.log(`✅ Code generated successfully (${generatedCode.length} chars)`);
      return this.formatCode(generatedCode, language);
    } catch (error) {
      this.log(`❌ Generation failed: ${error}`);
      throw error;
    }
  }

  private constructPrompt(
    nlDescription: string,
    language: string,
    context?: string
  ): string {
    return `You are an expert ${language} developer. Generate production-quality ${language} code based on the following description.

DESCRIPTION:
${nlDescription}

${context ? `CONTEXT:\n${context}\n` : ''}

REQUIREMENTS:
- Write clean, well-documented code
- Include proper error handling
- Follow best practices for ${language}
- Use descriptive variable names
- Add comments for complex logic

Generated code:`;
  }

  private async callOllama(endpoint: string, prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${endpoint}/api/generate`, {
        model: 'mistral',
        prompt: prompt,
        stream: false,
        temperature: 0.7
      });

      return response.data.response || '';
    } catch (error) {
      throw new Error(`Ollama API error: ${error}`);
    }
  }

  private async callGroq(
    endpoint: string,
    apiKey: string,
    prompt: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${endpoint}/chat/completions`,
        {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content || '';
    } catch (error) {
      throw new Error(`Groq API error: ${error}`);
    }
  }

  private async callVertexAI(endpoint: string, prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${endpoint}:predict`, {
        instances: [{ content: prompt }],
        parameters: {
          candidateCount: 1,
          maxOutputTokens: 2048,
          temperature: 0.7
        }
      });

      return response.data.predictions[0].content || '';
    } catch (error) {
      throw new Error(`Vertex AI API error: ${error}`);
    }
  }

  private formatCode(code: string, language: string): string {
    // Extract code block if wrapped in markdown
    const codeBlockRegex = /```(?:\\w+)?\n?([\s\S]*?)\n?```/;
    const match = code.match(codeBlockRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    return code.trim();
  }

  private log(message: string): void {
    console.log(message);
    this.outputChannel.appendLine(message);
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}
