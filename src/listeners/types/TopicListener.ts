import type { PubSubMessage } from 'uneeq-state-manager';
import type { SessionContextType } from '@/contexts/SessionContext';

export interface TopicListener<T = any> {
  topicId: string;
  execute: (message: PubSubMessage<T>, session: SessionContextType) => void;
}
