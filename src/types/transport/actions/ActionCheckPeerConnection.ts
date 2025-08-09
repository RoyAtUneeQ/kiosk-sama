import type { ActionBase } from './ActionBase';

/**
 * Action to check peer connection status
 */
export interface ActionCheckPeerConnection extends ActionBase {
  type: 'CheckPeerConnection';
  peerId: string;
}