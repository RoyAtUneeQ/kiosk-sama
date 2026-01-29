import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PingListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PING;
  execute(data: any, _: SessionContextType): void {
    // Ping received
  }
}
