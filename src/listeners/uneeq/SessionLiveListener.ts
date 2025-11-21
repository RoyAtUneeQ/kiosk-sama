import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { EventType } from '@/types';

/**
 * Handle the SessionLive event.
 */
export class SessionLiveListener implements UneeqEventListener {
  eventType = EventType.SessionLive;
  execute(_data: any, session: SessionContextType): void {
    session.state?.persist?.set('hello', "I am sending a hello from the Frontend");
    console.log('[SessionLiveListener] SessionLive');
  }
}