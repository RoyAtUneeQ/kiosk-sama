import { EventType } from "@/types";
import type { UneeqEventListener } from '../types/UneeqEventListener';
import type { SessionContextType } from "@/contexts/SessionContext";
import type { CustomEvent } from '../types/CustomEvent';
import * as customEvents from './custom_events';

/**
 * SpeechEventListener handles speech events from the UneeQ API.
 * 
 * This listener processes custom speech events that are embedded in digital human responses
 * using XML-like tags (e.g., `<uneeq\ custom event name="media" />`). These events are
 * triggered at the precise moment they are spoken by the digital human, enabling 
 * synchronized frontend actions.
 * 
 * The listener automatically discovers and registers all custom event handlers 
 * from the custom_events directory, then uses reflection to dynamically call 
 * the appropriate handler based on the event type specified in the speech event data.
 * 
 * @example
 * // Digital human speech with embedded event:
 * // "Here's some content <uneeq\ custom event name='media' url='video.mp4' /> for you"
 * // Will trigger the InMediaInstruction handler when "media" is spoken
 * 
 * // To add a new custom event, simply:
 * // 1. Create a new class implementing CustomEvent in custom_events/
 * // 2. Export it from custom_events/index.ts
 * // 3. It will be automatically registered
 */
export class SpeechEventListener implements UneeqEventListener {
  eventType = EventType.SpeechEvent;
  
  /**
   * Registry of custom event handlers indexed by their type
   */
  private customEvents: Map<string, CustomEvent>;

  constructor() {
    // Initialize custom event registry by dynamically loading all custom events
    this.customEvents = new Map();
    
    // Iterate through all exported custom event classes
    Object.values(customEvents).forEach((EventClass: any) => {
      // Check if it's a constructor function
      if (typeof EventClass === 'function') {
        try {
          // Instantiate the custom event
          const eventInstance = new EventClass() as CustomEvent;
          
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
  async execute(data: any, session: SessionContextType): Promise<void> {
    try {
      // Extract event type from speech event data
      const eventType = data?.name || data?.type;
      
      if (!eventType) {
        console.warn('SpeechEventListener: No event type found in data', data);
        return;
      }

      // Find matching custom event handler by type
      const customEvent = this.customEvents.get(eventType);
      
      if (!customEvent) {
        console.warn(`SpeechEventListener: No handler found for event type "${eventType}"`);
        return;
      }

      // Execute the custom event handler with session actions
      await customEvent.execute(data, session.actions);
      
      console.log(`SpeechEventListener: Successfully executed "${eventType}" event`);
    } catch (error) {
      console.error('SpeechEventListener: Error executing speech event', error);
    }
  }
}   