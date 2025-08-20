import { EventType, type SpeechEventParams, type Event as UneeqEvent } from '@/types';
import type { UneeqEventListener } from '@/listeners/types/UneeqEventListener';
import * as listeners from '@/listeners/uneeq';

// Event registry using reflection - maps EventType to event listener instances
const eventRegistry = new Map<EventType, UneeqEventListener>();

// Register event classes by reflecting on their eventType property
/**
 * Register an event listener class by instantiating and indexing by its `eventType`.
 */
export function registerEventListener<T extends UneeqEventListener>(EventClass: new () => T) {
  const instance = new EventClass();
  eventRegistry.set(instance.eventType, instance);
}

// Register all available event classes automatically
Object.values(listeners).forEach(listener => {
  registerEventListener(listener);
});

// Factory function to create an event handler based on the event type  
/**
 * Resolve a listener instance for a given Uneeq event, or null if not registered.
 */
export const UneeqEventFactory = (event: UneeqEvent): UneeqEventListener | null => {
  const listener = eventRegistry.get(event.uneeqMessageType);
  console.log('UneeqEventFactory', event.uneeqMessageType, listener);
  if (listener) {
    return listener;
  }

  console.warn(`Event handler not implemented for event type: ${event.uneeqMessageType}`);
  return null;
};

//Create the whole structure for   a custom event
export const createCustomEventTag = (params: SpeechEventParams): string => {
  return `<uneeq:custom_event name="${JSON.stringify(params)}" />`;
};