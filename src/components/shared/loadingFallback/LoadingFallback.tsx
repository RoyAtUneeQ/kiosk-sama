import React from 'react';
import './LoadingFallback.scss';

interface LoadingFallbackProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showSpinner?: boolean;
  className?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  size = 'medium',
  showSpinner = true,
  className = ''
}) => {
  return (
    <div className={`loading-fallback loading-fallback--${size} ${className}`}>
      {showSpinner && (
        <div className="loading-fallback__spinner" aria-hidden="true">
          <div className="loading-fallback__spinner-ring" />
        </div>
      )}
      <span className="loading-fallback__message">{message}</span>
    </div>
  );
};

export default LoadingFallback;
