/**
 * Function signature for WebSocket event handlers.
 *
 * @param payload - The event payload. For '*' wildcard handlers, the shape is `{ type: string, payload: any }`.
 */
export type EventHandler = (payload: any) => void;

/**
 * Reconnection and timing options forwarded to the underlying ReconnectingWebSocket.
 */
export interface WebSocketServiceOptions {
  /** Maximum backoff delay between reconnection attempts (ms). */
  maxReconnectionDelay?: number;
  /** Minimum backoff delay between reconnection attempts (ms). */
  minReconnectionDelay?: number;
  /** Multiplicative factor to grow backoff delay. */
  reconnectionDelayGrowFactor?: number;
  /** Connection timeout in milliseconds. */
  connectionTimeout?: number;
  /** Maximum number of reconnection retries. Use `Infinity` for unlimited. */
  maxRetries?: number;
}

/**
 * Standard message shape sent over the WebSocket.
 */
export interface WebSocketMessage {
  /** Application-level message type. */
  type: string;
  /** Optional message payload. */
  payload?: any;
}
