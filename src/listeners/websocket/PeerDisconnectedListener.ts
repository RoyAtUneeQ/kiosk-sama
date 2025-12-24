import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PeerDisconnectedListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_DISCONNECTED;
  execute(_data: any, session: SessionContextType): void {
    console.log("[PeerDisconnectedListener] 🎤 Re-enabling VAD after peer disconnect");
    session.actions.setVadEnabled(true);
    session.actions.setRemoteInfo(null);
    console.log("[PeerDisconnectedListener] ✅ VAD re-enabled, remote info cleared");
  }
}


