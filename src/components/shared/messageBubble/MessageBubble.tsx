import './MessageBubble.scss';
import React, { useState, useCallback } from 'react';
import { useAnimatedText } from '@/hooks';
import { MessageSender } from '@/types/transport';

export interface MessageBubbleProps {
  content?: string;
  sender?: MessageSender;
  timestamp?: Date | string;
  shouldAnimate?: boolean;
  onAnimationStart?: () => void;
  onAnimationStateChange?: (isAnimating: boolean) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content = '',
  sender = MessageSender.Assistant,
  timestamp,
  shouldAnimate = false,
  onAnimationStart,
  onAnimationStateChange
}) => {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const { displayedText, startAnimation, isAnimating, currentCharIndex } = useAnimatedText(content, {
    speed: 50,
    delay: 0,
    enabled: shouldAnimate
  });

  const isAssistantAnimating = shouldAnimate && sender === MessageSender.Assistant && isAnimating;
  
  // Track mouse movement to update tooltip position
  React.useEffect(() => {
    if (!showCopiedTooltip) return;

    const handleMouseMove = (e: MouseEvent) => {
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showCopiedTooltip]);
  
  // Handle copy to clipboard
  const handleCopyClick = useCallback(async (e: React.MouseEvent) => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      
      // Set initial tooltip position at mouse cursor
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
      });
      setShowCopiedTooltip(true);
      
      // Hide tooltip after 2 seconds
      setTimeout(() => {
        setShowCopiedTooltip(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [content]);
  
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

  // Notify parent of animation state changes
  React.useEffect(() => {
    if (onAnimationStateChange && shouldAnimate) {
      onAnimationStateChange(isAnimating);
    }
  }, [isAnimating, shouldAnimate, onAnimationStateChange]);

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
    <>
      <div className={`message-bubble ${sender}-message`}>
        <div 
          className="message-bubble-content" 
          onClick={handleCopyClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // For keyboard, position tooltip at center of bubble
              const rect = e.currentTarget.getBoundingClientRect();
              const syntheticEvent = {
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
              } as React.MouseEvent;
              handleCopyClick(syntheticEvent);
            }
          }}
        >
          <p>{isAssistantAnimating ? renderText() : content}</p>
          {formattedTime && <span className="message-bubble-time">{formattedTime}</span>}
        </div>
      </div>
      
      {showCopiedTooltip && (
        <div 
          className="copy-tooltip-overlay"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          Copied!
        </div>
      )}
    </>
  );
};

export default MessageBubble;
