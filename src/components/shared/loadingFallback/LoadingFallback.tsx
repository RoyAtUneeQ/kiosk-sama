import React from 'react';
import './LoadingFallback.scss';

interface LoadingFallbackProps {
  /** Loading message to display */
  message?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show spinner */
  showSpinner?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Lightweight loading fallback component for Suspense boundaries,
 * config loading, and other simple loading states.
 * 
 * Use this instead of inline loading divs for consistency.
 * For full-screen loading experiences, use the Loading component instead.
 */
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
