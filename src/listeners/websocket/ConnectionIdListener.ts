import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class ConnectionIdListener implements WebSocketEventListener {
  eventType = WebSocketEventType.CONNECTION_ID;
  /**
   * Cache the received connectionId in session state.
   */
  execute(data: any, session: SessionContextType): void {
    console.info('ConnectionIdListener', data);
    console.info(session);
    session.actions.setConnectionId(data.connectionId);
  }
}


