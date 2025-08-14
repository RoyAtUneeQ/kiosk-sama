import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PeerDisconnectedListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_DISCONNECTED;
  /**
   * Clear any remote session info upon peer disconnection.
   */
  execute(_data: any, session: SessionContextType): void {
    session.actions.setRemoteInfo(null);
  }
}


