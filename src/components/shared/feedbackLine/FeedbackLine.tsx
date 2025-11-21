import './FeedbackLine.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface FeedbackLineProps {
  listening?: boolean;
  speaking?: boolean;
  thickness?: number; // pixels
  className?: string;
  /** Optional external level 0..1; when provided we won't open the mic */
  level?: number;
}

const FeedbackLine: React.FC<FeedbackLineProps> = ({
  listening = false,
  speaking = false,
  thickness = 2,
  className = '',
  level: externalLevel,
}) => {
  const [internalLevel, setInternalLevel] = useState(externalLevel ?? 0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof externalLevel === 'number') {
      setInternalLevel(Math.max(0, Math.min(1, externalLevel)));
      return;
    }
    if (!listening) {
      setInternalLevel(0);
      return () => {};
    }

    let cancelled = false;
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) return;
        streamRef.current = stream;
        const webkitCtx = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const AudioCtor = (window.AudioContext || webkitCtx) as typeof AudioContext;
        const audioCtx = new AudioCtor();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(dataArray);
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128; // -1..1
            sumSquares += v * v;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          // Soft-clipping curve to preserve dynamic range without saturating
          const gain = 3.5; // sensitivity
          const softClipped = (gain * rms) / (1 + gain * rms); // 0..~1, compress highs
          const target = Math.min(1, softClipped * 1.1);
          const alphaUp = 0.35;   // rise smoothing
          const alphaDown = 0.18; // fall smoothing
          setInternalLevel(prev => prev + (target - prev) * (target > prev ? alphaUp : alphaDown));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (_err) {
        setInternalLevel(0);
      }
    };
    setup();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { sourceRef.current?.disconnect(); } catch (_e) { void _e; }
      try { analyserRef.current?.disconnect(); } catch (_e) { void _e; }
      if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close().catch(() => {});
      streamRef.current?.getTracks().forEach(t => t.stop());
      sourceRef.current = null;
      analyserRef.current = null;
      audioCtxRef.current = null;
      streamRef.current = null;
    };
  }, [listening, externalLevel]);

  const style = useMemo(() => {
    const raw = Math.min(1, Math.max(0, (externalLevel ?? internalLevel)));
    // Gentle expansion of mid-range values without hard clamping
    const boost = listening ? 1.2 : 1.0;
    const eased = Math.pow(Math.min(1, raw * boost), 0.85);
    const intensity = eased;

    return ({
      ['--thickness']: `${Math.max(1, thickness)}px`,
      ['--intensity']: intensity,
    }) as React.CSSProperties & { ['--thickness']?: string; ['--intensity']?: number };
  }, [thickness, internalLevel, externalLevel, listening]);

  const cls = `feedback-line${listening ? ' listening' : ''}${speaking ? ' speaking' : ''}${className ? ` ${className}` : ''}`;

  return <div className={cls} style={style} aria-hidden />;
};

export default React.memo(FeedbackLine);

