import type { ActionBase } from './ActionBase';

export interface ActionPeerAudioTranscribe extends ActionBase {
  type: 'peerAudioTranscribe';
  peerId: string;
  audio: string;
  mimetype: string;
  language?: string;
  model?: string;
}