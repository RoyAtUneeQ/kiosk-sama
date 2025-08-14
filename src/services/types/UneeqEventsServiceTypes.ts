import type { Event as UneeqEvent } from '@/types';

/**
 * Function signature for an event handler invoked by `UneeqEventsService`.
 */
export type UneeqEventHandler = (event: UneeqEvent) => Promise<void> | void;

/**
 * Options for configuring `UneeqEventsService`.
 */
export interface UneeqEventsServiceOptions {
  // Placeholder for future options
}
