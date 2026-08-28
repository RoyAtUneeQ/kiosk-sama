import type {
  LangGraphServiceOptions,
  LangGraphServiceCallbacks,
  LangGraphRun
} from '../types/LangGraphServiceTypes';

export class LangGraphService {
  private readonly options: Required<LangGraphServiceOptions>;
  private readonly callbacks: LangGraphServiceCallbacks;
  private inFlight: AbortController | null = null;

  constructor(options: LangGraphServiceOptions & LangGraphServiceCallbacks) {
    const { onTurnSent, onError, ...serviceOptions } = options;

    this.options = {
      ...serviceOptions,
      baseUrl: serviceOptions.baseUrl.replace(/\/$/, ''),
      // Not a spread default: an explicitly-undefined value would overwrite one.
      multitaskStrategy: serviceOptions.multitaskStrategy ?? 'rollback'
    };

    this.callbacks = { onTurnSent, onError };
  }

  // The reply does not come back here — the graph publishes it on the state
  // manager's `messages` topic, one publish per utterance. This is a background
  // run: it returns as soon as the server accepts the turn.
  public async sendTurn(text: string, threadId: string): Promise<void> {
    const prompt = text.trim();
    if (!prompt || !threadId) return;

    this.cancel();
    const controller = new AbortController();
    this.inFlight = controller;

    try {
      const response = await fetch(
        `${this.options.baseUrl}/threads/${encodeURIComponent(threadId)}/runs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            assistant_id: this.options.assistantId,
            // The graph's `ensure_session` node creates the state manager session
            // from the thread id, so the thread is all that needs to exist.
            if_not_exists: 'create',
            multitask_strategy: this.options.multitaskStrategy,
            input: { messages: [{ role: 'user', content: prompt }] }
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          `LangGraph run failed: ${response.status} ${await response.text()}`
        );
      }

      const run = (await response.json()) as LangGraphRun;
      this.callbacks.onTurnSent?.(run.run_id);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('[LangGraphService] Turn failed:', error);
      this.callbacks.onError?.(error);
    } finally {
      if (this.inFlight === controller) {
        this.inFlight = null;
      }
    }
  }

  // Drops a stale response only. A run the server already accepted is cancelled
  // by `multitask_strategy` when the next turn arrives, not from here.
  public cancel(): void {
    this.inFlight?.abort();
    this.inFlight = null;
  }
}

export default LangGraphService;
