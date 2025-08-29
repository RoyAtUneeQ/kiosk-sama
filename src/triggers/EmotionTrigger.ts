import { CameraDistanceAnchor, Emotions, type Message } from "@/types";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { MessageFactory } from "@/factories";

export class EmotionTrigger implements Trigger {
    id: number = 3; 
    icon: string = "FaRegFaceLaughWink";

    /** 
     * Generate a concise, lightly amusing story prompt that includes a tagged
     * action selected at random from `actionDescriptions`.
     */
    execute({actions}: SessionContextType): Message {
        const actionsKeys = Object.keys(Emotions);
        const randomEmotion = actionsKeys[Math.floor(Math.random() * actionsKeys.length)];   
        const description = Emotions[randomEmotion as keyof typeof Emotions];

        console.log("[EmotionTrigger] setting camera to close_up");
        actions.setCamera(CameraDistanceAnchor.close_up);

        const prompt = `Using the tags related to "${description}" you need to generate story naturally with 1 sentence, includes the tag <uneeq:emotion_${randomEmotion}_strong /> 
        at the exact moment where the action happens. The story should be engaging and lightly amusing, using a subtle, relatable tone—something clever and entertaining 
        without overdoing the humor or sounding like a joke.`;

        return MessageFactory.createSystemMessage(prompt, true);
    }
}   