import type { StreamClient } from '@/types/transport/StreamClient';
import ServiceEphemeralToken from '@/services/ServiceEphemeralToken';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'; 

type DeepgramStreamClientOptions = {
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
  onError?: (err: any) => void;
  onClose?: () => void;
};

export default class DeepgramStreamClient implements StreamClient {
  public token: string;
  public model: string;
  public language: string;
  public encoding: string;
  public sampleRate: number;
  public channels: number;
  public smartFormat: boolean;
  
  public onOpen?: () => void;
  public onPartial?: (text: string) => void;
  public onFinal?: (text: string) => void;
  public onError?: (err: any) => void;
  public onClose?: () => void;

  private live: any | null = null;
  private isOpen = false;

  constructor(opts: DeepgramStreamClientOptions) {
    this.token = opts.token || '';
    this.model = opts.model;
    this.language = opts.language;
    this.encoding = opts.encoding;
    this.sampleRate = opts.sampleRate;
    this.channels = opts.channels;
    this.smartFormat = opts.smartFormat;
    this.onOpen = opts.onOpen;
    this.onPartial = opts.onPartial;
    this.onFinal = opts.onFinal;
    this.onError = opts.onError;
    this.onClose = opts.onClose;
  }

  async connect(): Promise<void> {
    // Ensure we have a valid token; prefer provided token if present
    this.token = await ServiceEphemeralToken.ensure('deepgram', 'stt', 60);

    // Open a Live transcription session using access token (Bearer)
    const live = createClient({ accessToken: this.token }).listen.live({
      model: this.model,
      language: this.language,
      encoding: this.encoding,
      sample_rate: this.sampleRate,
      channels: this.channels,
      smart_format: this.smartFormat,
    });

    // Wire up events
    live.addListener(LiveTranscriptionEvents.Open, () => {
      this.isOpen = true;
      this.onOpen?.();
    });

    live.addListener(LiveTranscriptionEvents.Close, () => {
      this.isOpen = false;
      this.onClose?.();
    });

    live.addListener(LiveTranscriptionEvents.Error, (err: unknown) => {
      this.onError?.(err);
    });

    // Transcript events from SDK
    live.addListener(LiveTranscriptionEvents.Transcript, (msg: any /* LiveTranscriptionResult */) => {
      try {
        const isFinal = Boolean(msg?.is_final);
        const text: string = msg?.channel?.alternatives?.[0]?.transcript || '';
        if (!text) return;
        if (isFinal) this.onFinal?.(text);
        else this.onPartial?.(text);
      } catch (e) {
        this.onError?.(e);
      }
    });

    this.live = live;
  }

  send(data: any): void {
    if (!this.live || !this.isOpen) return;

    // Accept Float32Array, Int16Array, or ArrayBuffer, convert to 16-bit PCM little-endian
    let bufferToSend: ArrayBuffer;
    if (data instanceof ArrayBuffer) {
      bufferToSend = data;
    } else if (data instanceof Int16Array) {
      bufferToSend = data.buffer;
    } else if (data instanceof Float32Array) {
      bufferToSend = DeepgramStreamClient.float32ToInt16Buffer(data);
    } else {
      // Try to handle typed arrays from AudioWorklets, otherwise ignore
      if (Array.isArray(data)) {
        bufferToSend = DeepgramStreamClient.float32ToInt16Buffer(new Float32Array(data));
      } else {
        return;
      }
    }

    try {
      // SDK expects ArrayBuffer or BufferSource
      this.live.send(bufferToSend);
    } catch (e) {
      this.onError?.(e);
    }
  }

  close(): void {
    try {
      // Gracefully finish the stream; SDK will then close the socket
      this.live?.finish?.();
      this.live?.close?.();
    } catch {}
    this.live = null;
    this.isOpen = false;
  }

  private static float32ToInt16Buffer(float32: Float32Array): ArrayBuffer {
    const len = float32.length;
    const int16 = new Int16Array(len);
    for (let i = 0; i < len; i += 1) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16.buffer;
  }

}
