import { EventType } from '@/types';
import type { UneeqEventListener } from '@/types';
import type { SessionContextType } from '@/contexts';

export class PromptResultListener implements UneeqEventListener {
  eventType = EventType.PromptResult;

  execute(_data: any, _session: SessionContextType): void {
    
  }
}