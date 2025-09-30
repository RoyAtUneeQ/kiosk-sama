import type { Message } from "@/types/transport/Message";
import type { Trigger } from "./types/Trigger";
import type { SessionContextType } from "@/contexts/SessionContext";
import { CameraHorizontalAnchor } from "../types";
import { MessageFactory } from "@/factories";

export class HotelsTrigger implements Trigger {
    id: number = 4; 
    icon: string = "BsBuilding";
    description: string = "Find your perfect home away from home! Sweet dreams guaranteed!";

    /** 
     * Generate information about accommodation options in Lee's Summit and Kansas City area
     */
    execute({actions}: SessionContextType): Message {
        actions.setAwaitingPromptResponse(true);
        actions.setMedia(null);
        console.log("[HotelsTrigger] setting camera to center");
        actions.setCamera(CameraHorizontalAnchor.center);

        const hotelTopics = [
            "Fairfield Inn & Suites Kansas City Lee's Summit with modern amenities, indoor pool, and free breakfast ($120-$150)",
            "Hampton Inn Kansas City-Lee's Summit with free hot breakfast, indoor pool, and fitness center ($120-$150)",
            "Holiday Inn Express & Suites Lee's Summit with complimentary breakfast and close proximity to attractions ($120-$150)",
            "Best Western Plus Lee's Summit Hotel & Suites with free breakfast, fitness center, and pet-friendly policies ($85-$120)",
            "Comfort Inn & Suites Lee's Summit with budget-friendly rates, free breakfast, and fitness center ($74-$129)",
            "La Quinta Inn & Suites by Wyndham Blue Springs with affordable rates, pet-friendly policies, and free breakfast ($66-$100)",
            "Super 8 by Wyndham Independence Kansas City with basic amenities and budget-friendly rates ($55-$80)",
            "accommodation options near Arrowhead Stadium for FIFA World Cup 2026 visitors",
            "hotel amenities and services available in Lee's Summit area",
            "pet-friendly accommodation options in Lee's Summit and Kansas City area",
            "budget-friendly hotel options for World Cup 2026 visitors",
            "luxury accommodation options near Lee's Summit attractions",
            "hotel booking tips and best practices for World Cup 2026 travel",
            "accommodation proximity to Lee's Summit's major attractions and downtown area",
            "hotel packages and deals available during World Cup 2026 tournament period"
        ];

        const randomTopic = hotelTopics[Math.floor(Math.random() * hotelTopics.length)];

        const prompt = `Tell me about ${randomTopic}. 
        Provide detailed information about accommodation options, including amenities, pricing, location advantages, 
        and what makes each option suitable for different types of travelers. Include practical booking advice 
        and tips for getting the best value and experience.`;

        return MessageFactory.createSystemMessage(prompt, true);
    }
}
