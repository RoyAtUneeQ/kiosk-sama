import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { Message } from '@/types/transport/Message';
import { MessageSender } from '@/types/transport/MessageSender';
import { PeerCardMessageListener } from './PeerCardMessageListener';

export class PeerMessageListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_MESSAGE;
  
  /**
   * Removes uneeq custom event tags from message content.
   * Matches tags like: <uneeq:custom_event name="..." />
   */
  private static removeUneeqCustomEventTag(content: string): string {
    // Match <uneeq:custom_event name="..." /> with any name value
    const uneeqCustomEventRegex = /<uneeq:custom_event\s+name="[^"]*"\s*\/?>/gi;
    return content.replace(uneeqCustomEventRegex, '').trim();
  }
  
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
    const message = payload.data as Message;
    
    // Remove uneeq custom event tags from message content
    message.content = PeerMessageListener.removeUneeqCustomEventTag(message.content);
    
    session.actions.addMessageToHistory(message);
    
    // If it's an assistant message, stop showing the loader
    if (message.sender === MessageSender.Assistant) {
      session.actions.setAwaitingPromptResponse(false);
    }
  }
}


