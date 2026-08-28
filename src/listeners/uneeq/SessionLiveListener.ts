import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { MessageFactory } from '@/factories';
import i18n from '@/i18n/index';
import { EventType } from '@/types';

export class SessionLiveListener implements UneeqEventListener {
  eventType = EventType.SessionLive;
  private hasIntroduced = false;

  execute(_data: any, session: SessionContextType): void {
    if (this.hasIntroduced) return;
    this.hasIntroduced = true;
    // Goes through history so it reaches the agent by the same path as any other
    // turn; chatPrompt would send it to the persona's own NLP instead.
    session.actions.addMessageToHistory(
      MessageFactory.createUserMessage(i18n.t('welcome.prompt'))
    );
  }
}
