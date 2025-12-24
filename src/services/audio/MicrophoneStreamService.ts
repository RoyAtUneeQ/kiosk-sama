import type {
  MicrophoneStreamServiceOptions,
  MicrophoneStreamServiceCallbacks,
  MicrophoneStreamState
} from '../types/MicrophoneStreamServiceTypes';

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

export class MicrophoneStreamService {
  private readonly options: Required<MicrophoneStreamServiceOptions>;
  private readonly callbacks: MicrophoneStreamServiceCallbacks;
  
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;

  private state: MicrophoneStreamState = {
    isListening: false,
    error: null,
    audioChunk: null
  };

  constructor(options: MicrophoneStreamServiceOptions & MicrophoneStreamServiceCallbacks = {}) {
    // Separate options from callbacks
    const {
      onStreamStart,
      onStreamStop,
      onAudioChunk,
      onError,
      ...serviceOptions
    } = options;

    this.options = {
      targetSampleRate: 16000,
      echoCancellation: true,
      noiseSuppression: true,
      bufferSize: 4096,
      ...serviceOptions
    };

    this.callbacks = {
      onStreamStart,
      onStreamStop,
      onAudioChunk,
      onError
    };
  }

  public async start(): Promise<void> {
    if (this.state.isListening) {
      return;
    }
    
    this.updateState({ error: null });
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: this.options.echoCancellation, 
          noiseSuppression: this.options.noiseSuppression 
        }, 
        video: false 
      });
      this.mediaStream = mediaStream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext = audioContext;

      const source = audioContext.createMediaStreamSource(mediaStream);
      this.source = source;

      const processor = audioContext.createScriptProcessor(this.options.bufferSize, 1, 1);
      this.processor = processor;

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        const input = event.inputBuffer.getChannelData(0);
        const resampled = downsampleToTarget(
          input, 
          audioContext.sampleRate, 
          this.options.targetSampleRate
        );
        
        if (resampled.length > 0) {
          this.updateState({ audioChunk: resampled });
          this.callbacks.onAudioChunk?.(resampled);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      this.updateState({ isListening: true });
      this.callbacks.onStreamStart?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Microphone start failed';
      this.updateState({ error: errorMessage });
      this.callbacks.onError?.(errorMessage);
      this.handleError('start', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.state.isListening) {
      return;
    }
    
    try {
      this.processor?.disconnect();
      this.source?.disconnect();
      this.processor = null;
      this.source = null;

      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
    } catch (error) {
      this.handleError('stop', error);
    } finally {
      this.updateState({ 
        isListening: false,
        audioChunk: null 
      });
      this.callbacks.onStreamStop?.();
    }
  }

  public getState(): Readonly<MicrophoneStreamState> {
    return { ...this.state };
  }

  public isListening(): boolean {
    return this.state.isListening;
  }

  public getError(): string | null {
    return this.state.error;
  }

  public getAudioChunk(): Float32Array | null {
    return this.state.audioChunk;
  }

  public clearError(): void {
    this.updateState({ error: null });
  }

  private updateState(updates: Partial<MicrophoneStreamState>): void {
    const hasChanges = Object.keys(updates).some(
      key => this.state[key as keyof MicrophoneStreamState] !== updates[key as keyof MicrophoneStreamState]
    );

    if (hasChanges) {
      this.state = { ...this.state, ...updates };
    }
  }

  private handleError(method: string, error: unknown): void {
    console.error(`[MicrophoneStreamService] ${method} failed:`, error);
  }
}

export default MicrophoneStreamService;
