import type { StreamClient } from '@/types/transport/StreamClient';
import { createStreamClient } from '@/factories';
import { SpeechToTextProviders } from '@/types/providers/SpeechToTextProviders';
import { EphemeralTokenService } from '../auth/EphemeralTokenService';
import type {
  SpeechToTextServiceOptions,
  SpeechToTextServiceCallbacks,
  SpeechToTextState
} from '../types/SpeechToTextServiceTypes';

export class SpeechToTextService {
  private readonly options: Required<SpeechToTextServiceOptions>;
  private readonly callbacks: SpeechToTextServiceCallbacks;
  private readonly ephemeralTokenService: EphemeralTokenService;
  
  private streamClient: StreamClient | null = null;
  private state: SpeechToTextState = {
    isReady: false,
    isProcessing: false,
    text: '',
    isConnected: false
  };

  constructor(options: SpeechToTextServiceOptions & SpeechToTextServiceCallbacks) {
    // Separate options from callbacks
    const {
      onReady,
      onProcessingStart,
      onProcessingEnd,
      onPartial,
      onFinal,
      onError,
      onClose,
      ...serviceOptions
    } = options;

    this.options = {
      provider: 'deepgram',
      model: 'nova-3',
      language: 'en-US',
      encoding: 'linear16',
      sampleRate: 16000,
      channels: 1,
      smartFormat: true,
      tokenTtl: 60,
      ...serviceOptions
    };

    this.callbacks = {
      onReady,
      onProcessingStart,
      onProcessingEnd,
      onPartial,
      onFinal,
      onError,
      onClose
    };

    this.ephemeralTokenService = new EphemeralTokenService({
      apiBaseUrl: this.options.apiBaseUrl,
      apiKey: this.options.apiKey
    });
  }

  public async start(): Promise<void> {
    try {
      if (this.streamClient) {
        await this.stop();
      }

      const token = await this.ephemeralTokenService.ensure(
        this.options.provider,
        'stt',
        this.options.tokenTtl
      );

      this.streamClient = createStreamClient(SpeechToTextProviders.DEEPGRAM, {
        token,
        model: this.options.model,
        language: this.options.language,
        encoding: this.options.encoding,
        sampleRate: this.options.sampleRate,
        channels: this.options.channels,
        smartFormat: this.options.smartFormat,
        onOpen: () => this.handleOpen(),
        onPartial: (text: string) => this.handlePartial(text),
        onFinal: (text: string) => this.handleFinal(text),
        onError: (error: any) => this.handleError('streamClient', error),
        onClose: () => this.handleClose()
      });

      if (this.streamClient) {
        await this.streamClient.connect();
        this.updateState({ isConnected: true });
      }
    } catch (error) {
      this.handleError('start', error);
      throw new Error(`Failed to start STT service: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async stop(): Promise<void> {
    try {
      if (this.streamClient) {
        this.streamClient.close();
        this.streamClient = null;
      }

      this.updateState({
        isReady: false,
        isProcessing: false,
        isConnected: false,
        text: ''
      });
    } catch (error) {
      this.handleError('stop', error);
    }
  }

  public sendAudio(audioData: ArrayBuffer | Uint8Array): void {
    if (!this.streamClient || !this.state.isReady) {
      console.warn('[SpeechToTextService] Service not ready, audio data dropped');
      return;
    }

    try {
      this.streamClient.send(audioData);
    } catch (error) {
      this.handleError('sendAudio', error);
    }
  }

  public getState(): Readonly<SpeechToTextState> {
    return { ...this.state };
  }

  public isReady(): boolean {
    return this.state.isReady;
  }

  public isProcessing(): boolean {
    return this.state.isProcessing;
  }

  public getText(): string {
    return this.state.text;
  }

  private handleOpen(): void {
    this.updateState({ isReady: true });
    this.callbacks.onReady?.();
  }

  private handlePartial(text: string): void {
    if (!this.state.isProcessing) {
      this.updateState({ isProcessing: true });
      this.callbacks.onProcessingStart?.();
    }
    this.callbacks.onPartial?.(text);
  }

  private handleFinal(text: string): void {
    this.updateState({ 
      isProcessing: false,
      text 
    });
    this.callbacks.onProcessingEnd?.();
    this.callbacks.onFinal?.(text);
  }

  private handleClose(): void {
    this.updateState({
      isReady: false,
      isProcessing: false,
      isConnected: false
    });
    this.callbacks.onClose?.();
  }

  private updateState(updates: Partial<SpeechToTextState>): void {
    const hasChanges = Object.keys(updates).some(
      key => this.state[key as keyof SpeechToTextState] !== updates[key as keyof SpeechToTextState]
    );

    if (hasChanges) {
      this.state = { ...this.state, ...updates };
    }
  }

  private handleError(method: string, error: unknown): void {
    console.error(`[SpeechToTextService] ${method} failed:`, error);
    
    this.updateState({ 
      isProcessing: false,
      isReady: false 
    });
    
    this.callbacks.onError?.(error);
  }
}

export default SpeechToTextService;
