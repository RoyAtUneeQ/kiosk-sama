import type { Event as UneeqEvent } from '@/types';
import type {
  UneeqEventHandler,
  UneeqEventsServiceOptions
} from '../types/UneeqEventsServiceTypes';

export class UneeqEventsService {
  private handlers: Map<string, UneeqEventHandler> = new Map();

  constructor(_options: UneeqEventsServiceOptions = {}) {
    // Future options can be added here
  }

  public register(type: string, handler: UneeqEventHandler): void {
    this.handlers.set(type, handler);
  }

  public unregister(type: string): void {
    this.handlers.delete(type);
  }

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

  public getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  public clear(): void {
    this.handlers.clear();
  }

  private handleError(method: string, error: unknown, eventType?: string): void {
    const context = eventType ? ` for event type: ${eventType}` : '';
    console.error(`[UneeqEventsService] ${method} failed${context}:`, error);
  }
}

export default UneeqEventsService;


