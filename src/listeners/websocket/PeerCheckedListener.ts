import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PeerCheckedListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_CHECKED;
  /**
   * Log the peer check event for diagnostics.
   */
  execute(data: any, _: SessionContextType): void {
    console.log(`PeerChecked ${data.Origin} ${data.Destination}`);
  }
}


