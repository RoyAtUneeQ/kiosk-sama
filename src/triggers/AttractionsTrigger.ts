import type { Message } from "@/types/transport/Message";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { CameraHorizontalAnchor } from "../types";
import { MessageFactory } from "@/factories";

export class AttractionsTrigger implements Trigger {
    id: number = 5; 
    icon: string = "MdLocalActivity";
    description: string = "Discover hidden gems and cool spots! Adventure awaits!";

    /** 
     * Generate information about Lee's Summit attractions, dining, shopping, and local experiences
     */
    execute({actions}: SessionContextType): Message {
        actions.setAwaitingPromptResponse(true);
        actions.setMedia(null);
        console.log("[AttractionsTrigger] setting camera to medium_shot");
        actions.setCamera(CameraHorizontalAnchor.center);

        const attractionTopics = [
            // FIFA World Cup 2026
            "FIFA World Cup 2026 host cities and stadium venues across USA, Mexico, and Canada",
            "Arrowhead Stadium in Kansas City for World Cup 2026 matches and events",
            
            // Historic Downtown & Shopping
            "Lee's Summit's historic downtown with brick sidewalks, boutique shops, and local dining",
            "KD's Books indie bookstore in downtown Lee's Summit",
            "The Local Foundry for local art and handmade goods",
            "All A'Bloom, Bel Fiore, and Licata's flower shops",
            
            // Dining & Restaurants
            "Neighborhood Café's famous cinnamon rolls and local breakfast culture",
            "Smoke Brewing Co. for craft beer and hearty meals in downtown Lee's Summit",
            "Third Street Social's upscale comfort food and weekend brunch scene",
            "Taco Holics Club and Calaveras for Mexican street food",
            "Main Slice and Johnny Jo's Pizzeria for pizza lovers",
            "Whistle Stop Coffee and Poppy's Ice Cream for desserts",
            
            // Nightlife & Entertainment
            "The Pink Elephant's craft cocktails and speakeasy atmosphere",
            "1909 Club at Libations & Co. featuring live jazz, blues, and funk music",
            "Bricks, Llywelyn's Pub, and Konrad's Taproom for casual pub atmosphere",
            "Arcade Alley for retro gaming entertainment",
            "The Exit Room for escape adventure experiences",
            
            // Lakes & Parks
            "Longview Lake for boating, fishing, camping, and beaches in Lee's Summit",
            "Blue Springs Lake and Lake Jacomo for swimming, sailing, and marinas",
            "Fleming Park with 7,800 acres, picnic areas, nature trails, and Native Hoofed Animal Enclosure",
            "James A. Reed Memorial Wildlife Area with 3,000 acres, 12 lakes, hiking and horseback trails",
            "Prairie Lee Lake and Lakewood Lakes for fishing, boating, and wildlife observation",
            
            // Recreation & Activities
            "Summit Waves Waterpark with lazy river, slides, and kids' play zone",
            "Summit Ice Rink for winter skating and curling activities",
            "Rock Island Trail - 200-mile regional trail running through Lee's Summit",
            
            // Historic Sites & Landmarks
            "Lee's Summit History Museum showcasing pioneer life and Civil War stories",
            "Longview Farm's historic significance as the 'World's Most Beautiful Farm'",
            "Lee's Summit Water Tower - historic landmark and symbol of city pride since 1909",
            
            // Community & Events
            "Tigers Athletic Complex for sports events and community activities",
            "Unity Village community designed for inspiration, learning, and togetherness",
            "Lee's Summit's award-winning Farmers Market - one of America's Top 10"
        ];

        const randomTopic = attractionTopics[Math.floor(Math.random() * attractionTopics.length)];

        const prompt = `Tell me about ${randomTopic}. 
        Provide detailed information about this attraction or experience, including what makes it special, 
        what visitors can expect, practical details for visiting, and why it's worth experiencing. 
        Include atmosphere details, specialties, and insider tips for getting the most out of it.`;

        return MessageFactory.createSystemMessage(prompt, true);
    }
}
