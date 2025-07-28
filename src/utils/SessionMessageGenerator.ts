/**
 * Generator class for creating type-safe message objects
 */
import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';

export class SessionMessageGenerator {
  static getConnectionId(): any {
    return { type: "getConnectionId" };
  }
  static joinSession(sessionId: string, remoteInfo: RemoteSessionInfo): any {
    return { type: "joinSession", sessionId: sessionId, remoteInfo: remoteInfo}
  }

  static CheckPeerConnection(peerId: string): any {
    return { type: "CheckPeerConnection", peerId: peerId}
  }

  static closeSession(): any {
    return { type: "closeSession" };
  }
} 