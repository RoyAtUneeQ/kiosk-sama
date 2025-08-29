import './ThinkingIndicator.scss';
import React from 'react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="thinking-indicator">
      <div className="gradient-flow">
        <div className="gradient-wave gradient-wave-1"></div>
        <div className="gradient-wave gradient-wave-2"></div>
        <div className="gradient-wave gradient-wave-3"></div>
      </div>
      <div className="thinking-dots">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
