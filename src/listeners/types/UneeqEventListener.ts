import type { SessionContextType } from '@/contexts/SessionContext';
import type { EventType } from '@/types';

export interface UneeqEventListener {
  eventType: EventType;
  execute: (data: any, session: SessionContextType) => void;
}
