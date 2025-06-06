import { emotions } from "@/types";

export class EmotionInstructionGenerator {
    generate(): string {
        const emotionKeys = Object.keys(emotions);
        const randomEmotion = emotionKeys[Math.floor(Math.random() * emotionKeys.length)];
        const strength = "strong"; // Hardcoded strength as in the original snippet
        const tag = `<uneeq:emotion_${randomEmotion}_${strength} />`;
        const description = emotions[randomEmotion as keyof typeof emotions];

        return `Instruction: Create a concise, one-sentence story that expresses ${description} 
        and naturally includes the tag ${tag} at the exact moment where the action happens. 
        The story should be engaging and lightly amusing, using a subtle, relatable tone—something clever and entertaining without 
        overdoing the humor or sounding like a joke.`;
    }
}
