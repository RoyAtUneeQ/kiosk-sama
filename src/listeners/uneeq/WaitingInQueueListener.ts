import { EventType } from "@/types/uneeq/EventType";
import type { SessionContextType } from "@/contexts/SessionContext";
import type { UneeqEventListener } from "@/listeners/types/UneeqEventListener";

export class WaitingInQueueListener implements UneeqEventListener {
  eventType = EventType.WaitingInQueue;
    execute(data: any, _: SessionContextType): void {
        console.log('WaitingInQueueListener', data);
    }
}