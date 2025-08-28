import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import { CameraHorizontalAnchor } from "@/types/uneeq";

export class MediaCustomListener implements CustomEventListener {
    type = "media"; 
    async execute(_: any, session: SessionContextType): Promise<void> {
        session.actions.setCamera(CameraHorizontalAnchor.right);
        session.actions.setMedia({
            type: 'image',
            url: session.state.memory["media"] as string
        });
    }
}