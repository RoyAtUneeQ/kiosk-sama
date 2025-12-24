import type { Event as UneeqEvent } from '@/types';

export type UneeqEventHandler = (event: UneeqEvent) => Promise<void> | void;

export interface UneeqEventsServiceOptions {
  // Placeholder for future options
}
