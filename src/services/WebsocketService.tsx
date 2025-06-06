import { useEffect, useState, useCallback, useRef } from "react";
import { WebsocketState } from "@/types/WebsocketState";
import { SessionMessageGenerator } from "@/utils/SessionMessageGenerator";

interface WebSocketServiceProps {
    webSocketUrl: string;
}

export const WebSocketService = (props: WebSocketServiceProps) => {
    const { webSocketUrl } = props;
    const [webSocketState, setWebSocketState] = useState<WebsocketState>(WebsocketState.DISCONNECTED);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [webSocket] = useState<WebSocket>(new WebSocket(webSocketUrl));
    const [message, setMessage] = useState<any>(null);
    const actionsRef = useRef<Map<string, any>>(new Map());

    const on = useCallback((type: string, callback: any) => {
        actionsRef.current.set(type, callback);
    }, []);
     
    const sendMessage = useCallback((message: any) => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocketService: WebSocket not open or undefined. Message not sent.', {
                message,
                connectionId,
                currentSocketReadyState: webSocket?.readyState,
            });
        }
    }, [webSocket]);

    useEffect(() => {
        webSocket.onopen = () => {
            sendMessage(SessionMessageGenerator.getConnectionId());
            setWebSocketState(WebsocketState.CONNECTED);
        };

        webSocket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            setMessage(messageData);

            actionsRef.current.get(messageData.type)?.(messageData);

            if (messageData.connectionId && !connectionId) {
                setConnectionId(messageData.connectionId);
            }
        };

        webSocket.onerror = () => {
            setWebSocketState(WebsocketState.DISCONNECTED);
            sendMessage(SessionMessageGenerator.closeSession());
        };

        webSocket.onclose = () => {
            setWebSocketState(WebsocketState.DISCONNECTED);
            sendMessage(SessionMessageGenerator.closeSession());
        };

        return () => {
            webSocket.close();
            setWebSocketState(WebsocketState.DISCONNECTED);
            sendMessage(SessionMessageGenerator.closeSession());
        };
    }, [webSocketUrl]);

    return {
        webSocketState,
        connectionId,
        sendMessage,
        message,
        on
    };
}       