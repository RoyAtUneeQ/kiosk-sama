import './GlowBackground.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  reactiveIntensity?: number; // multiplier for the amplitude effect (default 0.6)
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
  reactiveIntensity = 0.6,
}) => {
  const [level, setLevel] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!reactiveActive) {
      setLevel(0);
      return () => {};
    }

    let isCancelled = false;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (isCancelled) return;
        streamRef.current = stream;
        // Support older WebKit by probing for webkitAudioContext without using 'any'
        const webkitCtx = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const AudioCtor = (window.AudioContext || webkitCtx) as typeof AudioContext;
        const audioCtx = new AudioCtor();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024; // balanced responsiveness
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(dataArray);
          // Compute root mean square (RMS) around 128 bias
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128; // -1..1
            sumSquares += v * v;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length); // 0..1
          // Enhanced sensitivity for pulsing effect
          const target = Math.min(1, rms * 4.0); // increased boost for more dramatic pulsing
          setLevel(prev => prev * 0.5 + target * 0.5); // faster response for pulsing
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (err) {
        // If user denies mic or no device, keep level at 0
        console.warn('GlowBackground: mic access failed', err);
        setLevel(0);
      }
    };

    setup();

    return () => {
      isCancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { sourceRef.current?.disconnect(); } catch (_error) { void _error; }
      try { analyserRef.current?.disconnect(); } catch (_error) { void _error; }
      if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close().catch(() => {});
      streamRef.current?.getTracks().forEach(t => t.stop());
      sourceRef.current = null;
      analyserRef.current = null;
      audioCtxRef.current = null;
      streamRef.current = null;
    };
  }, [reactiveActive]);

  const reactiveScale = useMemo(() => {
    // Map base 1.0 to 1.0..(1+intensity) for pulsing effect
    return 1 + level * (reactiveIntensity ?? 0.6);
  }, [level, reactiveIntensity]);

  type ContainerStyle = CSSProperties & { ['--reactive']?: number };
  type BallStyle = CSSProperties & { ['--delay']?: string; ['--size']?: number; ['--speed']?: string };

  const containerStyle: ContainerStyle = { ['--reactive']: reactiveScale };

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
    </div>
  );
};

export default GlowBackground;

