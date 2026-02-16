import * as vscode from 'vscode';

export class MonacoEditorProvider
  implements vscode.WebviewPanelSerializer {
  private context: vscode.ExtensionContext;
  private panel: vscode.WebviewPanel | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async initialize(): Promise<void> {
    console.log('Monaco Editor Provider initialized');
  }

  async openEditor(): Promise<void> {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'monacoEditor',
      'Vizual-X Monaco Editor',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        enableCommandUris: true,
        retainContextWhenHidden: true
      }
    );

    this.panel.webview.html = this.getWebviewContent();

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  insertCode(code: string): void {
    if (this.panel) {
      this.panel.webview.postMessage({
        command: 'insertCode',
        code: code
      });
    }
  }

  private getWebviewContent(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vizual-X Monaco Editor</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs/loader.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1e1e1e; color: #d4d4d4; }
          #editor { width: 100%; height: 100vh; }
          .monaco-welcome { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="editor"></div>
        <script>
          require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs' } });
          require(['vs/editor/editor.main'], function() {
            const editor = monaco.editor.create(document.getElementById('editor'), {
              value: '// Vizual-X Monaco Editor\\n// Start typing...\\n',
              language: 'typescript',
              theme: 'vs-dark',
              automaticLayout: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on'
            });

            window.addEventListener('message', event => {
              const message = event.data;
              if (message.command === 'insertCode') {
                const position = editor.getPosition();
                editor.executeEdits('', [{
                  range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                  text: message.code
                }]);
              }
            });
          });
        </script>
      </body>
      </html>
    `;
  }

  async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    this.panel = webviewPanel;
    webviewPanel.webview.html = this.getWebviewContent();
  }

  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
    }
  }
}
