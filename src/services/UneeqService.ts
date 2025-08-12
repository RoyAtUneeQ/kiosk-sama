type UneeqCtor = new (options: any) => any;

type Listener = (e: CustomEvent) => void;

class UneeqService {
  private instance: any | null = null;
  private currentSessionKey: string | null = null;
  private listeners = new Set<Listener>();
  private scriptPromises = new Map<string, Promise<void>>();

  private loadScript(src: string): Promise<void> {
    if (this.scriptPromises.has(src)) return this.scriptPromises.get(src)!;
    const promise = new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
    this.scriptPromises.set(src, promise);
    return promise;
  }

  async init(options: { scriptUrl: string; connectionUrl: string; personaId: string; uneeqOptions?: any }): Promise<any> {
    const { scriptUrl, connectionUrl, personaId, uneeqOptions = {} } = options;
    const sessionKey = `${connectionUrl}-${personaId}`;

    await this.loadScript(scriptUrl);

    if (this.currentSessionKey === sessionKey && this.instance) {
      return this.instance;
    }

    this.endSession();

    const UneeqCtorRef: UneeqCtor = (window as any).Uneeq;
    if (!UneeqCtorRef) throw new Error('Uneeq constructor not available');

    this.instance = new UneeqCtorRef({ ...uneeqOptions, connectionUrl, personaId });
    this.currentSessionKey = sessionKey;
    return this.instance;
  }

  endSession() {
    try { this.instance?.endSession?.(); } catch {}
    this.instance = null;
    this.currentSessionKey = null;
    this.removeAllListeners();
  }

  setWebRtcStatsEnabled(enableStats: boolean, enableQoS: boolean) {
    this.instance?.setWebRtcStatsEnabled?.(enableStats, enableQoS);
  }

  onMessage(listener: Listener) {
    const wrapped = (e: Event) => listener(e as CustomEvent);
    window.addEventListener('UneeqMessage', wrapped as EventListener);
    this.listeners.add(listener);
    return () => this.offMessage(listener);
  }

  offMessage(listener: Listener) {
    window.removeEventListener('UneeqMessage', listener as unknown as EventListener);
    this.listeners.delete(listener);
  }

  private removeAllListeners() {
    this.listeners.forEach((l) => this.offMessage(l));
    this.listeners.clear();
  }

  getInstance<T = any>(): T | null {
    return this.instance as T | null;
  }
}

export default new UneeqService();


