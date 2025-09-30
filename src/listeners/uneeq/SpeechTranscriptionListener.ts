import type { SessionContextType } from "@/contexts/index";
import { EventType } from "@/types/uneeq/EventType";
import type { UneeqEventListener } from "@/listeners/types/UneeqEventListener";

export class SpeechTranscriptionListener implements UneeqEventListener {
  eventType = EventType.SpeechTranscription;
  execute(_: any, session: SessionContextType): void {
    session.actions.setAwaitingPromptResponse(false);
  }
}