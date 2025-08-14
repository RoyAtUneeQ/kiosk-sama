import { useEffect, useRef } from 'react';
import { WebsocketStatus } from '@/types/transport';
import { useSession, type SessionContextType } from '@/contexts';
import { createActionFactory, WebSocketEventFactory } from '@/factories';
import { WebSocketService } from '@/services';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';  

interface UseWebSocketProps {
    webSocketUrl: string;
}

/**
 * Establish and manage a resilient WebSocket connection with event multiplexing.
 * Returns a stable `sendAction` helper and the underlying service instance.
 */
export const useWebSocket = (props: UseWebSocketProps) => {
  const { webSocketUrl } = props;
  const session = useSession();
  const actionFactory = createActionFactory();

  // Ensure a singleton WebSocketService instance stored in the session
  const websocketRef = useRef<WebSocketService | null>(null);
  if (!websocketRef.current) {
    websocketRef.current = new WebSocketService();
  }

  useEffect(() => {
    if (!webSocketUrl || webSocketUrl.trim() === '') {
      console.warn('useWebSocket: Invalid or empty WebSocket URL provided');
      return;
    }

    const websocket = websocketRef.current!;

    const unsubscribeHandlers: Array<() => void> = [
      websocket.on('open', () => {
        session.actions.setWebSocketState(WebsocketStatus.CONNECTED);
        websocket.send(actionFactory.getConnectionId());
      }),
      websocket.on('*', ({ payload }: any) =>
        WebSocketEventFactory(
          payload?.type as WebSocketEventType
        )?.execute(payload, session as SessionContextType)
      ),
      websocket.on('error', (error: unknown) => {
        console.error('WebSocket error event:', error);
        session.actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
      }),
      websocket.on('close', () => {
        session.actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
      })
    ];

    websocket.connect(webSocketUrl).catch((err: any) => {
      console.error('Failed to connect WebSocket:', err);
      session.actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
    });

    return () => {
      try { websocket.send(actionFactory.closeSession()); } catch {}
      unsubscribeHandlers.forEach((unsubscribe) => unsubscribe?.());
      // Do not close or forcibly change state here to preserve singleton connection
    };
  }, [webSocketUrl]);

  //Send last history message to peer
  useEffect(() => {
    const lastMessage = session.state.history[session.state.history.length - 1];
    if(lastMessage && session.state.remoteInfo?.connectionId && lastMessage.sender === 'assistant')
      websocketRef.current!.send(actionFactory.sendMessage(session.state.remoteInfo.connectionId, lastMessage));
  }, [session.state.history]);

  return {
    websocket: websocketRef.current!,
    sendAction: (action: any) => websocketRef.current!.send(action),
  };
};


