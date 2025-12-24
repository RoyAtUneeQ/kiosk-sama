import type { StreamClient } from '@/types/transport/StreamClient';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import type { DeepgramServiceOptions } from '../types/DeepgramServiceTypes';

export class DeepgramStreamService implements StreamClient {
  public readonly token: string;
  private readonly model: string;
  private readonly language: string;
  private readonly encoding: string;
  private readonly sampleRate: number;
  private readonly channels: number;
  private readonly smartFormat: boolean;
  
  public readonly onOpen?: () => void;
  public readonly onPartial?: (text: string) => void;
  public readonly onFinal?: (text: string) => void;
  public readonly onError?: (error: any) => void;
  public readonly onClose?: () => void;
  
  private live: any | null = null;
  private isOpen = false;

  constructor(options: DeepgramServiceOptions) {
    this.token = options.token || '';
    this.model = options.model;
    this.language = options.language;
    this.encoding = options.encoding;
    this.sampleRate = options.sampleRate;
    this.channels = options.channels;
    this.smartFormat = options.smartFormat;
    
    this.onOpen = options.onOpen;
    this.onPartial = options.onPartial;
    this.onFinal = options.onFinal;
    this.onError = options.onError;
    this.onClose = options.onClose;
  }

  public async connect(): Promise<void> {
    if (!this.token) {
      const error = new Error('DeepgramStreamService: No token provided');
      this.handleError('connect', error);
      throw error;
    }

    try {
      const live = createClient({ accessToken: this.token }).listen.live({
        model: this.model,
        language: this.language,
        encoding: this.encoding,
        sample_rate: this.sampleRate,
        channels: this.channels,
        smart_format: this.smartFormat,
      });

      this.setupEventListeners(live);
      this.live = live;
    } catch (error) {
      this.handleError('connect', error);
      throw new Error(`DeepgramStreamService connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public send(data: any): void {
    if (!this.live || !this.isOpen) {
      return;
    }

    try {
      const bufferToSend = this.convertToArrayBuffer(data);
      if (bufferToSend) {
        this.live.send(bufferToSend);
      }
    } catch (error) {
      this.handleError('send', error);
      this.onError?.(error);
    }
  }

  public close(): void {
    try {
      this.live?.finish?.();
      this.live?.close?.();
    } catch (error) {
      this.handleError('close', error);
    }
    
    this.live = null;
    this.isOpen = false;
  }

  private setupEventListeners(live: any): void {
    live.addListener(LiveTranscriptionEvents.Open, () => {
      this.isOpen = true;
      this.onOpen?.();
    });

    live.addListener(LiveTranscriptionEvents.Close, () => {
      this.isOpen = false;
      this.onClose?.();
    });

    live.addListener(LiveTranscriptionEvents.Error, (error: unknown) => {
      this.handleError('liveError', error);
      this.onError?.(error);
    });

    live.addListener(LiveTranscriptionEvents.Transcript, (message: any) => {
      this.handleTranscriptMessage(message);
    });
  }

  private handleTranscriptMessage(message: any): void {
    try {
      const isFinal = Boolean(message?.is_final);
      const text: string = message?.channel?.alternatives?.[0]?.transcript || '';
      
      if (!text) return;
      
      if (isFinal) {
        this.onFinal?.(text);
      } else {
        this.onPartial?.(text);
      }
    } catch (error) {
      this.handleError('handleTranscriptMessage', error);
      this.onError?.(error);
    }
  }

  private convertToArrayBuffer(data: any): ArrayBuffer | null {
    if (data instanceof ArrayBuffer) {
      return data;
    }
    
    if (data instanceof Int16Array) {
      return data.buffer;
    }
    
    if (data instanceof Float32Array) {
      return this.float32ToInt16Buffer(data);
    }
    
    if (Array.isArray(data)) {
      return this.float32ToInt16Buffer(new Float32Array(data));
    }
    
    return null;
  }

  private float32ToInt16Buffer(float32: Float32Array): ArrayBuffer {
    const length = float32.length;
    const int16 = new Int16Array(length);
    
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    
    return int16.buffer;
  }

  private handleError(method: string, error: unknown): void {
    console.error(`[DeepgramStreamService] ${method} failed:`, error);
  }
}

export default DeepgramStreamService;
