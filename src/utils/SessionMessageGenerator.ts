/**
 * Generator class for creating type-safe message objects
 */
import type { RemoteSessionInfo } from '@/types/RemoteSessionInfo';

export class SessionMessageGenerator {
  static getConnectionId(): any {
    return { type: "getConnectionId" };
  }
  static joinSession(sessionId: string, remoteInfo: RemoteSessionInfo): any {
    return { type: "joinSession", sessionId: sessionId, remoteInfo: remoteInfo}
  }

  static checkRemoteConnection(remoteId: string): any {
    return { type: "checkRemoteConnection", remoteId: remoteId}
  }

  static closeSession(): any {
    return { type: "closeSession" };
  }
} 