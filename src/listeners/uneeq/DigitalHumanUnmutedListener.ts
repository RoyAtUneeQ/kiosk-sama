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
    console.log('[StateManagerSDK] 🎤 DigitalHumanUnmuted event received - Setting status to LIVE');
    console.log('[StateManagerSDK] Current session state before LIVE:', {
      hasUneeq: !!session.state.uneeq,
      sessionId: session.state.uneeq?.options?.sessionId,
      currentStatus: session.state.status,
      hasPersist: !!session.state.persist,
      configEnabled: session.state.config?.stateManager?.enabled
    });
    session.actions.setSessionStatus(SessionStatus.LIVE);
    session.actions.setAwaitingPromptResponse(false);
    console.log('[StateManagerSDK] ✅ Status set to LIVE, State Manager should now initialize');
  }
}