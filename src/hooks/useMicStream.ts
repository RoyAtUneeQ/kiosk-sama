import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type UseMicStreamOptions = {
  onAudio: (audio: Float32Array) => void;
  targetSampleRate?: number; // default 16000
  processorBufferSize?: 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384; // default 4096
};

export type UseMicStreamResult = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  listening: boolean;
  error: string | null;
};

function downsampleToTarget(input: Float32Array, inputSampleRate: number, targetSampleRate: number): Float32Array {
  if (targetSampleRate === inputSampleRate) return input;
  if (targetSampleRate > inputSampleRate) {
    // No upsampling in this helper; just return input
    return input;
  }
  const sampleRateRatio = inputSampleRate / targetSampleRate;
  const newLength = Math.floor(input.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < newLength) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < input.length; i += 1) {
      accum += input[i];
      count += 1;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

export function useMicStream(options: UseMicStreamOptions): UseMicStreamResult {
  const { onAudio, targetSampleRate = 16000, processorBufferSize = 4096 } = options;

  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    if (listening) return;
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      mediaStreamRef.current = mediaStream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(mediaStream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(processorBufferSize, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        try {
          const input = event.inputBuffer.getChannelData(0);
          const resampled = downsampleToTarget(input, audioContext.sampleRate, targetSampleRate);
          if (resampled.length > 0) onAudio(resampled);
        } catch (e) {
          // Ignore transient errors
        }
      };

      source.connect(processor);
      // Avoid feedback by routing through a 0-gain node
      const muteGain = audioContext.createGain();
      muteGain.gain.value = 0;
      muteGainRef.current = muteGain;
      processor.connect(muteGain);
      muteGain.connect(audioContext.destination);
      setListening(true);
    } catch (e: any) {
      setError(e?.message || 'Microphone start failed');
    }
  }, [listening, onAudio, processorBufferSize, targetSampleRate]);

  const stop = useCallback(async () => {
    if (!listening) return;
    try {
      processorRef.current?.disconnect();
      muteGainRef.current?.disconnect();
      sourceRef.current?.disconnect();
      processorRef.current = null;
      sourceRef.current = null;
      muteGainRef.current = null;

      if (audioContextRef.current) {
        try { await audioContextRef.current.close(); } catch {}
        audioContextRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    } finally {
      setListening(false);
    }
  }, [listening]);

  useEffect(() => () => { void stop(); }, [stop]);

  return useMemo(() => ({ start, stop, listening, error }), [start, stop, listening, error]);
}

export default useMicStream;


