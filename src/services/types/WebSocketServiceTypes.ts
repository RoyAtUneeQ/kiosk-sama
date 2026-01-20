export type EventHandler = (payload: any) => void;

export interface WebSocketServiceOptions {
  maxReconnectionDelay?: number;
  minReconnectionDelay?: number;
  reconnectionDelayGrowFactor?: number;
  connectionTimeout?: number;
  maxRetries?: number;
  keepaliveInterval?: number; // milliseconds, default 45000
  pongTimeout?: number; // milliseconds, default 15000
}

export interface ConnectionHealth {
  lastPing: number | null;
  lastPong: number | null;
  isHealthy: boolean;
  pingsSent: number;
  pongsReceived: number;
}

export interface WebSocketMessage {
  type: string;
  payload?: any;
  messageId?: string;
  requiresAck?: boolean;
  timestamp?: number;
}

export interface PendingMessage {
  message: WebSocketMessage;
  sentAt: number;
  retryCount: number;
  lastRetryAt: number;
}
