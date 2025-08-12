type EventHandler = (payload: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private url: string | null = null;
  private connectPromise: Promise<void> | null = null;

  on(type: string, handler: EventHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  private emit(type: string, payload: any) {
    this.handlers.get(type)?.forEach((h) => {
      try { h(payload); } catch {}
    });
    this.handlers.get('*')?.forEach((h) => {
      try { h({ type, payload }); } catch {}
    });
  }

  async connect(url: string): Promise<void> {
    // Reuse existing connection when possible
    if (this.ws && this.url === url) {
      if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
      if (this.ws.readyState === WebSocket.CONNECTING) {
        // Return pending promise so callers correctly await the open event
        if (this.connectPromise) return this.connectPromise;
        // Fallback: create a one-off awaiter for the next open
        return new Promise((resolve) => {
          const off = this.on('open', () => { off(); resolve(); });
        });
      }
      // If CLOSING or CLOSED, we'll proceed to recreate
    }

    // If switching target URL, close existing socket first
    if (this.ws && this.url !== url) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }

    this.url = url;

    this.connectPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => {
          this.emit('open', {});
          resolve();
          this.connectPromise = null;
        };
        this.ws.onmessage = (event) => {
          let payload: any = event.data;
          try {
            payload = JSON.parse(event.data);
          } catch {
            // keep raw payload when not JSON
          }
          const type = payload?.type || 'message';
          this.emit(type, payload);
        };
        this.ws.onerror = (err) => {
          this.emit('error', err);
        };
        this.ws.onclose = () => {
          this.emit('close', {});
        };
      } catch (e) {
        this.connectPromise = null;
        reject(e);
      }
    });

    return this.connectPromise;
  }

  send(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocketClient: socket not open');
      return;
    }
    this.ws.send(JSON.stringify(message));
  }

  close() {
    try { this.ws?.close(); } catch {}
    this.ws = null;
    this.url = null;
  }
 
}

const client = new WebSocketClient();
export default client;


