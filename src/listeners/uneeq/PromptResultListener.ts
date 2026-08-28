import { EventType } from '@/types';
import type { UneeqEventListener } from '@/types';
import type { SessionContextType } from '@/contexts';
import { MessageFactory } from '@/factories';

export class PromptResultListener implements UneeqEventListener {
  eventType = EventType.PromptResult;

  execute(data: any, session: SessionContextType): void {
    const answerText = data?.response?.text || '';

    if (answerText && answerText.trim()) {
      session.actions.addMessageToHistory(
        MessageFactory.createAssistantMessage(answerText)
      );
    }
  }
}