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
  balls?: GlowBallConfig[];
  reactiveActive?: boolean; // when true, use mic amplitude to modulate size
  /** @deprecated Pulse removed; this prop is ignored. */
  reactiveIntensity?: number;
  /** Controls how much the background is dimmed when not listening (0..1). Default 0.28 */
  dimOpacity?: number;
}

const defaultBalls: GlowBallConfig[] = [
  { delay: '0s', size: 0.55, speed: '26s' },
  { delay: '-4s', size: 0.75, speed: '32s' },
  { delay: '-8s', size: 0.45, speed: '24s' },
];

const GlowBackground: React.FC<GlowBackgroundProps> = ({
  className = '',
  ariaHidden = true,
  balls = defaultBalls,
  reactiveActive = false,
  dimOpacity = 0.28,
}) => {
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

