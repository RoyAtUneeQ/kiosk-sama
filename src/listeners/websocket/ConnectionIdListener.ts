import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class ConnectionIdListener implements WebSocketEventListener {
  eventType = WebSocketEventType.CONNECTION_ID;
  execute(data: any, session: SessionContextType): void {
    session.actions.setConnectionId(data.connectionId);
  }
}