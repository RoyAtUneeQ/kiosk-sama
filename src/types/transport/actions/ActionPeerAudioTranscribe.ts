import type { ActionBase } from './ActionBase';

export interface ActionPeerAudioTranscribe extends ActionBase {
  type: 'peerAudioTranscribe';
  peerId: string;
  audio: string; // base64 encoded audio
  mimetype: string; // e.g., 'audio/webm;codecs=opus'
  language?: string;
  model?: string;
}