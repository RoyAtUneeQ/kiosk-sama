import ReconnectingWebSocket from 'reconnecting-websocket';
import type {
  EventHandler,
  WebSocketServiceOptions,
  WebSocketMessage,
  PendingMessage,
  ConnectionHealth
} from '../types/WebSocketServiceTypes';

export class WebSocketService {
  private ws: ReconnectingWebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private url: string | null = null;
  private sendBuffer: WebSocketMessage[] = [];
  private options: WebSocketServiceOptions;
  private pendingMessages: Map<string, PendingMessage> = new Map();
  private messageRetryTimer: NodeJS.Timeout | null = null;
  private readonly MESSAGE_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds
  
  // Keepalive properties
  private keepaliveTimer: NodeJS.Timeout | null = null;
  private keepaliveInterval: number;
  private pongTimeout: number;
  private lastPingSent: number | null = null;
  private lastPongReceived: number | null = null;
  private pongTimeoutTimer: NodeJS.Timeout | null = null;
  private pingsSent: number = 0;
  private pongsReceived: number = 0;
  private pongSupportDetected: boolean = false; // Track if backend supports pong
  private readonly PONG_DETECTION_THRESHOLD = 3; // Stop warning after 3 pings without pong

  constructor(options: WebSocketServiceOptions = {}) {
    this.options = {
      maxReconnectionDelay: 8000,
      minReconnectionDelay: 500,
      reconnectionDelayGrowFactor: 1.5,
      connectionTimeout: 5000,
      maxRetries: Infinity,
      ...options
    };
    this.keepaliveInterval = options.keepaliveInterval ?? 45000; // 45 seconds default
    this.pongTimeout = options.pongTimeout ?? 15000; // 15 seconds default
    this.startMessageRetryTimer();
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
      // Connection already open - ensure keepalive is running
      if (!this.keepaliveTimer) {
        this.startKeepalive();
      }
      return Promise.resolve();
    }

    try {
      this.close();
      this.url = url;

      this.ws = new ReconnectingWebSocket(url, [], this.options);
      this.setupEventListeners();
      // Keepalive will start when 'open' event fires
    } catch (error) {
      this.handleError('connect', error);
      throw new Error(`WebSocket connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public send(message: WebSocketMessage, requiresAck: boolean = false): string | void {
    const messageId = requiresAck ? this.generateMessageId() : undefined;
    const wrappedMessage = {
      ...message,
      messageId,
      requiresAck,
      timestamp: Date.now()
    };

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log(`[WebSocketService] Connection not ready, buffering message`, { messageId, type: message.type });
      this.sendBuffer.push(wrappedMessage);
      if (requiresAck && messageId) {
        this.trackPendingMessage(messageId, wrappedMessage);
      }
      return messageId;
    }

    try {
      this.ws.send(JSON.stringify(wrappedMessage));
      console.log(`[WebSocketService] Message sent`, { messageId, type: message.type, requiresAck });
      
      if (requiresAck && messageId) {
        this.trackPendingMessage(messageId, wrappedMessage);
      }
      return messageId;
    } catch (error) {
      this.handleError('send', error);
      if (requiresAck && messageId) {
        this.trackPendingMessage(messageId, wrappedMessage);
      }
      return messageId;
    }
  }

  public close(): void {
    try {
      this.stopKeepalive();
      if (this.messageRetryTimer) {
        clearInterval(this.messageRetryTimer);
        this.messageRetryTimer = null;
      }
      this.ws?.close();
    } catch (error) {
      this.handleError('close', error);
    }
    
    this.ws = null;
    this.url = null;
    this.sendBuffer = [];
    this.pendingMessages.clear();
  }

  public acknowledgeMessage(messageId: string): void {
    const pending = this.pendingMessages.get(messageId);
    if (pending) {
      console.log(`[WebSocketService] ✅ Message acknowledged`, { messageId, type: pending.message.type });
      this.pendingMessages.delete(messageId);
    }
  }

  public getPendingMessagesCount(): number {
    return this.pendingMessages.size;
  }

  public getConnectionHealth(): ConnectionHealth {
    const now = Date.now();
    // If backend doesn't support pong, consider healthy if connection is open and pings are being sent
    const isHealthy = this.pongSupportDetected
      ? (this.lastPongReceived !== null && (now - this.lastPongReceived) < (this.keepaliveInterval + this.pongTimeout))
      : (this.ws?.readyState === WebSocket.OPEN && this.pingsSent > 0);
    
    return {
      lastPing: this.lastPingSent,
      lastPong: this.lastPongReceived,
      isHealthy,
      pingsSent: this.pingsSent,
      pongsReceived: this.pongsReceived
    };
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', () => {
      this.emit('open', {});
      this.flushSendBuffer();
      // Start keepalive when connection is actually open
      this.startKeepalive();
    });

    this.ws.addEventListener('message', (event) => {
      this.handleMessage(event);
    });

    this.ws.addEventListener('error', (error) => {
      this.emit('error', error);
    });

    this.ws.addEventListener('close', () => {
      this.stopKeepalive(); // Stop keepalive when connection closes
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
      
      // Handle acknowledgments
      if (payload?.type === 'ack' && payload?.messageId) {
        this.acknowledgeMessage(payload.messageId);
      }
      
      // Handle pong responses
      if (payload?.type === 'pong') {
        this.handlePong();
      }
      
      // Send acknowledgment if message requires it
      if (payload?.requiresAck && payload?.messageId) {
        this.sendAck(payload.messageId);
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

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackPendingMessage(messageId: string, message: WebSocketMessage): void {
    this.pendingMessages.set(messageId, {
      message,
      sentAt: Date.now(),
      retryCount: 0,
      lastRetryAt: Date.now()
    });
  }

  private sendAck(messageId: string): void {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'ack',
          messageId,
          timestamp: Date.now()
        }));
        console.log(`[WebSocketService] Sent ACK for message`, { messageId });
      }
    } catch (error) {
      this.handleError('sendAck', error);
    }
  }

  private startMessageRetryTimer(): void {
    this.messageRetryTimer = setInterval(() => {
      this.checkAndRetryMessages();
    }, this.RETRY_DELAY);
  }

  private checkAndRetryMessages(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const now = Date.now();
    const messagesToRetry: string[] = [];
    const messagesToRemove: string[] = [];

    this.pendingMessages.forEach((pending, messageId) => {
      const timeSinceLastRetry = now - pending.lastRetryAt;
      const timeSinceSent = now - pending.sentAt;

      // Remove if message has timed out completely
      if (timeSinceSent > this.MESSAGE_TIMEOUT) {
        console.warn(`[WebSocketService] ⏱️ Message timeout`, { 
          messageId, 
          type: pending.message.type,
          timeSinceSent: `${(timeSinceSent / 1000).toFixed(1)}s`
        });
        messagesToRemove.push(messageId);
        this.emit('message-timeout', { messageId, message: pending.message });
        return;
      }

      // Remove if max retries exceeded
      if (pending.retryCount >= this.MAX_RETRIES) {
        console.warn(`[WebSocketService] ❌ Max retries exceeded`, { 
          messageId, 
          type: pending.message.type,
          retryCount: pending.retryCount 
        });
        messagesToRemove.push(messageId);
        this.emit('message-failed', { messageId, message: pending.message });
        return;
      }

      // Retry if enough time has passed
      if (timeSinceLastRetry >= this.RETRY_DELAY) {
        messagesToRetry.push(messageId);
      }
    });

    // Remove failed/timed out messages
    messagesToRemove.forEach(id => this.pendingMessages.delete(id));

    // Retry pending messages
    messagesToRetry.forEach(messageId => {
      const pending = this.pendingMessages.get(messageId);
      if (pending) {
        console.log(`[WebSocketService] 🔄 Retrying message`, { 
          messageId, 
          type: pending.message.type,
          retryCount: pending.retryCount + 1,
          maxRetries: this.MAX_RETRIES
        });
        
        try {
          this.ws!.send(JSON.stringify(pending.message));
          pending.retryCount++;
          pending.lastRetryAt = now;
        } catch (error) {
          this.handleError('retryMessage', error);
        }
      }
    });
  }

  private startKeepalive(): void {
    this.stopKeepalive(); // Ensure no duplicate timers
    
    if (!this.ws) return;
    
    console.log(`[WebSocketService] 💓 Starting keepalive (interval: ${this.keepaliveInterval}ms)`);
    
    // Send initial ping immediately
    this.sendPing();
    
    // Set up recurring ping timer
    this.keepaliveTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendPing();
      } else {
        console.warn('[WebSocketService] ⚠️ Skipping ping - connection not open');
      }
    }, this.keepaliveInterval);
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
      console.log('[WebSocketService] 🛑 Stopped keepalive');
    }
    
    if (this.pongTimeoutTimer) {
      clearTimeout(this.pongTimeoutTimer);
      this.pongTimeoutTimer = null;
    }
  }

  private sendPing(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketService] ⚠️ Cannot send ping - connection not open');
      return;
    }

    try {
      const pingMessage = {
        type: 'ping',
        timestamp: Date.now()
      };
      
      this.ws.send(JSON.stringify(pingMessage));
      this.lastPingSent = Date.now();
      this.pingsSent++;
      
      // Only log ping count occasionally to reduce noise
      if (this.pingsSent % 10 === 0 || this.pingsSent <= 3) {
        console.log(`[WebSocketService] 💓 Ping sent (${this.pingsSent} total${this.pongSupportDetected ? ', pong supported' : ', pong not supported'})`);
      }
      
      // Set timeout to check if pong is received (only if we haven't determined lack of support)
      this.checkPongTimeout();
    } catch (error) {
      this.handleError('sendPing', error);
    }
  }

  private handlePong(): void {
    this.lastPongReceived = Date.now();
    this.pongsReceived++;
    this.pongSupportDetected = true; // Backend supports pong
    
    if (this.pongTimeoutTimer) {
      clearTimeout(this.pongTimeoutTimer);
      this.pongTimeoutTimer = null;
    }
    
    const timeSincePing = this.lastPingSent 
      ? this.lastPongReceived - this.lastPingSent 
      : null;
    
    console.log(`[WebSocketService] ✅ Pong received (${this.pongsReceived} total${timeSincePing ? `, RTT: ${timeSincePing}ms` : ''})`);
  }

  private checkPongTimeout(): void {
    // If we've already determined backend doesn't support pong, skip timeout checks
    if (!this.pongSupportDetected && this.pingsSent > this.PONG_DETECTION_THRESHOLD && this.pongsReceived === 0) {
      this.pongSupportDetected = false; // Backend doesn't support pong
      console.log(`[WebSocketService] ℹ️ Backend doesn't support pong responses - pings will keep connection alive at API Gateway level`);
      if (this.pongTimeoutTimer) {
        clearTimeout(this.pongTimeoutTimer);
        this.pongTimeoutTimer = null;
      }
      return;
    }
    
    // Only check for pong timeout if backend supports it
    if (!this.pongSupportDetected) {
      // Clear any existing timeout
      if (this.pongTimeoutTimer) {
        clearTimeout(this.pongTimeoutTimer);
      }
      
      // Set new timeout to check if pong arrives (only for first few pings)
      this.pongTimeoutTimer = setTimeout(() => {
        if (this.lastPongReceived === null || 
            (this.lastPingSent && this.lastPingSent > this.lastPongReceived)) {
          const timeSincePing = this.lastPingSent 
            ? Date.now() - this.lastPingSent 
            : null;
          
          // Only warn if we haven't detected lack of pong support yet
          if (this.pingsSent <= this.PONG_DETECTION_THRESHOLD) {
            console.warn(`[WebSocketService] ⚠️ Pong timeout (${timeSincePing ? `${timeSincePing}ms` : 'unknown'} since ping) - backend may not support pong`);
            this.emit('connection-unhealthy', {
              lastPing: this.lastPingSent,
              lastPong: this.lastPongReceived,
              timeSincePing
            });
          }
        }
      }, this.pongTimeout);
    }
  }
}

export default WebSocketService;


