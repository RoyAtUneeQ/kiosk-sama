import ReconnectingWebSocket from 'reconnecting-websocket';
import type {
  EventHandler,
  WebSocketServiceOptions,
  WebSocketMessage
} from '../types/WebSocketServiceTypes';

export class WebSocketService {
  private ws: ReconnectingWebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private url: string | null = null;
  private sendBuffer: WebSocketMessage[] = [];
  private options: WebSocketServiceOptions;

  constructor(options: WebSocketServiceOptions = {}) {
    this.options = {
      maxReconnectionDelay: 8000,
      minReconnectionDelay: 500,
      reconnectionDelayGrowFactor: 1.5,
      connectionTimeout: 5000,
      maxRetries: Infinity,
      ...options
    };
  }

  public on(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  public off(type: string, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  public async connect(url: string): Promise<void> {
    if (this.ws && this.url === url && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    try {
      this.close();
      this.url = url;

      this.ws = new ReconnectingWebSocket(url, [], this.options);
      this.setupEventListeners();
    } catch (error) {
      this.handleError('connect', error);
      throw new Error(`WebSocket connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.sendBuffer.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      this.handleError('send', error);
    }
  }

  public close(): void {
    try {
      this.ws?.close();
    } catch (error) {
      this.handleError('close', error);
    }
    
    this.ws = null;
    this.url = null;
    this.sendBuffer = [];
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', () => {
      this.emit('open', {});
      this.flushSendBuffer();
    });

    this.ws.addEventListener('message', (event) => {
      this.handleMessage(event);
    });

    this.ws.addEventListener('error', (error) => {
      this.emit('error', error);
    });

    this.ws.addEventListener('close', () => {
      this.emit('close', {});
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      let payload: any = event.data;
      try {
        payload = JSON.parse(event.data);
      } catch {
        // Keep original data if not JSON
      }
      
      const type = payload?.type || 'message';
      this.emit(type, payload);
    } catch (error) {
      this.handleError('handleMessage', error);
    }
  }

  private flushSendBuffer(): void {
    if (this.sendBuffer.length === 0) return;

    const pending = [...this.sendBuffer];
    this.sendBuffer.length = 0;
    
    pending.forEach((message) => {
      try {
        this.ws?.send(JSON.stringify(message));
      } catch (error) {
        this.handleError('flushSendBuffer', error);
        this.sendBuffer.push(message);
      }
    });
  }

  private emit(type: string, payload: any): void {
    this.handlers.get(type)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        this.handleError(`emit:${type}`, error);
      }
    });

    this.handlers.get('*')?.forEach((handler) => {
      try {
        handler({ type, payload });
      } catch (error) {
        this.handleError('emit:*', error);
      }
    });
  }

  private handleError(method: string, error: unknown): void {
    console.error(`[WebSocketService] ${method} failed:`, error);
  }
}

export default WebSocketService;


