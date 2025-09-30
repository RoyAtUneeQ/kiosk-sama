import { EventType } from '@/types';
import { MessageFactory } from '@/factories';
import type { UneeqEventListener } from '@/types';
import type { SessionContextType } from '@/contexts';

export class PromptResultListener implements UneeqEventListener {
  eventType = EventType.PromptResult;

  execute(data: any, session: SessionContextType): void {
    console.log('PromptResultListener');
    console.dir(data);

    // set awaiting prompt response to false after 300ms to wait speech starts
    setTimeout(() => {
      session.actions.setAwaitingPromptResponse(false);
    }, 1300);
    
    session.actions.addMessageToHistory(
      MessageFactory.createAssistantMessage(
        data.promptResult.response.text,
        data.promptResult.request.requestId
      )
    );
  }
}