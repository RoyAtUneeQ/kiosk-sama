import type { Message } from "@/types/transport/Message";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { CameraHorizontalAnchor } from "../types";
import { MessageFactory } from "@/factories";

export class WorldCupInfoTrigger implements Trigger {
    id: number = 1; 
    icon: string = "MdSportsSoccer";
    description: string = "Unlock an exclusive journey through the Lees City Summit with this special button.";
    hasVideoBeenShown: boolean = false;

    /** 
     * Provide users with options to watch FIFA World Cup 2026 video or explore tournament information
     */
    execute({actions}: SessionContextType): Message {
        actions.setAwaitingPromptResponse(true);
        actions.setMedia(null);
        actions.setCamera(CameraHorizontalAnchor.center);
        
        const topics = [
            "tournament format with 48 teams and 104 matches from June 11 to July 19, 2026",
            "the historic tri-nation hosting by United States, Mexico, and Canada",
            "the new 12 groups of 4 format with top 2 plus 8 best third-place teams advancing",
            "the final venue at MetLife Stadium in East Rutherford, New Jersey on July 19, 2026",
            "Mexico becoming the first country to host the World Cup three times (1970, 1986, 2026)",
            "the record-breaking attendance expected with over 6.5 million fans in the US alone",
            "the qualified teams including Argentina, Brazil, Japan, South Korea, and host nations",
            "star players to watch like Messi, Ronaldo, Mbappé, Haaland, and Vinicius Jr."
        ];

        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        let prompt: string;

        if (!this.hasVideoBeenShown) {
            // First time - show the video
            prompt = `Show the FIFA World Cup 2026 video to the user first. Use this format:

            "Here we go, <uneeq:custom_event name="media_39" /> let's watch this video together"
            "Let's watch together, <uneeq:custom_event name="media_39" /> see this video!"
            "Get ready, <uneeq:custom_event name="media_39" /> for this amazing video!"
            "Here it comes, <uneeq:custom_event name="media_39" /> let's dive into the video!"

            After the user watches the video, you can then answer any questions about ${randomTopic}.`;
        } else {
            // Video already shown - answer questions directly
            prompt = `The user has already watched the FIFA World Cup 2026 video. Now you can answer any questions about ${randomTopic}.

            Question Examples:
            "What is the final venue of the FIFA World Cup 2026?"
            "Who is the host country of the FIFA World Cup 2026?"
            "What is the record-breaking attendance expected with over 6.5 million fans in the US alone?"
            "What are the qualified teams including Argentina, Brazil, Japan, South Korea, and host nations?"
            "Who are the star players to watch like Messi, Ronaldo, Mbappé, Haaland, and Vinicius Jr.?"

            Provide detailed and engaging information about the World Cup 2026.`;
        }
        this.hasVideoBeenShown = true;

        return MessageFactory.createSystemMessage(prompt, true);
    }
}
