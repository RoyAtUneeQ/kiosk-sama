import type { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { SessionContextType } from '@/contexts/SessionContext';

export interface WebSocketEventListener {
  eventType: WebSocketEventType;
  execute: (data: any, session: SessionContextType) => void;
}
