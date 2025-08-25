import { type SessionContextType } from "@/contexts/SessionContext";
import { EventType } from "@/types/uneeq/EventType";
import type { UneeqEventListener } from "../types/UneeqEventListener";

export class CustomMetadataUpdated implements UneeqEventListener {
    eventType = EventType.CustomMetadataUpdated;
    async execute(data: any, _session: SessionContextType): Promise<void> {
        // Session context available for custom implementations
        console.log(" ========= CustomMetadataUpdated ==========");
        console.log(data);
    }
}   