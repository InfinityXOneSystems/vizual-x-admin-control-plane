import * as vscode from 'vscode';
import { MonacoEditorProvider } from './providers/MonacoEditorProvider';
import { LLMProviderManager } from './services/LLMProviderManager';
import { MultiAgentOrchestrator } from './services/MultiAgentOrchestrator';
import { ForensicDiagnosticEngine } from './services/ForensicDiagnosticEngine';
import { NaturalLanguageCodeGenerator } from './services/NaturalLanguageCodeGenerator';
import { SandboxIterationLayer } from './services/SandboxIterationLayer';
import { FANGConnectorSuite } from './services/FANGConnectorSuite';

let context: vscode.ExtensionContext;
let monacoEditorProvider: MonacoEditorProvider;
let llmProviderManager: LLMProviderManager;
let multiAgentOrchestrator: MultiAgentOrchestrator;
let forensicEngine: ForensicDiagnosticEngine;
let nlCodeGenerator: NaturalLanguageCodeGenerator;
let sandboxLayer: SandboxIterationLayer;
let fangConnectors: FANGConnectorSuite;

export async function activate(extensionContext: vscode.ExtensionContext) {
  context = extensionContext;

  console.log('🚀 Vizual-X Enterprise Editor Extension Activating...');

  try {
    // Initialize all services in parallel for maximum performance
    await Promise.all([
      initializeLLMProviders(),
      initializeMonacoEditor(),
      initializeMultiAgentOrchestrator(),
      initializeForensicDiagnostics(),
      initializeNLCodeGenerator(),
      initializeSandboxLayer(),
      initializeFANGConnectors()
    ]);

    // Register commands
    registerCommands();

    // Register UI providers
    registerUIProviders();

    // Auto-start orchestration
    await autoStartOrchestration();

    vscode.window.showInformationMessage('✨ Vizual-X Enterprise Editor fully initialized!');
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Vizual-X initialization failed: ${error}`);
    console.error('Extension activation error:', error);
  }
}

async function initializeLLMProviders() {
  llmProviderManager = new LLMProviderManager(context);
  await llmProviderManager.initialize();
  console.log('✅ LLM Providers initialized');
}

async function initializeMonacoEditor() {
  monacoEditorProvider = new MonacoEditorProvider(context);
  await monacoEditorProvider.initialize();
  console.log('✅ Monaco Editor initialized');
}

async function initializeMultiAgentOrchestrator() {
  multiAgentOrchestrator = new MultiAgentOrchestrator(
    context,
    llmProviderManager
  );
  await multiAgentOrchestrator.initialize();
  console.log('✅ Multi-Agent Orchestrator initialized');
}

async function initializeForensicDiagnostics() {
  forensicEngine = new ForensicDiagnosticEngine(
    context,
    llmProviderManager,
    monacoEditorProvider
  );
  await forensicEngine.initialize();
  console.log('✅ Forensic Diagnostic Engine initialized');
}

async function initializeNLCodeGenerator() {
  nlCodeGenerator = new NaturalLanguageCodeGenerator(
    context,
    llmProviderManager
  );
  await nlCodeGenerator.initialize();
  console.log('✅ NL Code Generator initialized');
}

async function initializeSandboxLayer() {
  sandboxLayer = new SandboxIterationLayer(
    context,
    llmProviderManager
  );
  await sandboxLayer.initialize();
  console.log('✅ Sandbox Iteration Layer initialized');
}

async function initializeFANGConnectors() {
  fangConnectors = new FANGConnectorSuite(context);
  await fangConnectors.initialize();
  console.log('✅ FANG Connector Suite initialized');
}

function registerCommands() {
  const commands = [
    vscode.commands.registerCommand('vizual-x.openMonacoEditor', async () => {
      monacoEditorProvider.openEditor();
    }),
    
    vscode.commands.registerCommand('vizual-x.initLLMProviders', async () => {
      await llmProviderManager.reinitialize();
      vscode.window.showInformationMessage('LLM Providers reinitialized');
    }),
    
    vscode.commands.registerCommand('vizual-x.startMultiAgentOrchestration', async () => {
      const result = await multiAgentOrchestrator.startOrchestration();
      vscode.window.showInformationMessage(`Orchestration started: ${result}`);
    }),
    
    vscode.commands.registerCommand('vizual-x.runForensicDiagnostic', async () => {
      const diagnostic = await forensicEngine.runFullDiagnostic();
      vscode.window.showInformationMessage(
        `Forensic report ready: ${diagnostic.summary}`
      );
    }),
    
    vscode.commands.registerCommand('vizual-x.generateCodeFromNL', async () => {
      const nlInput = await vscode.window.showInputBox({
        placeHolder: 'Describe the code you want to generate...',
        prompt: 'Natural Language Code Generation'
      });
      
      if (nlInput) {
        const generatedCode = await nlCodeGenerator.generateFromNL(nlInput);
        monacoEditorProvider.insertCode(generatedCode);
      }
    }),
    
    vscode.commands.registerCommand('vizual-x.startSandboxIteration', async () => {
      const result = await sandboxLayer.startIteration();
      vscode.window.showInformationMessage(`Sandbox iteration started: ${result}`);
    })
  ];

  commands.forEach(cmd => context.subscriptions.push(cmd));
}

function registerUIProviders() {
  // Monaco Editor View Provider
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(
      'monacoEditor',
      monacoEditorProvider
    )
  );

  // Multi-Agent Orchestration View Provider
  // Forensic Diagnostics View Provider
  // LLM Providers View Provider
  // (Additional providers registered via view containers)
}

async function autoStartOrchestration() {
  const config = vscode.workspace.getConfiguration('vizual-x');
  const enableAutoStart = config.get('enableAutoOrchestration', true);
  
  if (enableAutoStart) {
    await multiAgentOrchestrator.startOrchestration();
    console.log('🤖 Auto-started multi-agent orchestration');
  }
}

export function deactivate() {
  console.log('🛑 Vizual-X Enterprise Editor Extension deactivating...');
}
