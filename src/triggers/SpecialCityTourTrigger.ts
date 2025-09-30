import type { SessionContextType } from "@/contexts/SessionContext";
import type { Trigger } from "./types/Trigger";
import type { Message } from "@/types/transport/Message";
import { CameraHorizontalAnchor } from "../types";
import { MessageFactory } from "@/factories";

export class SpecialCityTourTrigger implements Trigger {
    id: number = 6; 
    special: boolean = true;
    icon: string = "FaStar";
    description: string = "Discover the beauty of Lees City in just 2 minutes!";

    execute({actions}: SessionContextType): Message {
        actions.setAwaitingPromptResponse(true);
        actions.setMedia(null);
        actions.setCamera(CameraHorizontalAnchor.center);

        this.special = false;
        return MessageFactory.createSystemMessage("CITY TOUR", true);
    }           
}