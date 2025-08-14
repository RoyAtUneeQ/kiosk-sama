import type { Event as UneeqEvent } from '@/types';
import type {
  UneeqEventHandler,
  UneeqEventsServiceOptions
} from './types/UneeqEventsServiceTypes';

/**
 * Service for managing and dispatching Uneeq events.
 * Handles event registration, unregistration, and dispatching.
 */
export class UneeqEventsService {
  private handlers: Map<string, UneeqEventHandler> = new Map();

  /**
   * Create a new events service.
   *
   * @param _options - Reserved for future configuration.
   */
  constructor(_options: UneeqEventsServiceOptions = {}) {
    // Future options can be added here
  }

  /**
   * Register an event handler for a specific event type.
   *
   * @param type - Uneeq message type string.
   * @param handler - Function invoked when the event is dispatched.
   */
  public register(type: string, handler: UneeqEventHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Unregister an event handler for a specific event type.
   */
  public unregister(type: string): void {
    this.handlers.delete(type);
  }

  /**
   * Dispatch an event to its registered handler.
   *
   * @param event - Uneeq event object.
   */
  public async dispatch(event: UneeqEvent): Promise<void> {
    const handler = this.handlers.get(event.uneeqMessageType);
    
    if (!handler) {
      console.error('No handler found for event type:', event.uneeqMessageType);
      return;
    }

    try {
      await handler(event);
    } catch (error) {
      this.handleError('dispatch', error, event.uneeqMessageType);
    }
  }

  /**
   * Get all registered event types.
   */
  public getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all registered handlers.
   */
  public clear(): void {
    this.handlers.clear();
  }

  /**
   * Log errors with method and event type context.
   */
  private handleError(method: string, error: unknown, eventType?: string): void {
    const context = eventType ? ` for event type: ${eventType}` : '';
    console.error(`[UneeqEventsService] ${method} failed${context}:`, error);
  }
}

export default UneeqEventsService;


