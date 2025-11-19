import { StateManager as RawStateManager } from 'uneeq-state-manager';

/**
 * Wrapper around StateManager that auto-binds to current UneeQ session.
 * Provides clean API: state.persist.get() instead of stateManager.session(id).get()
 *
 * This interface abstracts the underlying state management functionality and ensures
 * all operations are scoped to the current session context.
 */
export interface PersistentStateWrapper {
  /**
   * Retrieve a value from persistent state by key.
   *
   * @template T The expected type of the stored value
   * @param key The key to retrieve
   * @returns Promise resolving to the stored value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value in persistent state.
   *
   * @template T The type of the value being stored
   * @param key The key to store the value under
   * @param data The data to persist
   * @returns Promise that resolves when the operation completes
   */
  set<T>(key: string, data: T): Promise<void>;

  /**
   * Delete a value from persistent state by key.
   *
   * @param key The key to delete
   * @returns Promise that resolves when the operation completes
   */
  delete(key: string): Promise<void>;

  /**
   * Retrieve all persisted state data.
   *
   * @template T The expected type of the entire state object
   * @returns Promise resolving to all stored state data
   */
  getAll<T>(): Promise<T>;

  /**
   * Retrieve information about the current session.
   *
   * @returns Promise resolving to session information
   */
  getInfo(): Promise<any>;

  /**
   * Send a keep-alive signal to maintain the session.
   *
   * @returns Promise that resolves when the keep-alive is sent
   */
  keepAlive(): Promise<void>;

  /**
   * End the current session and clean up resources.
   *
   * @returns Promise that resolves when the session has been ended
   */
  end(): Promise<void>;

  /**
   * Get the underlying raw StateManager instance for direct access if needed.
   *
   * @returns The raw StateManager instance
   */
  getRawInstance(): RawStateManager;

  /**
   * Get the ID of the current session.
   *
   * @returns The session ID or undefined if no session is active
   */
  getSessionId(): string | undefined;
}

/**
 * Configuration for State Manager from config.yaml
 *
 * This configuration object defines the connection parameters and credentials
 * needed to initialize and communicate with the UneeQ State Manager service.
 */
export interface StateManagerConfig {
  /**
   * The workspace identifier for the UneeQ service
   */
  workspaceId: string;

  /**
   * The API endpoint URL for the State Manager service
   */
  endpoint: string;

  /**
   * API key for authenticating with the State Manager service
   */
  apiKey: string;

  /**
   * Optional flag to enable or disable state manager functionality
   * @default true
   */
  enabled?: boolean;
}

