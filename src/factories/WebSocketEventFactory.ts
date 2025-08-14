import type { WebSocketEventListener } from '@/listeners/types/WebsocketEventListener';
import type { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import * as listeners from '@/listeners/websocket'; 

const wsEventRegistry = new Map<WebSocketEventType, WebSocketEventListener>();

/**
 * Register a WebSocket listener class by instantiating and indexing by its `eventType`.
 */
export function registerWebSocketListener<T extends WebSocketEventListener>(EventClass: new () => T) {
  const instance = new EventClass();
  wsEventRegistry.set(instance.eventType, instance);
}

// Auto-register all listeners exported from listeners/websocket
Object.values(listeners).forEach((ListenerClass: any) => {
  try {
    console.log('registering websocket listener', ListenerClass.name);
    registerWebSocketListener(ListenerClass as any);
  } catch {}
});

/**
 * Resolve a listener instance for a WebSocket event type, or null if not registered.
 */
export const WebSocketEventFactory = (type: WebSocketEventType): WebSocketEventListener | null => {
  if (!type) return null;
  const listener = wsEventRegistry.get(type);
  if (listener) return listener;
  console.warn(`No WebSocket handler found for type: ${type}`);
  return null;
};


