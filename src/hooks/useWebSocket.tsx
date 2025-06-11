import { useEffect, useState, useCallback, useRef } from "react";
import { WebsocketState } from "@/types/WebsocketState";
import { SessionMessageGenerator } from "@/utils/SessionMessageGenerator";

interface UseWebSocketProps {
    webSocketUrl: string;
}

export const useWebSocket = (props: UseWebSocketProps) => {
    const { webSocketUrl } = props;
    const [webSocketState, setWebSocketState] = useState<WebsocketState>(WebsocketState.DISCONNECTED);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<any>(null);
    const actionsRef = useRef<Map<string, any>>(new Map());

    const on = useCallback((type: string, callback: any) => {
        actionsRef.current.set(type, callback);
    }, []);
     
    const sendMessage = useCallback((message: any) => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify(message));
        } else {
            console.warn('useWebSocket: WebSocket not open or undefined. Message not sent.', {
                message,
                connectionId,
                currentSocketReadyState: webSocket?.readyState,
            });
        }
    }, [webSocket, connectionId]);

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
                console.info('WebSocket connected');
                setWebSocketState(WebsocketState.CONNECTED);
                ws.send(JSON.stringify(SessionMessageGenerator.getConnectionId()));
            };

            ws.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                setMessage(messageData);

                actionsRef.current.get(messageData.type)?.(messageData);

                if (messageData.connectionId && !connectionId) {
                    setConnectionId(messageData.connectionId);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setWebSocketState(WebsocketState.DISCONNECTED);
            };

            ws.onclose = (event) => {
                console.info('WebSocket closed:', event.code, event.reason);
                setWebSocketState(WebsocketState.DISCONNECTED);
            };

            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(SessionMessageGenerator.closeSession()));
                }
                ws.close();
                setWebSocket(null);
                setWebSocketState(WebsocketState.DISCONNECTED);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setWebSocketState(WebsocketState.DISCONNECTED);
        }
    }, [webSocketUrl]);

    return {
        webSocketState,
        connectionId,
        sendMessage,
        message,
        on
    };
};

export default useWebSocket; 