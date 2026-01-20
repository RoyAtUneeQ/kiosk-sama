import { EventType } from '@/types';
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { MessageFactory } from '@/factories';

export class PromptRequestListener implements UneeqEventListener {
  eventType = EventType.PromptRequest;
  execute(data: any, session: SessionContextType): void {
    console.log('[PromptRequestListener] PromptRequest', data);
    session.actions.setAwaitingPromptResponse(true);
    
    // Add user's spoken input to history
    // PromptRequest contains the user's input that triggered this prompt
    const userInput = data?.prompt || data?.question || data?.text || '';
    
    if (userInput && userInput.trim()) {
      console.log('[PromptRequestListener] 🗣️ Adding user message to history:', userInput);
      
      session.actions.addMessageToHistory(
        MessageFactory.createUserMessage(userInput)
      );
    } else {
      console.warn('[PromptRequestListener] ⚠️ No user input found in PromptRequest:', data);
    }
  }
}   