import './MessageList.scss';
import React from 'react';
import type { RefObject } from 'react';
import type { Message } from '@/types/transport/Message';

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
      content: groups.get(id)!.map(msg => msg.content).join(''),
      sender: groups.get(id)![0].sender,
      lastTimestamp: groups.get(id)!.at(-1)!.timestamp
    }));
  }, [messages]);

  return (
    <div className="messages-container">
      {messageGroups.map(group => (
        <div key={group.id} className={`message ${group.sender}-message`}>
          <div className="message-bubble">
            <p>{group.content}</p>
            <span className="message-time">
              {getTimestamp(group.lastTimestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="message assistant-message">
          <div className="message-bubble typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <span className="typing-text"></span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

