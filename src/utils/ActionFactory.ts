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
    
    closeSession: (): WebsocketAction => ({
        type: 'closeSession'
    })
};

// For backward compatibility
export const SessionMessage = createAction;