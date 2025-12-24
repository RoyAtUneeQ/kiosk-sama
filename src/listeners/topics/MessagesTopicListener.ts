import type { PubSubMessage } from 'uneeq-state-manager';
import type { SessionContextType } from '@/contexts/SessionContext';
import type { TopicListener } from '@/listeners/types';
import { MessageFactory } from '@/factories/MessageFactory';

export class MessagesTopicListener implements TopicListener<any>
{
  topicId = 'messages';

  execute(messagesPayload: PubSubMessage<any>, session: SessionContextType): void {
    console.info('MessagesTopicListener', messagesPayload.data );
    session.actions.addMessageToHistory(MessageFactory.createAssistantMessage(messagesPayload.data));
  }
}
