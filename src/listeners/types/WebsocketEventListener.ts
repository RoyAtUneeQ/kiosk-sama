import type { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { SessionContextType } from '@/contexts/SessionContext';

/**
 * Contract implemented by concrete WebSocket event listeners.
 */
export interface WebSocketEventListener {
  /** WebSocket event type handled by this listener. */
  eventType: WebSocketEventType;
  /**
   * Execute the listener logic for the given event payload.
   * @param data - Incoming WebSocket message payload
   * @param session - Current session context
   */
  execute: (data: any, session: SessionContextType) => void;
}
