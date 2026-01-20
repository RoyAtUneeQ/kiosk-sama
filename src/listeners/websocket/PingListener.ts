import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PingListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PING;
  execute(data: any, _: SessionContextType): void {
    // Log ping received (server echo or peer ping)
    console.log('[PingListener] 💓 Ping received, connection alive', { timestamp: data?.timestamp });
  }
}
