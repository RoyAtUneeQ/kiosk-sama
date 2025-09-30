import { EventType } from "@/types";
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from "@/contexts/SessionContext";

export class AvatarStoppedSpeakingListener implements UneeqEventListener {
  eventType = EventType.AvatarStoppedSpeaking;  
  execute(_: any, session: SessionContextType): void {
    console.log('[AvatarStoppedSpeakingListener] AvatarStoppedSpeaking');
    session.actions.setAwaitingPromptResponse(false);
  }
}   