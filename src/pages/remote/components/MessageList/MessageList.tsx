import './MessageList.scss';
import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types/transport/Message';
import { MessageBubble, ThreeDotsLoader } from '@/components';
import type { FlightsSearchData, FareSelectionData, BookingSummaryData } from '@/types/booking';

interface MessageListProps {
  messages: Message[];
  messageCards: Record<string, BookingSummaryData | FlightsSearchData | FareSelectionData | null>;
  renderCardsForMessage?: (message: Message, cardData: BookingSummaryData | FlightsSearchData | FareSelectionData | null) => React.ReactNode;
  awaitingPromptResponse?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, messageCards, renderCardsForMessage, awaitingPromptResponse = false }) => {
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
  
  // Auto-scroll to most recent message or loader
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages, awaitingPromptResponse, messageCards]);

    
  return (
    <div className="messages-container">
      {messageGroups.map((group) => {
        // Look up card data for this specific message ID
        // Cards are stored per message ID, so they stay with the message that originally triggered them
        const cardData = messageCards[group.id] || null;
        
        console.log(`[MessageList] Rendering message ${group.id}:`, {
          sender: group.sender,
          hasCardData: !!cardData,
          cardDataType: cardData ? (Array.isArray(cardData) ? `Array[${cardData.length}]` : 'Object') : 'null',
          contentPreview: group.content.substring(0, 50)
        });
        
        // Determine if cards should be shown for this message
        const cards = renderCardsForMessage 
          ? renderCardsForMessage(group.message, cardData)
          : null;
        
        console.log(`[MessageList] Cards rendered for ${group.id}:`, {
          hasCards: !!cards,
          cardsType: cards ? typeof cards : 'null'
        });
        
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
      {awaitingPromptResponse && <ThreeDotsLoader />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
