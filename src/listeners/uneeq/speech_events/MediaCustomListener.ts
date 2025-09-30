import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import { CameraHorizontalAnchor } from "@/types/uneeq";
import { type Media } from "@/types/utils";
import mediaData from "@/assets/media.json";

export class MediaCustomListener implements CustomEventListener {
    type = "media"; 
    async execute(id: string, session: SessionContextType): Promise<void> {
        // Center camera on mobile devices, right on desktop
        const isMobile = window.innerWidth <= 600;
        session.actions.setCamera(isMobile ? CameraHorizontalAnchor.center : CameraHorizontalAnchor.right);
        const cleanId = id.toString().trim().replace(/['"]/g, '');
        const media = mediaData.find((m: any) => m.id === parseInt(cleanId)) as Media;
        if (media) {
            session.actions.setMedia({
                type: media.type,
                url: media.url
            });
        } else {
            console.warn(`MediaCustomListener: Media with id ${cleanId} not found`);
        }
    }
}