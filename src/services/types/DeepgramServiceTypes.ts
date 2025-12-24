export interface DeepgramServiceOptions {
  token?: string;
  model: string;
  language: string;
  encoding: string;
  sampleRate: number;
  channels: number;
  smartFormat: boolean;
  onOpen?: () => void;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}
