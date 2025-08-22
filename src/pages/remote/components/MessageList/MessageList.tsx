import './MessageList.scss';
import React from 'react';
import type { RefObject } from 'react';
import type { Message } from '@/types/transport/Message';
import { MessageBubble } from '@/components';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}



const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, messagesEndRef }) => {
  const getTimestamp = (timestamp: Date | string) => 
    (typeof timestamp === 'string' ? new Date(timestamp) : timestamp);

  const messageGroups = React.useMemo(() => {
    const groups = new Map<string, Message[]>();
    const seenOrder: string[] = [];

    messages.forEach(message => {
      if (!groups.has(message.id)) {
        groups.set(message.id, []);
        seenOrder.push(message.id);
      }
      groups.get(message.id)!.push(message);
    });

    // Sort messages within each group by timestamp
    groups.forEach(group => {
      group.sort((a, b) => getTimestamp(a.timestamp).getTime() - getTimestamp(b.timestamp).getTime());
    });

    return seenOrder.map(id => ({
      id,
      messages: groups.get(id)!,
      content: groups.get(id)!.at(-1)!.content, // Use only the last message's content (accumulated)
      sender: groups.get(id)![0].sender,
      lastTimestamp: groups.get(id)!.at(-1)!.timestamp
    }));
  }, [messages]);

  // Find the latest assistant message to animate
  const latestAssistantMessageId = React.useMemo(() => {
    for (let i = messageGroups.length - 1; i >= 0; i--) {
      if (messageGroups[i].sender === 'assistant') {
        return messageGroups[i].id;
      }
    }
    return null;
  }, [messageGroups]);

  return (
    <div className="messages-container">
      {messageGroups.map(group => (
        <MessageBubble
          key={group.id}
          content={group.content}
          sender={group.sender}
          timestamp={group.lastTimestamp}
          shouldAnimate={group.id === latestAssistantMessageId}
        />
      ))}
      {isTyping && (
        <MessageBubble isTyping={true} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

