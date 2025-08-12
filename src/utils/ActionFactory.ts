import type { 
  WebsocketAction
} from "@/types/transport/actions";
import type { RemoteSessionInfo } from "@/types/transport";

/**
 * Action Factory - Creates websocket actions in a centralized location
 */
export const createAction = {
    getConnectionId: (): WebsocketAction => ({
        type: 'getConnectionId'
    }),
    
    peerConnect: (peerId: string, remoteInfo: RemoteSessionInfo): WebsocketAction => ({
        type: 'peerConnect',
        peerId,
        remoteInfo
    }),
    
    CheckPeerConnection: (peerId: string): WebsocketAction => ({
        type: 'CheckPeerConnection',
        peerId
    }),
    
    sendMessage: (peerId: string, payload: any): WebsocketAction => ({
        type: 'peerMessage',
        peerId,
        payload
    }),
    
    requestServiceToken: (
      provider: string,
      service: 'stt' | 'tts',
      ttlSeconds: number = 60,
      params: Record<string, any> = {}
    ): WebsocketAction => ({
      // Uses DefaultHandler which routes by action/type
      type: 'serviceToken',
      provider,
      service,
      ttlSeconds,
      params,
    } as any),
    
    peerAudioTranscribe: (
      peerId: string,
      audioBase64: string,
      mimetype: string,
      language?: string,
      model?: string,
    ): WebsocketAction => ({
      type: 'peerAudioTranscribe',
      peerId,
      audio: audioBase64,
      mimetype,
      language,
      model,
    }),
    
    closeSession: (): WebsocketAction => ({
        type: 'closeSession'
    })
};

// For backward compatibility
export const SessionMessage = createAction;