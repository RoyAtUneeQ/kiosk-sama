import type { SessionContextType } from '@/contexts/SessionContext';
  
/**
 * Minimal context passed to event listeners when they execute.
 */
export interface EventListenerContext {
    /** Session context giving access to state and actions. */
    session: SessionContextType;
    /**
     * Listener handler invoked with data payload and the current session.
     * @param data - Event payload
     * @param session - Active session context
     */
    execute: (data: any, session: SessionContextType) => void;
  }
