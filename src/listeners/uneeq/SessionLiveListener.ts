import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { EventType } from '@/types';
import { MessageFactory } from '@/factories/MessageFactory';
import { useTranslation } from 'react-i18next';
/**
 * Handle the SessionLive event.
 */
export class SessionLiveListener implements UneeqEventListener {
  eventType = EventType.SessionLive;
  execute(_data: any, session: SessionContextType): void {
    const { t } = useTranslation();
    console.log('[SessionLiveListener] SessionLive');
    session.actions.addMessageToHistory(MessageFactory.createAssistantMessage(t('welcome.prompt')));
  }
}