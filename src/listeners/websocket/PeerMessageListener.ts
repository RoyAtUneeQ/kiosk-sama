import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { Message } from '@/types/transport/Message';

export class PeerMessageListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_MESSAGE;
  /**
   * Persist the latest peer message in session state.
   */
  execute(payload: any, session: SessionContextType): void {
    console.log(`[PeerMessageListener] received message from WebSocket event:`);
    session.actions.addMessageToHistory(payload.data as Message);
  }
}


