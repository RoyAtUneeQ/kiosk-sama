import { useEffect, useState, useCallback } from "react";
import { WebsocketStatus } from "@/types/transport/WebsocketStatus";
import { SessionMessageGenerator } from "@/utils/SessionMessageGenerator";
import { useSession } from "@/contexts/SessionContext";

interface UseWebSocketProps {
    webSocketUrl: string;
}

export const useWebSocket = (props: UseWebSocketProps) => {
    const { webSocketUrl } = props;
    const { actions, state } = useSession();
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<any>(null);
    
    const sendMessage = useCallback((message: any) => {
        console.log('Sending message', message);
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
                ws.send(JSON.stringify(SessionMessageGenerator.getConnectionId()));
            };

            ws.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                console.groupCollapsed('[WebSocket] %c%s', 'color: #a6e22e;', messageData.type);                
                console.table(messageData);
                console.groupEnd();
                switch (messageData.type) {
                    case 'connectionId':
                        actions.setConnectionId(messageData.connectionId);
                        break;
                    case 'RegisterRemote':
                        console.log('RegisterRemote', messageData);
                        actions.setRemoteInfo(messageData.remoteInfo);
                        break;
                    case 'PeerChecked':
                        console.log('PeerChecked %c%s %c%s', 'color: #a6e22e;', messageData.data.Origin, 'color:rgb(221, 67, 255);', messageData.data.Destination);
                        break;
                    case 'PeerDisconnected':
                        console.log('PeerDisconnected ', messageData);
                        actions.setRemoteInfo(null);                            
                        break;      
                    default:
                        console.log('Default', messageData);
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
                    ws.send(JSON.stringify(SessionMessageGenerator.closeSession()));
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
        sendMessage,
        message,
    };
};

export default useWebSocket; 