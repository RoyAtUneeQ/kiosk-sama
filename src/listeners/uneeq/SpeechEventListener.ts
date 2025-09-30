import { EventType, type SpeechEventData } from "@/types";
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from "@/contexts/SessionContext";
import type { CustomEventListener } from '../types/CustomEventListener';
import * as customEvents from './speech_events';


export class SpeechEventListener implements UneeqEventListener {
  eventType = EventType.SpeechEvent;
  
  /**
   * Registry of custom event handlers indexed by their type
   */
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
    
    console.log(`SpeechEventListener: Registered ${this.customEvents.size} custom events:`, Array.from(this.customEvents.keys()));
  }

  /**
   * Executes the appropriate custom event handler based on the speech event data
   * 
   * @param data - Speech event data containing event type and parameters
   * @param session - Session context providing actions and state management
   */
  execute(data: {speechEvent: SpeechEventData}, session: SessionContextType): void {
    try {
      console.log("SpeechEventListener: Executing speech event", data.speechEvent);

      const { eventType, eventValue } = this.parseEventData(data.speechEvent);

      console.log("SpeechEventListener: Event type and value", { eventType, eventValue });
      
      if (!eventType || !eventValue) {
        console.warn("SpeechEventListener: Missing event type or value", { eventType, eventValue });
        return;
      }

      const customEvent = this.customEvents.get(eventType);
      
      if (!customEvent) {
        console.warn(`SpeechEventListener: No handler found for event type "${eventType}"`);
        return;
      }

      // Execute the custom event handler with session actions
      customEvent.execute(eventValue, session).catch(error => {
        console.error(`SpeechEventListener: Error in ${eventType} handler:`, error);
      });
      
      console.log(`SpeechEventListener: Successfully executed "${eventType}" event`);
    } catch (error) {
      console.error('SpeechEventListener: Error executing speech event', error);
    }
  }

  /**
   * Parses speech event data to extract event type and value
   * Handles both formats: "type_id" and just "type"
   * 
   * @param speechEvent - The speech event data
   * @returns Object containing eventType and eventValue
   */
  private parseEventData(speechEvent: SpeechEventData): { eventType: string; eventValue: string } {
    const paramValue = speechEvent.param_value;

    // Legacy support: parse param_value for "type_id" format
    if (paramValue?.includes("_")) {
      const [type, value] = paramValue.split("_", 2);
      return {
        eventType: type,
        eventValue: value
      };
    }

    // Fallback: use param_value as both type and value
    return {
      eventType: paramValue || "",
      eventValue: paramValue || ""
    };
  }
}   