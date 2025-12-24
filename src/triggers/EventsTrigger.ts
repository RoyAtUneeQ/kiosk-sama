import type { Message } from "@/types/transport/Message";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { CameraHorizontalAnchor } from "../types";
import { MessageFactory } from "@/factories";

export class EventsTrigger implements Trigger {
    id: number = 3; 
    icon: string = "BsCalendar3";
    description: string = "Let's discover this special event calendar! Party time!";

    execute({actions}: SessionContextType): Message {
        actions.setAwaitingPromptResponse(true);
        actions.setMedia(null);
        console.log("[EventsTrigger] setting camera to close_up");
        actions.setCamera(CameraHorizontalAnchor.center);

        const eventTopics = [
            "FIFA World Cup 2026 match schedule and calendar for Kansas City matches at Arrowhead Stadium",
            "FIFA World Cup 2026 tournament timeline and key dates in Kansas City",
            "FIFA World Cup 2026 group stage matches and knockout rounds in Kansas City",
            "Lee's Summit's Oktoberfest in September with German beer, food, and carnival rides downtown",
            "Downtown Days street fair in June with food, music, and vendors",
            "Flights of Fancy Kite Festival in April at MCC-Longview with colorful kites filling the sky",
            "Rock the Amp summer concerts at Legacy Park Amphitheater",
            "Lee's Summit Farmers Market running April through November on Wednesdays and Saturdays",
            "Merry Swiftmas holiday event in December combining Christmas and Taylor Swift themes",
            "Summit Fair celebration of tradition, family, and joy with rides, music, and local flavors",
            "Tigers Athletic Complex sports events and community spirit activities",
            "Lee's Summit Water Tower historic landmark and symbol of city pride since 1909",
            "Unity Village community events designed for inspiration, learning, and togetherness",
            "Prairie Lee Lake and Lake Jacomo recreational activities and natural beauty events",
            "Lakewood Lakes fishing, boating, and wildlife observation opportunities",
            "Historic Downtown Lee's Summit cultural events, shopping, and dining experiences"
        ];

        const randomTopic = eventTopics[Math.floor(Math.random() * eventTopics.length)];

        const prompt = `Tell me about ${randomTopic}. 
        Provide detailed information including specific dates, schedules, what to expect, how to participate or attend, and what makes this event or calendar special. 
        Include practical tips, timing information, and insider details that would help someone plan their visit and make the most of their experience.`;

        return MessageFactory.createSystemMessage(prompt, true);
    }
}
