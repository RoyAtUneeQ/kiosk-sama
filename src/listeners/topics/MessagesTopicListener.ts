import type { PubSubMessage } from 'uneeq-state-manager';
import type { SessionContextType } from '@/contexts/SessionContext';
import type { TopicListener } from '@/listeners/types';
import { MessageFactory } from '@/factories/MessageFactory';

/**
 * Listener for 'messages' topic events.
 * Handles messages and updates the session accordingly.
 */
export class MessagesTopicListener
  implements TopicListener<any>
{
  topicId = 'messages';

  /**
   * Execute listener logic when messages are updated.
   * Logs the event and updates session state based on the messages.
   */
  execute(messagesPayload: PubSubMessage<any>, session: SessionContextType): void {
    console.info('MessagesTopicListener', messagesPayload.data );
    session.actions.addMessageToHistory(MessageFactory.createAssistantMessage(messagesPayload.data));
  }
}
