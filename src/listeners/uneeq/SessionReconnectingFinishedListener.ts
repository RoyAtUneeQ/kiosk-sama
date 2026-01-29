import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from '@/contexts/SessionContext';
import { EventType } from '@/types';

export class SessionReconnectingFinishedListener implements UneeqEventListener {
  eventType = EventType.SessionReconnectingFinished;
  execute(_data: any, _session: SessionContextType): void {
    // Session reconnecting finished
  }
}
