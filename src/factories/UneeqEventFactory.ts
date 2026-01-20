import { EventType, type SpeechEventParams, type Event as UneeqEvent } from '@/types';
import type { UneeqEventListener } from '@/listeners/types/UneeqEventListener';
import * as listeners from '@/listeners/uneeq';

// Event registry using reflection - maps EventType to event listener instances
const eventRegistry = new Map<EventType, UneeqEventListener>();

export function registerEventListener<T extends UneeqEventListener>(EventClass: new () => T) {
  const instance = new EventClass();
  eventRegistry.set(instance.eventType, instance);
}

// Register all available event classes automatically
console.log('[UneeqEventFactory] Available listeners:', Object.keys(listeners));
Object.values(listeners).forEach((listener: any) => {
  try {
    if (typeof listener === 'function') {
      const instance = new listener();
      console.log('[UneeqEventFactory] Registering Uneeq listener:', listener.name, '→', instance.eventType);
      registerEventListener(listener);
    }
  } catch (error) {
    console.error('[UneeqEventFactory] Failed to register listener:', listener?.name, error);
  }
});

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