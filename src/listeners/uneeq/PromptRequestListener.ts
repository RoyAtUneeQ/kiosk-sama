import { EventType } from '@/types';
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { MessageFactory } from '@/factories';

export class PromptRequestListener implements UneeqEventListener {
  eventType = EventType.PromptRequest;
  execute(data: any, session: SessionContextType): void {
    session.actions.setAwaitingPromptResponse(true);

    const userInput = data?.prompt || data?.question || data?.text || '';

    if (userInput && userInput.trim()) {
      session.actions.addMessageToHistory(
        MessageFactory.createUserMessage(userInput)
      );
    }
  }
}   