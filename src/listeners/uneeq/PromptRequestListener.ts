import { EventType } from '@/types';
import type { UneeqEventListener } from '../types/UneeqEventListener';
  import type { SessionContextType } from '@/contexts/SessionContext';

export class PromptRequestListener implements UneeqEventListener {
  eventType = EventType.PromptRequest;
  execute(_: any, session: SessionContextType): void {
    console.log('[PromptRequestListener] PromptRequest');
    session.actions.setAwaitingPromptResponse(true);
  }
}   