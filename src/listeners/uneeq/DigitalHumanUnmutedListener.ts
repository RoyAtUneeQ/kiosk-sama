import { EventType } from '@/types';
import { SessionStatus } from '@/contexts/types';
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';

/**
 * Handle the DigitalHumanUnmuted event by marking the session as LIVE
 * and clearing any pending prompt wait state.
 */
export class DigitalHumanUnmutedListener implements UneeqEventListener {
eventType = EventType.DigitalHumanUnmuted;
  execute(_: any, session: SessionContextType): void {
    session.actions.setSessionStatus(SessionStatus.LIVE);
    session.actions.setAwaitingPromptResponse(false);
  }
}