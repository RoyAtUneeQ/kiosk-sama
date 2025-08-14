import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class RegisterRemoteListener implements WebSocketEventListener {
  eventType = WebSocketEventType.REGISTER_REMOTE;
  /**
   * Store remote info received from backend after successful registration.
   */
  execute(data: any, session: SessionContextType): void {
    session.actions.setRemoteInfo(data.remoteInfo);
  }
}     


