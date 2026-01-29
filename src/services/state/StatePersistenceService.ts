import { StateManager as RawStateManager } from 'uneeq-state-manager';
import type { StateWrapper as IStateWrapper } from '@/types/stateManager';

export class StateManagerService implements IStateWrapper {
  private readonly rawManager: RawStateManager;
  private readonly workspaceId: string;
  private readonly getSessionIdFn: () => string | undefined;

  constructor(
    rawManager: RawStateManager,
    workspaceId: string,
    getSessionIdFn: () => string | undefined
  ) {
    this.rawManager = rawManager;
    this.workspaceId = workspaceId;
    this.getSessionIdFn = getSessionIdFn;
  }

  private getCurrentSession() {
    const sessionId = this.getSessionIdFn();

    if (!sessionId) {
      console.error('[StateManagerSDK] ❌ No sessionId available!');
      throw new Error(
        'PersistentState: No active UneeQ session. ' +
        'Ensure UneeQ session is LIVE before accessing persistent state.'
      );
    }

    return this.rawManager.workspace(this.workspaceId).session(sessionId);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const session = this.getCurrentSession();
      return await session.get<T>(key);
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ GET failed for "${key}":`, error);
      throw error;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    try {
      const session = this.getCurrentSession();
      await session.set(key, data);
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ SET failed for "${key}":`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const session = this.getCurrentSession();
      await session.delete(key);
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ DELETE failed for "${key}":`, error);
      throw error;
    }
  }

  async getAll<T>(): Promise<T> {
    try {
      const session = this.getCurrentSession();
      return await session.getAll<T>();
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ GETALL failed:`, error);
      throw error;
    }
  }

  async getInfo(): Promise<any> {
    try {
      const session = this.getCurrentSession();
      return await session.getInfo();
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ GETINFO failed:`, error);
      throw error;
    }
  }

  async keepAlive(): Promise<void> {
    try {
      const session = this.getCurrentSession();
      await session.keepAlive();
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ KEEPALIVE failed:`, error);
      throw error;
    }
  }

  async end(): Promise<void> {
    try {
      const session = this.getCurrentSession();
      await session.end();
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ END failed:`, error);
      throw error;
    }
  }

  getRawInstance(): RawStateManager {
    return this.rawManager;
  }

  getSessionId(): string | undefined {
    return this.getSessionIdFn();
  }

  async publishToTopic<T>(topicId: string, data: T): Promise<{ topicId: string; sessionId: string; deliveredTo: number; publishedAt: Date }> {
    try {
      const session = this.getCurrentSession();
      return await session.publishToTopic<T>(topicId, data);
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ PUBLISHTOTOPIC failed for "${topicId}":`, error);
      throw error;
    }
  }
}

export default StateManagerService;

