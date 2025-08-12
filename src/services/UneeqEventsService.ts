import type { Event as UneeqEvent } from '@/types';

type Handler = (event: UneeqEvent) => Promise<void> | void;

class UneeqEventsService {
  private handlers: Map<string, Handler> = new Map();

  register(type: string, handler: Handler) {
    this.handlers.set(type, handler);
  }

  unregister(type: string) {
    this.handlers.delete(type);
  }

  async dispatch(event: UneeqEvent) {
    const handler = this.handlers.get(event.uneeqMessageType);
    if (!handler) return;
    await handler(event);
  }
}

export default new UneeqEventsService();


