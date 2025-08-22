import './MessageBubble.scss';
import React from 'react';
import { useAnimatedText } from '@/hooks';

export interface MessageBubbleProps {
  content?: string;
  sender?: string;
  timestamp?: Date | string;
  shouldAnimate?: boolean;
  isTyping?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content = '',
  sender = 'assistant',
  timestamp,
  shouldAnimate = false,
  isTyping = false
}) => {
  const { displayedText, startAnimation, isAnimating, currentCharIndex } = useAnimatedText(content, {
    speed: 50,
    delay: 0,  // Remove delay to avoid empty bubble
    enabled: shouldAnimate && sender === 'assistant'
  });

  const renderAnimatedText = () => {
    if (!shouldAnimate || sender !== 'assistant' || !isAnimating) {
      return displayedText;
    }

    return displayedText.split('').map((char, index) => {
      const isCurrentChar = index === currentCharIndex - 1;
      const isInLastThree = index >= currentCharIndex - 4 && index < currentCharIndex - 1;
      const lastThreePosition = currentCharIndex - 2 - index; // 0 = most recent, 2 = oldest
      
      let className = '';
      if (isCurrentChar) {
        className = 'typing-char';
      } else if (isInLastThree && lastThreePosition >= 0) {
        className = `gradient-char gradient-char-${lastThreePosition}`;
      }
      
      return (
        <span 
          key={index} 
          className={className}
        >
          {char}
        </span>
      );
    });
  };

  React.useEffect(() => {
    if (shouldAnimate && sender === 'assistant') {
      startAnimation();
    }
  }, [content, shouldAnimate, sender, startAnimation]);

  const getTimestamp = (timestamp: Date | string) => 
    (typeof timestamp === 'string' ? new Date(timestamp) : timestamp);

  // Typing indicator component
  if (isTyping) {
    return (
      <div className="message-bubble assistant-message">
        <div className="message-bubble-content typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <span className="typing-text"></span>
        </div>
      </div>
    );
  }

  // Only show bubble when animating
  if (sender === 'assistant' && displayedText.length < 6 && currentCharIndex < 6) {
    return null;
  }

  // Regular message component
  return (
    <div className={`message-bubble ${sender}-message`}>
      <div className="message-bubble-content">
        <p>{shouldAnimate && sender === 'assistant' ? renderAnimatedText() : content}</p>
        {timestamp && (
          <span className="message-bubble-time">
            {getTimestamp(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
