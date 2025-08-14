import ReconnectingWebSocket from 'reconnecting-websocket';
import type {
  EventHandler,
  WebSocketServiceOptions,
  WebSocketMessage
} from './types/WebSocketServiceTypes';

/**
 * WebSocket service for managing backend connections.
 * Handles reconnection, message buffering, and event management.
 *
 * @example
 * const ws = new WebSocketService();
 * ws.on('open', () => console.log('opened'));
 * ws.on('*', ({ type, payload }) => console.log(type, payload));
 * await ws.connect('wss://example.com/socket');
 * ws.send({ type: 'ping' });
 */
export class WebSocketService {
  private ws: ReconnectingWebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private url: string | null = null;
  private sendBuffer: WebSocketMessage[] = [];
  private options: WebSocketServiceOptions;

  /**
   * Create a new WebSocket service with reconnection options.
   *
   * @param options - Reconnection and timing settings.
   */
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

  /**
   * Subscribe to WebSocket events.
   *
   * @param type - Event type or '*' for wildcard.
   * @param handler - Callback to invoke.
   * @returns Unsubscribe function.
   */
  public on(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  /**
   * Unsubscribe from WebSocket events.
   */
  public off(type: string, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  /**
   * Connect to WebSocket URL.
   *
   * @param url - WebSocket endpoint.
   * @throws If the connection could not be created.
   */
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

  /**
   * Send message through WebSocket.
   * Buffers messages until the socket is open.
   *
   * @param message - Message to serialize and send.
   */
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

  /**
   * Close WebSocket connection and clear buffers.
   */
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

  /**
   * Attach core WebSocket event listeners.
   */
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

  /**
   * Safely parse and dispatch incoming messages.
   */
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

  /**
   * Attempt to send any buffered messages.
   */
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

  /**
   * Invoke registered handlers for a given event type and wildcard handlers.
   */
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

  /**
   * Log errors with method context.
   */
  private handleError(method: string, error: unknown): void {
    console.error(`[WebSocketService] ${method} failed:`, error);
  }
}

export default WebSocketService;


