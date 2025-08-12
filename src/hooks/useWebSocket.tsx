import { useEffect, useCallback } from "react";
import { WebsocketStatus } from "@/types/transport/WebsocketStatus";
import { useSession } from "@/contexts/SessionContext";
import { createAction } from "@/utils";
import WSClient from '@/services/WebSocketClient';
import ServiceEphemeralToken from '@/services/ServiceEphemeralToken';

interface UseWebSocketProps {
    webSocketUrl: string;
}

export const useWebSocket = (props: UseWebSocketProps) => {
    const { webSocketUrl } = props;
    const { actions } = useSession();
    
    const sendAction = useCallback((message: any) => {
        // WSClient.send already guards for OPEN state
        WSClient.send(message);
    }, []);

    useEffect(() => {
        if (!webSocketUrl || webSocketUrl.trim() === '') {
            console.warn('useWebSocket: Invalid or empty WebSocket URL provided');
            return;
        }

        console.info("webSocketUrl: ", webSocketUrl);
        
        let offOpen: (() => void) | null = null;
        let offStar: (() => void) | null = null;
        let offErr: (() => void) | null = null;
        let offClose: (() => void) | null = null;

        const init = async () => {
            try {
                // Register handlers before connecting so early events are not missed
                offOpen = WSClient.on('open', () => {
                    console.info('WebSocket open event');
                    actions.setWebSocketState(WebsocketStatus.CONNECTED);
                    WSClient.send(createAction.getConnectionId());
                    console.log('WebSocket open event', createAction.getConnectionId());
                });

                offStar = WSClient.on('*', ({ payload }: any) => {
                    console.groupCollapsed('[WebSocket] %c%s', 'color: #a6e22e;', payload.type);                
                    console.table(payload);
                    console.groupEnd();
                    switch (payload.type) {
                        case 'connectionId':
                            console.log('connectionId', payload);
                            actions.setConnectionId(payload.connectionId);
                            break;
                        case 'RegisterRemote':
                            console.log('RegisterRemote', payload);
                            actions.setRemoteInfo(payload.remoteInfo);
                            break;
                        case 'peerMessage':
                            actions.setPeerMessage(payload)
                            break;  
                        case 'serviceToken': {
                            const issued = payload.data;
                            console.log('serviceToken', issued);
                            ServiceEphemeralToken.set(issued.provider, issued.service, issued.token, issued.expiresAt);
                            break;
                        }
                        case 'PeerChecked':
                            console.log('PeerChecked %c%s %c%s', 'color: #a6e22e;', payload.Origin, 'color:rgb(221, 67, 255);', payload.Destination);
                            break;
                        case 'PeerDisconnected':
                            console.log('PeerDisconnected ', payload);
                            actions.setRemoteInfo(null);                            
                            break;      
                        default:
                            console.log('Default', payload);
                            break;
                    }
                });

                offErr = WSClient.on('error', (error: unknown) => {
                    console.error('WebSocket error event:', error);
                    actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
                });

                offClose = WSClient.on('close', (event: unknown) => {
                    console.info('WebSocket closed event:', (event as any).code, (event as any).reason);
                    actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
                });

                // Ensure ws://localhost:3001 has route; if serverless-offline, URL must include stage or no-prepend config.
                await WSClient.connect(webSocketUrl);
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
            }
        };

        init();

        return () => {
            WSClient.send(createAction.closeSession());
            WSClient.close();
            actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
            offOpen?.();
            offStar?.();
            offErr?.();
            offClose?.();
        };
        
    }, [webSocketUrl]);

    return {
        sendAction,
    };
};

export default useWebSocket; 