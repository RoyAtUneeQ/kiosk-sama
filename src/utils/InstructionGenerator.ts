import { ActionInstructionGenerator } from "./ActionInstructionGenerator";
import { EmotionInstructionGenerator } from "./EmotionInstructionGenerator";

const actionGenerator = new ActionInstructionGenerator();
const emotionGenerator = new EmotionInstructionGenerator();

export function generateInstructionBasedOnInput(input: string): string {
    if (input === "#action_requested") {
        return actionGenerator.generate();
    } else {
        // Assuming any other input triggers an emotion instruction, based on your snippet
        return emotionGenerator.generate();
    }
} 