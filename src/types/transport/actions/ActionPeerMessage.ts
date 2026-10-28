import type { ActionBase } from './ActionBase';
import type { Message, SessionControlMessage } from '../';

export interface ActionPeerMessage extends ActionBase {
  type: 'peerMessage';
  peerId: string;
  payload: Message | SessionControlMessage;
}