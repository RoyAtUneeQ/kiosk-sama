import type { Message } from "@/types/transport/Message";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { CameraDistanceAnchor } from "../types";
import { MessageFactory } from "@/factories";

export class StadiumVenuesTrigger implements Trigger {
    id: number = 2; 
    icon: string = "MdStadium";
    description: string = "Ready to explore amazing stadiums? Let's go!";

    /** 
     * Generate information about World Cup 2026 stadiums and host venues
     */
    execute({actions}: SessionContextType): Message {
        actions.setAwaitingPromptResponse(true);
        actions.setMedia(null);
        actions.setCamera(CameraDistanceAnchor.medium_shot);

        const venues = [
            "MetLife Stadium in East Rutherford - the Final venue with 82,500 capacity",
            "SoFi Stadium in Inglewood - the ultra-modern venue with 70,000-100,000 capacity",
            "AT&T Stadium in Arlington - featuring a retractable roof and 80,000-100,000 capacity",
            "Estadio Azteca in Mexico City - the legendary venue hosting its third World Cup with 87,523 capacity",
            "Mercedes-Benz Stadium in Atlanta - hosting semi-finals with its distinctive architecture",
            "Lumen Field in Seattle - known for its incredible atmosphere with 68,740 capacity",
            "BMO Field in Toronto - newly renovated for the World Cup with 45,736 capacity",
            "BC Place in Vancouver - featuring a retractable roof and modern design",
            "Arrowhead Stadium in Kansas City - one of the loudest stadiums in the world"
        ];

        const randomVenue = venues[Math.floor(Math.random() * venues.length)];

        const prompt = `Tell me about ${randomVenue} as a FIFA World Cup 2026 host venue. 
        Share interesting details about the stadium's architecture, history, unique features, and what makes it special for hosting World Cup matches. 
        Include information about the city it's in and what fans can expect when visiting this venue.`;

        return MessageFactory.createSystemMessage(prompt, true);
    }
}
