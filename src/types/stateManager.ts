import { StateManager as RawStateManager } from 'uneeq-state-manager';

export interface StateWrapper {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T): Promise<void>;
  delete(key: string): Promise<void>;
  getAll<T>(): Promise<T>;
  getInfo(): Promise<any>;
  keepAlive(): Promise<void>;
  end(): Promise<void>;
  getRawInstance(): RawStateManager;
  getSessionId(): string | undefined;
  publishToTopic<T>(topicId: string, data: T): Promise<{ topicId: string; sessionId: string; deliveredTo: number; publishedAt: Date }>;
}

export interface StateManagerConfig {
  workspaceId: string;
  endpoint: string;
  apiKey: string;
  enabled?: boolean;
}

