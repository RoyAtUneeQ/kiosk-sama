export interface StreamClient {
  token: string;

  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: any) => void;
  onClose?: () => void;

  connect(): Promise<void>;

  send(data: any): void;

  close(): void;
}
