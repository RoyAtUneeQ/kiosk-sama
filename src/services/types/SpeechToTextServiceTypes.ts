/**
 * Configuration options for `SpeechToTextService`.
 */
export interface SpeechToTextServiceOptions {
  /** Base URL of the backend for token requests. */
  apiBaseUrl: string;
  /** API key for backend authentication. */
  apiKey: string;
  /** Speech-to-text provider (defaults to 'deepgram'). */
  provider?: string;
  /** STT model to use (defaults to 'nova-3'). */
  model?: string;
  /** Language code (defaults to 'en-US'). */
  language?: string;
  /** Audio encoding (defaults to 'linear16'). */
  encoding?: string;
  /** Sample rate in Hz (defaults to 16000). */
  sampleRate?: number;
  /** Number of audio channels (defaults to 1). */
  channels?: number;
  /** Enable smart formatting (defaults to true). */
  smartFormat?: boolean;
  /** Token TTL in seconds (defaults to 60). */
  tokenTtl?: number;
}

/**
 * Event callbacks for `SpeechToTextService` state changes.
 */
export interface SpeechToTextServiceCallbacks {
  /** Invoked when the service is ready to receive audio. */
  onReady?: () => void;
  /** Invoked when processing starts (partial transcript received). */
  onProcessingStart?: () => void;
  /** Invoked when processing ends (final transcript received). */
  onProcessingEnd?: () => void;
  /** Invoked with partial transcript text. */
  onPartial?: (text: string) => void;
  /** Invoked with final transcript text. */
  onFinal?: (text: string) => void;
  /** Invoked when an error occurs. */
  onError?: (error: any) => void;
  /** Invoked when the connection closes. */
  onClose?: () => void;
}

/**
 * Current state of the SpeechToTextService.
 */
export interface SpeechToTextState {
  /** Whether the service is ready to receive audio. */
  isReady: boolean;
  /** Whether the service is currently processing audio. */
  isProcessing: boolean;
  /** Last received final transcript text. */
  text: string;
  /** Whether the service is connected. */
  isConnected: boolean;
}
