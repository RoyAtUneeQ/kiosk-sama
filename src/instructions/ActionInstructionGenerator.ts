import { actionDescriptions } from "@/types";

export class ActionInstructionGenerator {
    generate(): string {
        const actions = Object.keys(actionDescriptions);
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const description = actionDescriptions[randomAction as keyof typeof actionDescriptions];

        return `Instruction: Create a concise, one-sentence story that expresses ${description} 
        and naturally includes the tag <uneeq:action_${randomAction} /> at the exact moment where the action happens. 
        The story should be engaging and lightly amusing, using a subtle, relatable tone—something clever and entertaining without overdoing 
        the humor or sounding like a joke.`;
    }
} 