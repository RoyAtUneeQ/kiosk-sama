import type { ActionBase } from './ActionBase';

export interface ActionPeerAudioTranscribe extends ActionBase {
  type: 'peerAudioTranscribe';
  peerId: string;
  /** base64 encoded audio */
  audio: string;
  /** e.g., 'audio/webm;codecs=opus' */
  mimetype: string;
  language?: string;
  model?: string;
}