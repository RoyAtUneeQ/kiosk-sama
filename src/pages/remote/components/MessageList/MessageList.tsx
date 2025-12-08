import './MessageList.scss';
import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types/transport/Message';
import { MessageBubble } from '@/components';
import { MessageSender } from '@/types';

interface MessageListProps {
  messages: Message[];
  renderCardsForMessage?: (message: Message, isLastAssistantMessage: boolean) => React.ReactNode;
}

const MessageList: React.FC<MessageListProps> = ({ messages, renderCardsForMessage }) => {
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
        lastTimestamp: lastMessage.timestamp,
        message: lastMessage // Keep reference to the actual message for card rendering
      };
    });
  }, [messages]);

  const lastGroup = messageGroups.at(-1);
  
  // Find the last assistant message to determine where to show cards
  const lastAssistantMessageId = React.useMemo(() => {
    // Find the last message group that is from the assistant
    for (let i = messageGroups.length - 1; i >= 0; i--) {
      if (messageGroups[i].sender === MessageSender.Assistant) {
        return messageGroups[i].id;
      }
    }
    return null;
  }, [messageGroups]);
  
  // Auto-scroll to most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    
  return (
    <div className="messages-container">
      {messageGroups.map((group) => {
        const isLastAssistantMessage = group.id === lastAssistantMessageId;
        // Determine if cards should be shown for this message
        const cards = renderCardsForMessage 
          ? renderCardsForMessage(group.message, isLastAssistantMessage)
          : null;
        
        return (
          <React.Fragment key={group.id}>
            <MessageBubble
              content={group.content}
              sender={group.sender}
              timestamp={group.lastTimestamp}
              shouldAnimate={group.id === lastGroup?.id}
              onAnimationStart={() => {
                // Animation started callback
              }}
            />
            {cards}
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
