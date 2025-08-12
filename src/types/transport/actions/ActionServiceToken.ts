import type { ActionBase } from './ActionBase';

export interface ActionServiceToken extends ActionBase {
  type: 'serviceToken';
  provider: string;
  service: 'stt' | 'tts';
  ttlSeconds?: number;
  params?: Record<string, any>;
}


