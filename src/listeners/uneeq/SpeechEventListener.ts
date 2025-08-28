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
  private customEvents: Map<string, CustomEventListener>;

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
  async execute(data: {speechEvent: SpeechEventData}, session: SessionContextType): Promise<void> {
    try {

      console.log("SpeechEventListener: Executing speech event", data.speechEvent);


      const eventType = data.speechEvent.param_value;

      // Find matching custom event handler by type
      const customEvent = this.customEvents.get(eventType || "");
      
      console.info('customEvent', customEvent);
      console.info('this.customEvents', this.customEvents);
      if (!customEvent) {
        console.warn(`SpeechEventListener: No handler found for event type "${eventType}"`);
        return;
      }

      // Execute the custom event handler with session actions
      //TODO: Add data to the custom event
      await customEvent.execute("", session);
      
      console.log(`SpeechEventListener: Successfully executed "${eventType}" event`);
    } catch (error) {
      console.error('SpeechEventListener: Error executing speech event', error);
    }
  }
}   