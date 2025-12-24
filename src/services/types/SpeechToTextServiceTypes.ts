export interface SpeechToTextServiceOptions {
  apiBaseUrl: string;
  apiKey: string;
  provider?: string;
  model?: string;
  language?: string;
  encoding?: string;
  sampleRate?: number;
  channels?: number;
  smartFormat?: boolean;
  tokenTtl?: number;
}

export interface SpeechToTextServiceCallbacks {
  onReady?: () => void;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export interface SpeechToTextState {
  isReady: boolean;
  isProcessing: boolean;
  text: string;
  isConnected: boolean;
}
