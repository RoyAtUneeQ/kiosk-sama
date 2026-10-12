import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { SessionStatus } from '@/contexts/types';
import i18n from '@/i18n/index';
import { EventType } from '@/types';

export class SessionLiveListener implements UneeqEventListener {
  eventType = EventType.SessionLive;
  execute(_data: any, session: SessionContextType): void {
    session.actions.setSessionStatus(SessionStatus.LIVE);
    session.state.uneeq?.chatPrompt(i18n.t('welcome.prompt'));
  }
}