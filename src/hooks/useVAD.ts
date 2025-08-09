import { useEffect, useMemo, useRef, useState } from 'react';
import { useMicVAD } from '@ricky0123/vad-react';

export interface UseVADOptions {
  silenceDurationMs?: number;
  minSpeechDurationMs?: number;
  onSpeechEnd?: (audio: Float32Array) => void;
  onSpeechStart?: () => void;
}

export interface UseVADResult {
  listening: boolean;
  speaking: boolean;
  loading: boolean;
  errored: string | false;
  start: () => void;
  stop: () => void;
}

const ORT_ASSETS = {
  wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/',
  modelURL: '/silero_vad.onnx',
};

export function useVAD(options: UseVADOptions = {}): UseVADResult {
  const {
    silenceDurationMs = 400,
    minSpeechDurationMs = 120,
    onSpeechEnd,
    onSpeechStart,
  } = options;

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    console.log('[useVAD] crossOriginIsolated:', (self as any).crossOriginIsolated === true);
  }, []);

  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      setSpeaking(true);
      onSpeechStart?.();
    },
    onSpeechEnd: (audio: Float32Array) => {
      const ms = (audio.length / 16000) * 1000;
      if (ms >= minSpeechDurationMs) onSpeechEnd?.(audio);
      setSpeaking(false);
    },
    silenceDurationMs,
    modelURL: ORT_ASSETS.modelURL,
    ortConfig: () => ({
      wasmPaths: ORT_ASSETS.wasmPaths,
    }),
  } as any);

  const start = () => {
    if (startedRef.current) return;
    console.log('[useVAD] start()');
    vad?.start();
    startedRef.current = true;
    setListening(true);
  };

  const stop = () => {
    if (!startedRef.current) return;
    console.log('[useVAD] stop()');
    vad?.pause();
    startedRef.current = false;
    setListening(false);
    setSpeaking(false);
  };

  useEffect(() => () => stop(), []);

  return useMemo(
    () => ({ listening, speaking, loading: vad?.loading ?? false, errored: vad?.errored ?? false, start, stop }),
    [listening, speaking, vad?.loading, vad?.errored]
  );
}

export default useVAD;