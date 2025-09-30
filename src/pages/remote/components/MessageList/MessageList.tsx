import './MessageList.scss';
import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types/transport/Message';
import { MessageBubble } from '@/components';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Convert timestamp to Date object
  const parseTimestamp = (timestamp: Date | string) => 
    typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Group and process messages by ID
  const messageGroups = React.useMemo(() => {
    const groups = new Map<string, Message[]>();
    const idOrder: string[] = [];

    // Group messages by ID
    messages.forEach(message => {
      if (!groups.has(message.id)) {
        groups.set(message.id, []);
        idOrder.push(message.id);
      }
      groups.get(message.id)!.push(message);
    });

    // Sort messages by timestamp within each group
    groups.forEach(group => {
      group.sort((a, b) => 
        parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime()
      );
    });

    // Create display groups with only needed data
    return idOrder.map(id => {
      const group = groups.get(id)!;
      const firstMessage = group[0];
      const lastMessage = group.at(-1)!;
      
      return {
        id,
        sender: firstMessage.sender,
        content: lastMessage.content,
        lastTimestamp: lastMessage.timestamp
      };
    });
  }, [messages]);

  const lastGroup = messageGroups.at(-1);
  
  // Auto-scroll to most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    
  return (
    <div className="messages-container">
      {messageGroups.map(group => (
        <MessageBubble
          key={group.id}
          content={group.content}
          sender={group.sender}
          timestamp={group.lastTimestamp}
          shouldAnimate={group.id === lastGroup?.id}
          onAnimationStart={() => {
            // Animation started callback
          }}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
