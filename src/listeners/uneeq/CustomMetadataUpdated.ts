import { type SessionContextType } from "@/contexts/SessionContext";
import { EventType } from "@/types/uneeq/EventType";
import type { UneeqEventListener } from "../types/UneeqEventListener";

export class CustomMetadataUpdated implements UneeqEventListener {
    eventType = EventType.CustomMetadataUpdated;
    async execute(data: any, session: SessionContextType): Promise<void> {
        console.log(" ========= CustomMetadataUpdated ==========");
        console.log(data);
    }
}   