export interface EphemeralTokenServiceOptions {
  apiBaseUrl?: string;
  apiKey?: string;
}

export interface TokenCacheEntry {
  value: string;
  expiresAtMs: number;
}

export type ServiceType = 'stt' | 'tts';

export interface TokenResponse {
  value: string;
  expiresAtMs: number;
}
