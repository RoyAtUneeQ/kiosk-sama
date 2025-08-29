/**
 * Configuration options for `MicrophoneStreamService`.
 */
export interface MicrophoneStreamServiceOptions {
  /** Target sample rate for audio resampling (defaults to 16000). */
  targetSampleRate?: number;
  /** Enable echo cancellation (defaults to true). */
  echoCancellation?: boolean;
  /** Enable noise suppression (defaults to true). */
  noiseSuppression?: boolean;
  /** Script processor buffer size (defaults to 4096). */
  bufferSize?: number;
}

/**
 * Event callbacks for `MicrophoneStreamService` state changes.
 */
export interface MicrophoneStreamServiceCallbacks {
  /** Invoked when microphone stream starts. */
  onStreamStart?: () => void;
  /** Invoked when microphone stream stops. */
  onStreamStop?: () => void;
  /** Invoked when new audio chunk is available. */
  onAudioChunk?: (audioChunk: Float32Array) => void;
  /** Invoked when an error occurs. */
  onError?: (error: string) => void;
}

/**
 * Current state of the MicrophoneStreamService.
 */
export interface MicrophoneStreamState {
  /** Whether the microphone stream is currently active. */
  isListening: boolean;
  /** Error message if stream failed to start. */
  error: string | null;
  /** Last captured audio chunk. */
  audioChunk: Float32Array | null;
}
