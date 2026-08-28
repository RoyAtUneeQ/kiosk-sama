import { EventType } from '@/types';
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { MessageFactory } from '@/factories';

/**
 * AvatarAnswerContentListener
 * 
 * Listens for AvatarAnswerContent events from Uneeq, which contain the avatar's
 * actual spoken text content (including welcome messages and all responses).
 * 
 * This is the PRIMARY listener for capturing assistant messages to history.
 */
export class AvatarAnswerContentListener implements UneeqEventListener {
  eventType = EventType.AvatarAnswerContent;
  
  execute(data: any, session: SessionContextType): void {
    
    // Extract the avatar's spoken content
    // Try multiple possible property paths for robustness
    const answerText = data?.answerText || data?.text || data?.content || data?.answer || '';
    
    if (answerText && answerText.trim()) {
      // Add assistant message to history
      session.actions.addMessageToHistory(
        MessageFactory.createAssistantMessage(answerText)
      );
      
    } else {
      console.warn('[AvatarAnswerContentListener] ⚠️ No text content found in AvatarAnswerContent:', data);
      console.warn('[AvatarAnswerContentListener] ⚠️ Available properties:', Object.keys(data || {}));
    }
  }
}
