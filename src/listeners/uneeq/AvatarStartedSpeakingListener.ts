import { CameraHorizontalAnchor, EventType } from "@/types";
import type { UneeqEventListener } from "../types/UneeqEventListener";
import type { SessionContextType } from "@/contexts/SessionContext";

export class AvatarStartedSpeakingListener implements UneeqEventListener {
  eventType = EventType.AvatarStartedSpeaking;
  execute(_: any, session: SessionContextType): void {
    console.log("[AvatarStartedSpeakingListener] AvatarStartedSpeaking");
    session.actions.setCamera(CameraHorizontalAnchor.center);
    session.actions.setMedia(null);
    session.actions.setAwaitingPromptResponse(false);
  }
}
