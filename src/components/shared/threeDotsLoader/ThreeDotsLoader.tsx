import React from 'react';
import './ThreeDotsLoader.scss';

/**
 * ThreeDotsLoader component displays an animated three dots loader
 */
export const ThreeDotsLoader: React.FC = () => {
  return (
    <div className="three-dots-loader">
      <div className="three-dots-loader-content">
        <div className="three-dots-container">
          <span className="dot dot-1"></span>
          <span className="dot dot-2"></span>
          <span className="dot dot-3"></span>
        </div>
      </div>
    </div>
  );
};

export default ThreeDotsLoader;

