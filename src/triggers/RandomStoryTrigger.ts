import { actionDescriptions, MessageSender, type Message } from "@/types";
import type { Trigger } from "./types/Trigger";

export class RandomStoryTrigger implements Trigger {
    icon: string = "MdHistoryEdu";

    /** 
     * Generate a concise, lightly amusing story prompt that includes a tagged
     * action selected at random from `actionDescriptions`.
     */
    generate(_: any): Message {
        const actions = Object.keys(actionDescriptions);
        const randomAction = actions[Math.floor(Math.random() * actions.length)];   
        const description = actionDescriptions[randomAction as keyof typeof actionDescriptions];

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