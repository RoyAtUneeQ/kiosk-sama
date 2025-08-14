import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { EventType } from '@/types';

/**
 * Handle the SessionReconnectingFinished event.
 */
export class SessionReconnectingFinishedListener implements UneeqEventListener {
  eventType = EventType.SessionReconnectingFinished;
  execute(_data: any, _session: SessionContextType): void {
    console.log('[SessionReconnectingFinishedListener] Session reconnecting finished');
  }
}
