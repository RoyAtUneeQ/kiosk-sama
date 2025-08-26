import type { Message } from "@/types/transport/Message";
import { MessageSender } from "@/types/transport/MessageSender";
import type { Trigger } from "./types/Trigger";
import { createCustomEventTag } from "@/factories/UneeqEventFactory";
import type { SessionContextType } from "@/contexts/SessionContext";

export class CinematicsTrigger implements Trigger {
    id: number = 1; 
    icon: string = "MdMovie";
    /** 
     * Generate a cinematic introduction prompt that plays the splash video.
     */
    generate({}: SessionContextType): Message {

        //To emulate the cinematic video, we can use the media event fullscreen, autoPlay, loop
        const cinematic = createCustomEventTag({type: "media", data: JSON.stringify({url: "splash.mp4", f:1})});

        return {
            id: crypto.randomUUID(),
            content: `Hello there, let me show you a cinematic video ${cinematic} to help you understand how to use this function.`,
            timestamp: new Date(),
            sender: MessageSender.System,
            prompt: false
        };        
    }
}
