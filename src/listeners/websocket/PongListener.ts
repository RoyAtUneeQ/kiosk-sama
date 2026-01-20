import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class PongListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PONG;
  execute(data: any, _: SessionContextType): void {
    console.log('[PongListener] ✅ Pong received, connection healthy', { timestamp: data?.timestamp });
  }
}
