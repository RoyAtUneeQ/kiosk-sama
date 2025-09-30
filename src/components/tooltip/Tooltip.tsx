import './Tooltip.scss';
import React, { useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Content to display in the tooltip */
  content: string;
  /** Position of the tooltip relative to the trigger element */
  position?: TooltipPosition;
  /** Whether the tooltip is for a special element (gold styling) */
  special?: boolean;
  /** Delay before showing tooltip (in milliseconds) */
  showDelay?: number;
  /** Delay before hiding tooltip (in milliseconds) */
  hideDelay?: number;
  /** Whether to disable the tooltip */
  disabled?: boolean;
  /** Custom className for the tooltip container */
  className?: string;
  /** Children element that triggers the tooltip */
  children: React.ReactNode;
  /** Whether to show tooltip on focus (for accessibility) */
  showOnFocus?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  special = false,
  showDelay = 300,
  hideDelay = 100,
  disabled = false,
  className = '',
  children,
  showOnFocus = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldShow = isVisible && !disabled && content.trim().length > 0;

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const showTooltip = () => {
    clearTimeouts();
    if (!disabled && content.trim().length > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);
    }
  };

  const hideTooltip = () => {
    clearTimeouts();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  const handleMouseEnter = () => {
    showTooltip();
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleFocus = () => {
    if (showOnFocus) {
      showTooltip();
    }
  };

  const handleBlur = () => {
    hideTooltip();
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  // Handle escape key to hide tooltip
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        clearTimeouts();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  const tooltipClasses = [
    'tooltip',
    `tooltip-${position}`,
    shouldShow ? 'tooltip-visible' : '',
    special ? 'tooltip-special' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={`tooltip-container ${className}`}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <div
        className={tooltipClasses}
        role="tooltip"
        aria-hidden={!shouldShow}
      >
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
