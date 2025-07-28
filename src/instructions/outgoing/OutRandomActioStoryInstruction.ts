import { actionDescriptions, type OutgoingInstruction } from "@/types";

/**
 * This instruction generates a story about a random action
 */
export class OutRandomActionStoryInstruction implements OutgoingInstruction {
    icon: string = "BsStoplightsFill";
    generate(): string {
        const actions = Object.keys(actionDescriptions);
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const description = actionDescriptions[randomAction as keyof typeof actionDescriptions];

        const prompt = `Using the tags related to "${description}" you need to generate story naturally with 1 sentence, includes the tag <uneeq:action_${randomAction} /> 
        at the exact moment where the action happens. The story should be engaging and lightly amusing, using a subtle, relatable tone—something clever and entertaining 
        without overdoing the humor or sounding like a joke.`;

        return prompt;
    }
} 