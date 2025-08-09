import type { ActionBase } from './ActionBase';
import type { RemoteSessionInfo } from '../RemoteSessionInfo';

/**
 * Action to connect with peer
 */
export interface ActionPeerConnect extends ActionBase {
  type: 'peerConnect';
  peerId: string;
  remoteInfo: RemoteSessionInfo;
}