import type { ActionBase } from './ActionBase';

export interface ActionCheckPeerConnection extends ActionBase {
  type: 'CheckPeerConnection';
  peerId: string;
}