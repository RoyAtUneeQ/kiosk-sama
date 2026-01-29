import type { SessionContextType } from "@/contexts/index";
import { EventType } from "@/types/uneeq/EventType";
import type { UneeqEventListener } from "@/listeners/types/UneeqEventListener";

export class SpeechTranscriptionListener implements UneeqEventListener {
  eventType = EventType.SpeechTranscription;
  execute(data: any, session: SessionContextType): void {
    // SpeechTranscription is for live/interim transcripts
    // Final user input is captured in PromptRequest
    // Just log for debugging
    const transcription = data?.transcript || data?.text || '';
    if (transcription) {
    }
    
    session.actions.setAwaitingPromptResponse(false);
  }
}