import type { ActionBase } from './ActionBase';
import type { Message } from '../';

/**
 * Action to send message to peer
 */
export interface ActionPeerMessage extends ActionBase {
  type: 'peerMessage';
  peerId: string;
  payload: Message;
}