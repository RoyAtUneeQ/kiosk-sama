import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PeerMessageListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_MESSAGE;
  /**
   * Persist the latest peer message in session state.
   */
  execute(payload: any, session: SessionContextType): void {
    console.log('PeerMessageListener', payload);
    session.actions.addMessageToHistory(payload.data);
  }
}


