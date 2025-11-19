import { StateManager as RawStateManager } from 'uneeq-state-manager';
import type { PersistentStateWrapper as IPersistentStateWrapper } from '@/types/stateManager';

/**
 * Dynamic wrapper around StateManager that always reads current sessionId from context.
 * Provides clean API while handling session lifecycle automatically.
 *
 * @example
 * const wrapper = new PersistentStateWrapper(rawManager, workspaceId, () => state.uneeq?.sessionId);
 * await wrapper.get('booking'); // No need to pass sessionId!
 */
export class PersistentStateWrapper implements IPersistentStateWrapper {
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

  /**
   * Get current session, throw if not available
   */
  private getCurrentSession() {
    console.log('[StateManagerSDK] getCurrentSession() called');
    const sessionId = this.getSessionIdFn();
    console.log('[StateManagerSDK] Retrieved sessionId from getter:', sessionId);

    if (!sessionId) {
      console.error('[StateManagerSDK] ❌ No sessionId available!');
      throw new Error(
        'PersistentState: No active UneeQ session. ' +
        'Ensure UneeQ session is LIVE before accessing persistent state.'
      );
    }

    console.log('[StateManagerSDK] Creating session accessor for workspace:', this.workspaceId, 'session:', sessionId);
    const sessionAccessor = this.rawManager.workspace(this.workspaceId).session(sessionId);
    console.log('[StateManagerSDK] Session accessor created successfully');
    return sessionAccessor;
  }

  async get<T>(key: string): Promise<T | null> {
    console.log(`[StateManagerSDK] 📖 GET called for key: "${key}"`);
    try {
      const session = this.getCurrentSession();
      console.log(`[StateManagerSDK] Calling session.get() on SDK...`);
      const result = await session.get<T>(key);
      console.log(`[StateManagerSDK] ✅ GET successful for "${key}":`, result);
      return result;
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ GET failed for "${key}":`, error);
      console.error(`[StateManagerSDK] Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    console.log(`[StateManagerSDK] 💾 SET called for key: "${key}"`);
    console.log(`[StateManagerSDK] Data to set:`, data);
    try {
      const session = this.getCurrentSession();
      console.log(`[StateManagerSDK] Calling session.set() on SDK...`);
      await session.set(key, data);
      console.log(`[StateManagerSDK] ✅ SET successful for "${key}"`);
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ SET failed for "${key}":`, error);
      console.error(`[StateManagerSDK] Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        key,
        data
      });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    console.log(`[StateManagerSDK] 🗑️ DELETE called for key: "${key}"`);
    try {
      const session = this.getCurrentSession();
      console.log(`[StateManagerSDK] Calling session.delete() on SDK...`);
      await session.delete(key);
      console.log(`[StateManagerSDK] ✅ DELETE successful for "${key}"`);
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ DELETE failed for "${key}":`, error);
      throw error;
    }
  }

  async getAll<T>(): Promise<T> {
    console.log(`[StateManagerSDK] 📚 GETALL called`);
    try {
      const session = this.getCurrentSession();
      console.log(`[StateManagerSDK] Calling session.getAll() on SDK...`);
      const result = await session.getAll<T>();
      console.log(`[StateManagerSDK] ✅ GETALL successful:`, result);
      return result;
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ GETALL failed:`, error);
      throw error;
    }
  }

  async getInfo(): Promise<any> {
    console.log(`[StateManagerSDK] ℹ️  GETINFO called`);
    try {
      const session = this.getCurrentSession();
      console.log(`[StateManagerSDK] Calling session.getInfo() on SDK...`);
      const result = await session.getInfo();
      console.log(`[StateManagerSDK] ✅ GETINFO successful:`, result);
      return result;
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ GETINFO failed:`, error);
      throw error;
    }
  }

  async keepAlive(): Promise<void> {
    console.log(`[StateManagerSDK] 💓 KEEPALIVE called`);
    try {
      const session = this.getCurrentSession();
      console.log(`[StateManagerSDK] Calling session.keepAlive() on SDK...`);
      await session.keepAlive();
      console.log(`[StateManagerSDK] ✅ KEEPALIVE successful`);
    } catch (error) {
      console.error(`[StateManagerSDK] ❌ KEEPALIVE failed:`, error);
      throw error;
    }
  }

  async end(): Promise<void> {
    console.log(`[StateManagerSDK] 🛑 END called`);
    try {
      const session = this.getCurrentSession();
      console.log(`[StateManagerSDK] Calling session.end() on SDK...`);
      await session.end();
      console.log(`[StateManagerSDK] ✅ END successful`);
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
}
