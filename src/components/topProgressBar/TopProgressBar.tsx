import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import './TopProgressBar.scss';

interface TopProgressBarProps {
  /** Whether the progress bar should be visible */
  isVisible: boolean;
  /** Custom className for additional styling */
  className?: string;
  /** Progress bar height in rem */
  height?: number;
  /** Animation speed in seconds */
  animationSpeed?: number;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({
  isVisible,
  className = '',
  height = 0.25,
  animationSpeed = 3
}) => {
  const { t } = useTranslation();
  const [currentMessage, setCurrentMessage] = useState<string>('');

  useEffect(() => {
    if (isVisible) {
      // Get all processing phrases from the current language
      const phrases = t('processing.phrases', { returnObjects: true }) as string[];
      
      if (Array.isArray(phrases) && phrases.length > 0) {
        // Select a random phrase
        const randomIndex = Math.floor(Math.random() * phrases.length);
        setCurrentMessage(phrases[randomIndex]);
      } else {
        // Fallback to default message
        setCurrentMessage('Processing your request...');
      }
    }
  }, [isVisible, t]);

  return (
    <div 
      className={`top-progress-bar ${isVisible ? 'top-progress-bar--visible' : 'top-progress-bar--hidden'} ${className}`}
      style={{
        '--progress-height': `${height}rem`,
        '--animation-speed': `${animationSpeed}s`
      } as React.CSSProperties}
    >
      <div className="top-progress-bar__container">
        <div className="top-progress-bar__text">{currentMessage}</div>
      </div>
    </div>
  );
};

export default TopProgressBar;
