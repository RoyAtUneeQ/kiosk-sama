import type { ActionBase } from './ActionBase';
import type { RemoteSessionInfo } from '../RemoteSessionInfo';

export interface ActionPeerConnect extends ActionBase {
  type: 'peerConnect';
  peerId: string;
  remoteInfo: RemoteSessionInfo;
}