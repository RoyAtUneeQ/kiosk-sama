import './GlowBackground.scss';
import React, { useMemo } from 'react';
import type { CSSProperties } from 'react';

export interface GlowBallConfig {
  delay?: string; // e.g., '0s', '-4s'
  size?: number;  // multiplier (0..1+)
  speed?: string; // e.g., '20s'
  style?: React.CSSProperties; // optional extra styles
}

export interface GlowBackgroundProps {
  className?: string;
  ariaHidden?: boolean;
  isLargeScreen?: boolean;
  reactiveActive?: boolean;
  reactiveIntensity?: number;
  dimOpacity?: number;
}

// no-op

const GlowBackground: React.FC<GlowBackgroundProps> = ({
  className = '',
  ariaHidden = true,
  isLargeScreen = false,
  reactiveActive = false,
  dimOpacity = 0.28,
}) => {
  // Compute glow balls based on screen size to reduce GPU work on large displays
  const balls = useMemo<GlowBallConfig[]>(() => {
    if (isLargeScreen) {
      return [
        { delay: '0s', size: 0.6, speed: '30s' },
        { delay: '-6s', size: 0.5, speed: '34s' },
        { delay: '-12s', size: 0.7, speed: '38s' },
      ];
    }
    return [
      { delay: '0s', size: 0.55, speed: '26s' },
      { delay: '-4s', size: 0.75, speed: '32s' },
      { delay: '-8s', size: 0.45, speed: '24s' },
      { delay: '-12s', size: 0.65, speed: '30s' },
      { delay: '-16s', size: 0.35, speed: '18s' },
      { delay: '-20s', size: 0.85, speed: '36s' },
    ];
  }, [isLargeScreen]);
  // Overlay opacity: when reactiveActive (listening) is true, show vibrant colors (no overlay)
  // When false, slightly darken the glow to indicate idle state
  const overlayOpacity = useMemo(() => {
    const clamped = Math.max(0, Math.min(1, dimOpacity));
    return reactiveActive ? 0 : clamped;
  }, [reactiveActive, dimOpacity]);

  type ContainerStyle = CSSProperties & { ['--overlay']?: number };
  type BallStyle = CSSProperties & { ['--delay']?: string; ['--size']?: number; ['--speed']?: string };

  const containerStyle: ContainerStyle = { ['--overlay']: overlayOpacity };

  return (
    <div className={`glow-container ${className}`} aria-hidden={ariaHidden} style={containerStyle}>
      {balls.map((ball, index) => {
        const cssVars: BallStyle = {
          ['--delay']: ball.delay ?? '0s',
          ['--size']: ball.size ?? 0.5,
          ['--speed']: ball.speed ?? '20s',
          ...ball.style,
        };
        return <div key={index} className="ball" style={cssVars} />;
      })}
      <div className="overlay" />
    </div>
  );
};

export default GlowBackground;

