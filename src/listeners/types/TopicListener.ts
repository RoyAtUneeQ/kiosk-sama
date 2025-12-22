import type { PubSubMessage } from 'uneeq-state-manager';
import type { SessionContextType } from '@/contexts/SessionContext';

/**
 * Contract implemented by concrete topic listeners for pub/sub messaging.
 */
export interface TopicListener<T = any> {
  /** Topic ID this listener handles. */
  topicId: string;
  /**
   * Execute the listener logic for the given message.
   * @param message - Incoming pub/sub message payload
   * @param session - Current session context
   */
  execute: (message: PubSubMessage<T>, session: SessionContextType) => void;
}
