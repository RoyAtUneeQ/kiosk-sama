import { actionDescriptions, emotions, cameraAnchorDescriptions } from "@/types";

export class AvailableTagsGenerator {
    getAll(): string {
        return `You have available all this actions actions and emotions, you can use to express yourself or show as example:
            # Actions
            ${this.getAllActionDescriptions()}
            # Emotions
            ${this.getAllEmotionDescriptions()}
            # Camera Anchor (when you want to zoom in or out)
            ${this.getAllCameraAnchorDescriptions()}
        `
    }

    getAllCameraAnchorDescriptions(): string {
        return Object.keys(cameraAnchorDescriptions).map(anchor => `- <uneeq:custom_event name="camera_${anchor}" /> (${cameraAnchorDescriptions[anchor as keyof typeof cameraAnchorDescriptions]})`).join("\n");
    }

    getAllActionDescriptions(): string {
        return Object.keys(actionDescriptions).map(action => `- <uneeq:action_${action} />: ${actionDescriptions[action as keyof typeof actionDescriptions]}`).join("\n");
    }

    getAllEmotionDescriptions(): string {
        return Object.keys(emotions).map(emotion => `- <uneeq:emotion_${emotion}_stong />: ${emotions[emotion as keyof typeof emotions]}`).join("\n");
    }


}