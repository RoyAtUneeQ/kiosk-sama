import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { EventType } from '@/types';

/**
 * Handle the SessionLive event.
 */
export class SessionLiveListener implements UneeqEventListener {
  eventType = EventType.SessionLive;
  execute(_data: any, _session: SessionContextType): void {
    console.log('[SessionLiveListener] SessionLive');
  }
}