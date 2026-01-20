import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { Message } from '@/types/transport/Message';
import { MessageSender } from '@/types/transport/MessageSender';
import { PeerCardMessageListener } from './PeerCardMessageListener';
import { MessageFactory } from '@/factories';
import { WebSocketEventFactory } from '@/factories/WebSocketEventFactory';

export class PeerMessageListener implements WebSocketEventListener {
  eventType = WebSocketEventType.PEER_MESSAGE;

  private static removeUneeqCustomEventTag(content: string): string {
    // Match <uneeq:custom_event name="..." /> with any name value
    const uneeqCustomEventRegex = /<uneeq:custom_event\s+name="[^"]*"\s*\/?>/gi;
    return content.replace(uneeqCustomEventRegex, '').trim();
  }

  execute(payload: any, session: SessionContextType): void {
    console.log(`[PeerMessageListener] received message from WebSocket event:`, payload);
    
    // Check if this is a history sync message
    if (payload.data?.type === 'historySync') {
      console.log('[PeerMessageListener] Routing to HistorySyncListener');
      const listener = WebSocketEventFactory(WebSocketEventType.HISTORY_SYNC);
      if (listener) {
        listener.execute(payload, session);
      }
      return;
    }
    
    // Route card messages to the dedicated card message listener
    if (PeerCardMessageListener.execute(payload, session)) {
      // Card message was handled, don't add to history
      return;
    }
    
    // Regular message - add to history
    const message = payload.data as Message;
    
    // Remove uneeq custom event tags from message content
    const cleanedContent = PeerMessageListener.removeUneeqCustomEventTag(message.content);
    
    // Preserve the original sender from the message (don't force it to be a user message)
    const messageToAdd = MessageFactory.fromRawData({
      ...message,
      content: cleanedContent
    });
    
    session.actions.addMessageToHistory(messageToAdd);
    
    // If it's an assistant message, stop showing the loader
    if (message.sender === MessageSender.Assistant) {
      session.actions.setAwaitingPromptResponse(false);
    }
  }
}


