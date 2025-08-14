import { EventType, MessageSender } from '@/types';
import type { UneeqEventListener } from '@/types';
import type { SessionContextType } from '@/contexts';

export class PromptResultListener implements UneeqEventListener {
  eventType = EventType.PromptResult;

  execute(data: any, session: SessionContextType): void {
    session.actions.setAwaitingPromptResponse(false);
    console.log('PromptResultListener', data);
    session.actions.addMessageToHistory({
      id: crypto.randomUUID(),
      content: data.promptResult.response.text,
      sender: MessageSender.Assistant,
      timestamp: new Date()
    });
  }
}