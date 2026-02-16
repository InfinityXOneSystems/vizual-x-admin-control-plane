import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';

interface EditorMessage {
  type: string;
  fileId?: string;
  content?: string;
  userId?: string;
  line?: number;
  column?: number;
  issues?: any[];
  timestamp?: number;
}

interface ClientMetadata {
  id: string;
  userId?: string;
  activeFile?: string;
  joinedAt: Date;
}

/**
 * WebSocketServer: Manages real-time synchronization for Monaco Editor
 * Handles file updates, cursor positions, linting results, and collaborative editing
 */
export class EditorWebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private clients: Map<WebSocket, ClientMetadata> = new Map();
  private fileSubscribers: Map<string, Set<WebSocket>> = new Map();
  private messageHistory: EditorMessage[] = [];
  private maxHistorySize: number = 1000;

  constructor(httpServer: HTTPServer) {
    super();
    this.wss = new WebSocket.Server({ 
      server: httpServer,
      path: '/editor-sync'
    });
    this.setupHandlers();
    console.log('[WebSocketServer] Initialized on /editor-sync');
  }

  private setupHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      const metadata: ClientMetadata = {
        id: clientId,
        joinedAt: new Date()
      };

      this.clients.set(ws, metadata);
      console.log(`[WebSocketServer] New client connected: ${clientId}. Total: ${this.clients.size}`);

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connect',
        clientId: clientId,
        timestamp: Date.now()
      });

      ws.on('message', (data: string) => {
        this.handleMessage(data, ws, metadata);
      });

      ws.on('close', () => {
        this.handleClientDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocketServer] Client error [${clientId}]:`, error.message);
      });

      ws.on('pong', () => {
        // Keep-alive mechanism
      });
    });

    // Keep-alive ping every 30 seconds
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        (ws as any).isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private handleMessage(rawData: string, sender: WebSocket, metadata: ClientMetadata) {
    try {
      const message: EditorMessage = JSON.parse(rawData);
      message.timestamp = Date.now();
      this.addToHistory(message);

      console.log(`[WebSocketServer] Message from ${metadata.id}:`, message.type);

      switch (message.type) {
        case 'file-update':
          this.handleFileUpdate(message, sender, metadata);
          break;

        case 'subscribe-file':
          this.handleSubscribeToFile(message.fileId!, sender);
          break;

        case 'unsubscribe-file':
          this.handleUnsubscribeFromFile(message.fileId!, sender);
          break;

        case 'cursor-position':
          this.handleCursorPosition(message, sender, metadata);
          break;

        case 'selection-change':
          this.handleSelectionChange(message, sender, metadata);
          break;

        case 'lint-result':
          this.handleLintResult(message, sender);
          break;

        case 'format-complete':
          this.handleFormatComplete(message, sender);
          break;

        case 'user-info':
          metadata.userId = message.userId;
          this.broadcastUserStatus(metadata, 'online');
          break;

        case 'heartbeat':
          this.sendToClient(sender, { type: 'heartbeat-ack', timestamp: Date.now() });
          break;

        default:
          console.warn(`[WebSocketServer] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('[WebSocketServer] Message parsing error:', error);
      this.sendErrorToClient(sender, 'Invalid message format');
    }
  }

  private handleFileUpdate(message: EditorMessage, sender: WebSocket, metadata: ClientMetadata) {
    if (!message.fileId || !message.content) {
      this.sendErrorToClient(sender, 'Missing fileId or content');
      return;
    }

    // Broadcast to all subscribers except sender
    this.broadcastToFileSubscribers(message.fileId, {
      type: 'file-updated',
      fileId: message.fileId,
      content: message.content,
      userId: metadata.userId,
      timestamp: message.timestamp
    }, sender);

    metadata.activeFile = message.fileId;
  }

  private handleSubscribeToFile(fileId: string, ws: WebSocket) {
    if (!this.fileSubscribers.has(fileId)) {
      this.fileSubscribers.set(fileId, new Set());
    }
    this.fileSubscribers.get(fileId)!.add(ws);
    console.log(`[WebSocketServer] Client subscribed to file: ${fileId}`);

    this.sendToClient(ws, {
      type: 'subscription-confirmed',
      fileId: fileId,
      timestamp: Date.now()
    });
  }

  private handleUnsubscribeFromFile(fileId: string, ws: WebSocket) {
    const subscribers = this.fileSubscribers.get(fileId);
    if (subscribers) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.fileSubscribers.delete(fileId);
      }
    }
    console.log(`[WebSocketServer] Client unsubscribed from file: ${fileId}`);
  }

  private handleCursorPosition(message: EditorMessage, sender: WebSocket, metadata: ClientMetadata) {
    const fileId = metadata.activeFile;
    if (!fileId) return;

    this.broadcastToFileSubscribers(fileId, {
      type: 'cursor-moved',
      userId: metadata.userId,
      line: message.line,
      column: message.column,
      timestamp: message.timestamp
    }, sender);
  }

  private handleSelectionChange(message: EditorMessage, sender: WebSocket, metadata: ClientMetadata) {
    const fileId = metadata.activeFile;
    if (!fileId) return;

    this.broadcastToFileSubscribers(fileId, {
      type: 'selection-changed',
      userId: metadata.userId,
      ...message,
      timestamp: message.timestamp
    }, sender);
  }

  private handleLintResult(message: EditorMessage, sender: WebSocket) {
    if (!message.fileId) return;

    this.broadcastToFileSubscribers(message.fileId, {
      type: 'lint-issues',
      fileId: message.fileId,
      issues: message.issues || [],
      timestamp: message.timestamp
    }, sender);
  }

  private handleFormatComplete(message: EditorMessage, sender: WebSocket) {
    if (!message.fileId || !message.content) return;

    this.broadcastToFileSubscribers(message.fileId, {
      type: 'format-complete',
      fileId: message.fileId,
      content: message.content,
      timestamp: message.timestamp
    }, sender);
  }

  private handleClientDisconnect(ws: WebSocket) {
    const metadata = this.clients.get(ws);
    if (metadata) {
      this.clients.delete(ws);
      this.broadcastUserStatus(metadata, 'offline');

      // Clean up file subscriptions
      this.fileSubscribers.forEach((subscribers) => {
        subscribers.delete(ws);
      });

      console.log(`[WebSocketServer] Client disconnected: ${metadata.id}. Total: ${this.clients.size}`);
    }
  }

  private broadcastToFileSubscribers(fileId: string, message: any, excludeSender?: WebSocket) {
    const subscribers = this.fileSubscribers.get(fileId);
    if (!subscribers) return;

    subscribers.forEach(client => {
      if (client !== excludeSender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private broadcastUserStatus(metadata: ClientMetadata, status: 'online' | 'offline') {
    this.broadcast({
      type: 'user-status',
      userId: metadata.userId,
      status: status,
      timestamp: Date.now()
    });
  }

  private broadcast(message: any, excludeSender?: WebSocket) {
    this.wss.clients.forEach((client: WebSocket) => {
      if (client !== excludeSender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private sendToClient(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendErrorToClient(ws: WebSocket, error: string) {
    this.sendToClient(ws, {
      type: 'error',
      message: error,
      timestamp: Date.now()
    });
  }

  private addToHistory(message: EditorMessage) {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getFileSubscriberCount(fileId: string): number {
    return this.fileSubscribers.get(fileId)?.size || 0;
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      subscribedFiles: this.fileSubscribers.size,
      messageHistorySize: this.messageHistory.length
    };
  }

  close() {
    this.wss.close();
    console.log('[WebSocketServer] Closed');
  }
}
