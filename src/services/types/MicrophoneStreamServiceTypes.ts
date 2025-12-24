export interface MicrophoneStreamServiceOptions {
  targetSampleRate?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  bufferSize?: number;
}

export interface MicrophoneStreamServiceCallbacks {
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onAudioChunk?: (audioChunk: Float32Array) => void;
  onError?: (error: string) => void;
}

export interface MicrophoneStreamState {
  isListening: boolean;
  error: string | null;
  audioChunk: Float32Array | null;
}
