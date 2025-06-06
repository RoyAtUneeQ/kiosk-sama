import React, { useEffect, useState } from 'react';
import './Loading.scss';

interface LoadingProps {
  text?: string;
  subText?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  text = 'Loading', 
  subText,
  size = 'medium',
  className = '',
  fullScreen = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  const sizeClass = `loading-${size}`;
  const visibilityClass = isVisible ? 'loading-visible' : '';
  const fullScreenClass = fullScreen ? 'loading-fullscreen' : '';
  
  return (
    <div className={`loading-container ${className} ${sizeClass} ${visibilityClass} ${fullScreenClass}`}>
      <div className="loading-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="loading-elements-container">
        <div className="loading-ring">
          <div className="loading-core"></div>
        </div>
        <div className="loading-text-container">
          {text && <div className="loading-text">{text}</div>}
          {subText && <div className="loading-subtext">{subText}</div>}
        </div>
      </div>
      
    </div>
  );
};

export default Loading;
