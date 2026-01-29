import type { PubSubMessage } from 'uneeq-state-manager';
import type { SessionContextType } from '@/contexts/SessionContext';
import type { TopicListener } from '@/listeners/types';
import { MessageFactory } from '@/factories/MessageFactory';

export class MessagesTopicListener implements TopicListener<any>
{
  topicId = 'messages';

  execute(messagesPayload: PubSubMessage<any>, session: SessionContextType): void {
    const messageText = messagesPayload.data;

    console.info(
      '%c📥 MESSAGE FROM SERVER',
      'background: #0891b2; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      {
        messagePreview: messageText,
        fullLength: messageText?.length
      }
    );


    session.actions.addMessageToHistory(MessageFactory.createAssistantMessage(messageText));
  }
}
