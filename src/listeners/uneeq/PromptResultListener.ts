import { EventType, MessageSender } from '@/types';
import type { UneeqEventListener } from '@/types';
import type { SessionContextType } from '@/contexts';

export class PromptResultListener implements UneeqEventListener {
  eventType = EventType.PromptResult;

  execute(data: any, session: SessionContextType): void {
    session.actions.setAwaitingPromptResponse(false);
    session.actions.addMessageToHistory({
      id: data.promptResult.id,
      content: data.promptResult.response.text,
      sender: MessageSender.Assistant,
      timestamp: new Date()
    });
  }
}