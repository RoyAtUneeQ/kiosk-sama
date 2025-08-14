import { type SessionActions } from "@/contexts/SessionContext";
import { type CustomEvent } from "@/listeners/types/CustomEvent";

export class InMediaInstruction implements CustomEvent {
    type = "media";
    async execute(data: any, actions: SessionActions): Promise<void> {
        console.log("In Media Instruction", data);
        actions.setVideoUrl(data.url);
    }
}