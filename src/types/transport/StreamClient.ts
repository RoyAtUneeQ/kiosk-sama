export interface StreamClient {
  token: string;

  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: any) => void;
  onClose?: () => void; 

  /**
   * Open the underlying streaming connection and get ready to receive/send audio.
   */
  connect(): Promise<void>;

  /**
   * Send a chunk of signed 16-bit PCM audio to the streaming backend.
   * The caller is responsible for providing the correct sample rate and channels
   * agreed upon during connection setup.
   */
  send(data: any): void;

  /**
   * Close the streaming connection and release resources.
   */
  close(): void;
}
