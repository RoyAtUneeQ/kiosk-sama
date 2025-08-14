import type { SessionContextType } from '@/contexts/SessionContext';
import type { EventType } from '@/types';

/**
 * Contract implemented by concrete Uneeq event listeners.
 */
export interface UneeqEventListener {
  /** Event type handled by this listener. */
  eventType: EventType;
  /**
   * Execute the listener logic for the given event payload.
   * @param data - Uneeq event payload
   * @param session - Current session context
   */
  execute: (data: any, session: SessionContextType) => void;
}
