import type { ActionBase } from './ActionBase';

/**
 * Action to send message to peer
 */
export interface ActionPeerMessage extends ActionBase {
  type: 'peerMessage';
  peerId: string;
  payload: any;
}