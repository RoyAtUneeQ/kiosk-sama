import { EventType } from '@/types';
import { MessageFactory } from '@/factories';
import type { UneeqEventListener } from '@/types';
import type { SessionContextType } from '@/contexts';

export class PromptResultListener implements UneeqEventListener {
  eventType = EventType.PromptResult;

  execute(data: any, session: SessionContextType): void {
    session.actions.setAwaitingPromptResponse(false);
    console.log('PromptResultListener');
    console.dir(data);
    session.actions.addMessageToHistory(
      MessageFactory.createAssistantMessage(
        data.promptResult.response.text,
        data.promptResult.request.requestId
      )
    );
  }
}