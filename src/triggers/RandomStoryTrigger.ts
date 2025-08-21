import { Actions, CameraDistanceAnchor, MessageSender, type Message } from "@/types";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";

export class RandomStoryTrigger implements Trigger {
    icon: string = "MdHistoryEdu";

    /** 
     * Generate a concise, lightly amusing story prompt that includes a tagged
     * action selected at random from `actionDescriptions`.
     */
    generate({actions}: SessionContextType): Message {
        const actionsKeys = Object.keys(Actions);
        const randomAction = actionsKeys[Math.floor(Math.random() * actionsKeys.length)];   
        const description = Actions[randomAction as keyof typeof Actions];

        console.log("[RandomStoryTrigger] setting camera to close_up");
        actions.setCamera(CameraDistanceAnchor.close_up);

        const prompt = `Using the tags related to "${description}" you need to generate story naturally with 1 sentence, includes the tag <uneeq:action_${randomAction} /> 
        at the exact moment where the action happens. The story should be engaging and lightly amusing, using a subtle, relatable tone—something clever and entertaining 
        without overdoing the humor or sounding like a joke.`;

        return {
            id: crypto.randomUUID(),
            content: prompt,
            timestamp: new Date(),
            sender: MessageSender.System,
            prompt: true
        };
    }
}   