import './MessageBubble.scss';
import React from 'react';
import { useAnimatedText } from '@/hooks';
import { MessageSender } from '@/types/transport';

export interface MessageBubbleProps {
  content?: string;
  sender?: MessageSender;
  timestamp?: Date | string;
  shouldAnimate?: boolean;
  onAnimationStart?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content = '',
  sender = MessageSender.Assistant,
  timestamp,
  shouldAnimate = false,
  onAnimationStart
}) => {
  const { displayedText, startAnimation, isAnimating, currentCharIndex } = useAnimatedText(content, {
    speed: 50,
    delay: 0,
    enabled: shouldAnimate
  });

  const isAssistantAnimating = shouldAnimate && sender === MessageSender.Assistant && isAnimating;
  
  // Start animation when content or animation settings change
  React.useEffect(() => {
    if (shouldAnimate) startAnimation();
  }, [content, shouldAnimate, startAnimation]);
  
  // Trigger animation start callback when threshold reached
  React.useEffect(() => {
    if (displayedText.length === 6 && shouldAnimate && onAnimationStart) {
      onAnimationStart();
    }
  }, [displayedText.length, shouldAnimate, onAnimationStart]);

  // Hide bubble until minimum characters are displayed (only for assistant messages)
  if (sender === MessageSender.Assistant && displayedText.length < 6 && currentCharIndex < 6) {
    return null;
  }

  // Render message content with animation effects
  const renderText = () => {
    if (!isAssistantAnimating) return content;
    
    return displayedText.split('').map((char, index) => {
      const isCurrentChar = index === currentCharIndex - 1;
      const isInLastThree = index >= currentCharIndex - 4 && index < currentCharIndex - 1;
      const recentPosition = currentCharIndex - 2 - index; // 0 = most recent, 2 = oldest
      
      let className = '';
      if (isCurrentChar) {
        className = 'typing-char';
      } else if (isInLastThree && recentPosition >= 0) {
        className = `gradient-char gradient-char-${recentPosition}`;
      }
      
      return <span key={index} className={className}>{char}</span>;
    });
  };

  // Format timestamp for display
  const formattedTime = timestamp && 
    (typeof timestamp === 'string' ? new Date(timestamp) : timestamp).toLocaleTimeString();

  return (
    <div className={`message-bubble ${sender}-message`}>
      <div className="message-bubble-content">
        <p>{isAssistantAnimating ? renderText() : content}</p>
        {formattedTime && <span className="message-bubble-time">{formattedTime}</span>}
      </div>
    </div>
  );
};

export default MessageBubble;
