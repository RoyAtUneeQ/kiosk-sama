import type { SessionContextType } from '@/contexts/SessionContext';
import { useSessionStore } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PeerDisconnectedListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_DISCONNECTED;
  execute(_data: any, session: SessionContextType): void {
    const { role, remoteInfo } = useSessionStore.getState().state;

    if (role === 'remote') {
      session.actions.setSessionEnded('kiosk-closed');
      return;
    }

    session.actions.setVadEnabled(true);
    if (remoteInfo) {
      session.actions.setRemoteDisconnectedAt(Date.now());
    }
    session.actions.setRemoteInfo(null);
  }
}
