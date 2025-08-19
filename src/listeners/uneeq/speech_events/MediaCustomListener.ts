import { type SessionActions } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";

export class MediaCustomListener implements CustomEventListener {
    type = "media";
    async execute(data: any, actions: SessionActions): Promise<void> {
        console.log("In Media Instruction", data);
        actions.setVideoUrl(data.url);
    }
}