import { EventType } from '@/types';
import { SessionStatus } from '@/contexts/types';
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';

export class DigitalHumanUnmutedListener implements UneeqEventListener {
  eventType = EventType.DigitalHumanUnmuted;
  execute(_: any, session: SessionContextType): void {
    console.log('[DigitalHumanUnmutedListener] Avatar unmuted - Setting status to LIVE');
    session.actions.setSessionStatus(SessionStatus.LIVE);
  }
}