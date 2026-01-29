import { EventType, type SpeechEventData } from "@/types";
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from "@/contexts/SessionContext";
import type { CustomEventListener } from '../types/CustomEventListener';
import * as customEvents from './speech_events';


export class SpeechEventListener implements UneeqEventListener {
  eventType = EventType.SpeechEvent;
  
  private readonly customEvents: Map<string, CustomEventListener>;

  constructor() {
    // Initialize custom event registry by dynamically loading all custom events
    this.customEvents = new Map();
    
    // Iterate through all exported custom event classes
    Object.values(customEvents).forEach((EventClass: any) => {
      // Check if it's a constructor function
      if (typeof EventClass === 'function') {
        try {
          // Instantiate the custom event
          const eventInstance = new EventClass() as CustomEventListener;
          
          // Verify it has the required CustomEvent interface
          if (eventInstance && typeof eventInstance.type === 'string' && typeof eventInstance.execute === 'function') {
            this.customEvents.set(eventInstance.type, eventInstance);
          }
        } catch (error) {
          console.warn(`SpeechEventListener: Failed to instantiate custom event class`, EventClass.name, error);
        }
      }
    });
  }

  execute(data: {speechEvent: SpeechEventData}, session: SessionContextType): void {
    try {
      const { eventType, eventValue } = this.parseEventData(data.speechEvent);

      if (!eventType || !eventValue) {
        return;
      }

      const customEvent = this.customEvents.get(eventType);

      if (!customEvent) {
        console.warn(`SpeechEventListener: No handler found for event type "${eventType}"`);
        return;
      }

      customEvent.execute(eventValue, session).catch(error => {
        console.error(`SpeechEventListener: Error in ${eventType} handler:`, error);
      });
    } catch (error) {
      console.error('SpeechEventListener: Error executing speech event', error);
    }
  }

  private parseEventData(speechEvent: SpeechEventData): { eventType: string; eventValue: string } {
    const paramValue = speechEvent.param_value;

    // Legacy support: parse param_value for "type_id" format
    // This will not work with the new format of speech events
    // if (paramValue?.includes("_")) {
    //   const [type, value] = paramValue.split("_", 2);
    //   return {
    //     eventType: type,
    //     eventValue: value
    //   };
    // }

    // Fallback: use param_value as both type and value
    return {
      eventType: paramValue || "",
      eventValue: paramValue || ""
    };
  }
}   