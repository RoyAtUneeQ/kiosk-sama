import type { Message } from "@/types/transport/Message";
import { MessageFactory } from "@/factories";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { CameraDistanceAnchor } from "../types";
import { PixabayService } from "@/services/PixabayService";


export class ImageTrigger implements Trigger {
    id: number = 5; 
    icon: string = "FaImage";
    counter: number = 0;
    private static pixabayService: PixabayService | null;


    /** 
     * Generate a story prompt based on a random beautiful landscape image from Pixabay.
     * Uses HD landscape images with consistent proportions (16:9 aspect ratio).
     * The story incorporates the image's tags and metadata to create an engaging narrative.
     */
    async execute({state, actions}: SessionContextType) : Promise<Message | void>{
        if (!ImageTrigger.pixabayService) 
            ImageTrigger.pixabayService = new PixabayService(state.config.apis.pixabay.api_url, state.config.apis.pixabay.api_key);

        actions.setCamera(CameraDistanceAnchor.medium_shot);
        const image = await ImageTrigger.pixabayService.getRandomImage();

        if (!image) {
            return MessageFactory.createSystemMessage("No image found");
        }

        // Store the best quality image URL in the memory
        actions.setMemory("media", ImageTrigger.pixabayService.getBestQualityUrl(image));

        const prompt = `Based on this image tags ${image.tags}. You must write a single vivid, engaging sentence as if you are a writer describing this image. 
                The story should feel natural, descriptive, and emotionally alive. 
                Important rule: You must insert the tag <uneeq:custom_event name="media" /> immediately after the first word of the sentence. 
                - The first word must always be a real word (never the tag). 
                - The tag must come right after that first word, with no exceptions. 
                - The rest of the sentence should continue naturally.`;

        return MessageFactory.createSystemMessage(prompt);
    }   

}
