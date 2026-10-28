import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { useSessionStore } from '@/contexts/SessionContext';
import { EventType } from '@/types';

export class SessionEndedListener implements UneeqEventListener {
  eventType = EventType.SessionEnded;
  execute(_data: unknown, session: SessionContextType): void {
    const { uneeqRestartPending, uneeq } = useSessionStore.getState().state;
    if (!uneeqRestartPending) return;

    session.actions.setUneeqRestartPending(false);
    uneeq?.startSession();
  }
}
