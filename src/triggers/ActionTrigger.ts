import type { Message } from "@/types/transport/Message";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { Actions, CameraDistanceAnchor } from "../types";
import { MessageFactory } from "@/factories";

export class ActionTrigger implements Trigger {
    id: number = 4; 
    icon: string = "MdEmojiPeople";
    /** 
     * Generate a cinematic introduction prompt that plays the splash video.
     */
    execute({actions}: SessionContextType): Message {
        const actionsKeys = Object.keys(Actions);
        const randomAction = actionsKeys[Math.floor(Math.random() * actionsKeys.length)];   
        const description = Actions[randomAction as keyof typeof Actions];

        console.log("[ActionTrigger] setting camera to close_up");
        actions.setCamera(CameraDistanceAnchor.full_shot);

        const prompt = `Using the tags related to "${description}" you need to generate story naturally with 1 sentence, includes the tag <uneeq:action_${randomAction} /> 
        at the exact moment where the action happens. The story should be engaging and lightly amusing, using a subtle, relatable tone—something clever and entertaining 
        without overdoing the humor or sounding like a joke.`;

        return MessageFactory.createSystemMessage(prompt, true);
    }
}
