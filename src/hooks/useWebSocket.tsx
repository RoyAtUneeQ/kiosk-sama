import { useEffect, useState, useCallback } from "react";
import { WebsocketStatus } from "@/types/transport/WebsocketStatus";
import { useSession } from "@/contexts/SessionContext";
import { createAction } from "@/utils";

interface UseWebSocketProps {
    webSocketUrl: string;
}

export const useWebSocket = (props: UseWebSocketProps) => {
    const { webSocketUrl } = props;
    const { actions, state } = useSession();
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [ message ] = useState<any>(null);
    
    const sendAction = useCallback((message: any) => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify(message));
        } else {
            console.warn('useWebSocket: WebSocket not open or undefined. Message not sent.', {
                message,
                connectionId: state.connectionId,
                currentSocketReadyState: webSocket?.readyState,
            });
        }
    }, [webSocket]);

    useEffect(() => {
        if (!webSocketUrl || webSocketUrl.trim() === '') {
            console.warn('useWebSocket: Invalid or empty WebSocket URL provided');
            return;
        }

        console.info("webSocketUrl: ", webSocketUrl);
        
        try {
            const ws = new WebSocket(webSocketUrl);
            setWebSocket(ws);

            ws.onopen = () => {
                actions.setWebSocketState(WebsocketStatus.CONNECTED);
                ws.send(JSON.stringify(createAction.getConnectionId()));
            };

            ws.onmessage = (event) => {
                const payload = JSON.parse(event.data);
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
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
            };

            ws.onclose = (event) => {
                console.info('WebSocket closed:', event.code, event.reason);
                actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
            };

            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(createAction.closeSession()));
                }
                ws.close();
                setWebSocket(null);
                actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
        }
    }, [webSocketUrl]);

    return {
        sendAction,
        message,
    };
};

export default useWebSocket; 