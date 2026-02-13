import './MessageList.scss';
import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types/transport/Message';
import { MessageBubble, ThreeDotsLoader } from '@/components';
import type { MessageCardSet } from '@/types/booking';

interface MessageListProps {
  messages: Message[];
  messageCards: Record<string, MessageCardSet>;
  renderCardsForMessage?: (message: Message, cardData: MessageCardSet | undefined) => React.ReactNode;
  awaitingPromptResponse?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, messageCards, renderCardsForMessage, awaitingPromptResponse = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageAnimationRef = useRef<{ isAnimating: boolean; messageId: string | null }>({ isAnimating: false, messageId: null });
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Helper function to perform autoscroll
  const performAutoscroll = React.useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  // Auto-scroll to most recent message or loader
  useEffect(() => {
    performAutoscroll();
    
    // Reset animation tracking when last message changes
    const currentLastMessageId = lastGroup?.id || null;
    if (lastMessageAnimationRef.current.messageId !== currentLastMessageId) {
      // Clear any existing scroll interval when message changes
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      lastMessageAnimationRef.current = { isAnimating: false, messageId: currentLastMessageId };
    }
  }, [messages, awaitingPromptResponse, messageCards, performAutoscroll, lastGroup?.id]);

  // Handle animation state changes for the last message
  const handleAnimationStateChange = React.useCallback((isAnimating: boolean, messageId: string) => {
    const currentLastMessageId = lastGroup?.id || null;
    
    // Only handle animation state for the current last message
    if (messageId !== currentLastMessageId) {
      return;
    }

    const wasAnimating = lastMessageAnimationRef.current.isAnimating;
    const wasLastMessage = lastMessageAnimationRef.current.messageId === messageId;
    
    lastMessageAnimationRef.current = { isAnimating, messageId };

    // If animation just started, set up periodic scrolling
    if (isAnimating && (!wasAnimating || !wasLastMessage)) {
      // Clear any existing interval
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      
      // Scroll periodically during animation to keep up with growing content
      scrollIntervalRef.current = setInterval(() => {
        performAutoscroll();
      }, 200); // Scroll every 200ms during animation
    }
    
    // If animation just completed, scroll one final time and clear interval
    if (!isAnimating && wasAnimating && wasLastMessage) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      // Final scroll when animation completes
      setTimeout(() => {
        performAutoscroll();
      }, 100); // Small delay to ensure DOM has updated
    }
  }, [performAutoscroll, lastGroup?.id]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

    
  return (
    <div className="messages-container">
      {messageGroups.map((group) => {
        // Look up card data for this specific message ID
        // Cards are stored per message ID, so they stay with the message that originally triggered them
        const cardData = messageCards[group.id];

        // Determine if cards should be shown for this message
        const cards = renderCardsForMessage
          ? renderCardsForMessage(group.message, cardData)
          : null;
        
        return (
          <React.Fragment key={group.id}>
            <MessageBubble
              content={group.content}
              sender={group.sender}
              timestamp={group.lastTimestamp}
              shouldAnimate={group.id === lastGroup?.id && !group.message.isHistorical}
              onAnimationStart={() => {
                // When bubble first appears (after 6 chars), trigger scroll
                if (group.id === lastGroup?.id) {
                  setTimeout(() => {
                    performAutoscroll();
                  }, 50);
                }
              }}
              onAnimationStateChange={
                group.id === lastGroup?.id
                  ? (isAnimating) => handleAnimationStateChange(isAnimating, group.id)
                  : undefined
              }
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
