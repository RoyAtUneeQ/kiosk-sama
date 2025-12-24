export type EventHandler = (payload: any) => void;

export interface WebSocketServiceOptions {
  maxReconnectionDelay?: number;
  minReconnectionDelay?: number;
  reconnectionDelayGrowFactor?: number;
  connectionTimeout?: number;
  maxRetries?: number;
}

export interface WebSocketMessage {
  type: string;
  payload?: any;
}
