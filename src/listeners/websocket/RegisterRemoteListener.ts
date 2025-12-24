import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class RegisterRemoteListener implements WebSocketEventListener {
  eventType = WebSocketEventType.REGISTER_REMOTE;
  execute(data: any, session: SessionContextType): void {
    console.log("[RegisterRemoteListener] 🎤 Disabling VAD for remote session");
    session.actions.setVadEnabled(false);
    session.actions.setRemoteInfo(data.remoteInfo);
    console.log("[RegisterRemoteListener] ✅ VAD disabled, remote info set");
  }
}     


