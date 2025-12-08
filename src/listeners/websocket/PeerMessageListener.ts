import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { Message } from '@/types/transport/Message';
import { PeerCardMessageListener } from './PeerCardMessageListener';

export class PeerMessageListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_MESSAGE;
  
  /**
   * Handle peer messages. Routes card messages to PeerCardMessageListener,
   * and regular messages are added to message history.
   */
  execute(payload: any, session: SessionContextType): void {
    console.log(`[PeerMessageListener] received message from WebSocket event:`, payload);
    
    // Route card messages to the dedicated card message listener
    if (PeerCardMessageListener.execute(payload, session)) {
      // Card message was handled, don't add to history
      return;
    }
    
    // Regular message - add to history
    session.actions.addMessageToHistory(payload.data as Message);
  }
}


