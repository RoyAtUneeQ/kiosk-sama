import { useEffect, useRef } from 'react';
import { MessageSender, WebsocketStatus } from '@/types/transport';
import { useSession, type SessionContextType } from '@/contexts';
import { createActionFactory, WebSocketEventFactory } from '@/factories';
import { WebSocketService } from '@/services';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';  

interface UseWebSocketProps {
    webSocketUrl: string;
}

export const useWebSocketAdapter = (props: UseWebSocketProps) => {
  const { webSocketUrl } = props;
  const session = useSession();
  const actionFactory = createActionFactory();
  const wasConnectedRef = useRef<boolean>(false);

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
        const isReconnection = wasConnectedRef.current;
        wasConnectedRef.current = true;

        session.actions.setWebSocketState(WebsocketStatus.CONNECTED);
        websocket.send(actionFactory.getConnectionId());

        // If reconnecting and we have a remote peer, re-establish connection
        if (isReconnection && session.state.remoteInfo?.connectionId && session.state.connectionId) {
          // The peer connect will be resent from the orchestrator
        }
      }),
      websocket.on('*', ({ payload }: any) =>
        WebSocketEventFactory(
          payload?.type as WebSocketEventType
        )?.execute(payload, session as SessionContextType)
      ),
      websocket.on('error', (error: unknown) => {
        console.error('[useWebSocket] ⚠️ WebSocket error:', error);
        session.actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
      }),
      websocket.on('close', () => {
        session.actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
        // Note: ReconnectingWebSocket will automatically attempt to reconnect
      }),
      websocket.on('message-timeout', ({ messageId, message }: any) => {
        console.error('[useWebSocket] ⏱️ Message delivery timeout', { messageId, type: message?.type });
      }),
      websocket.on('message-failed', ({ messageId, message }: any) => {
        console.error('[useWebSocket] ❌ Message delivery failed after retries', { messageId, type: message?.type });
      }),
      websocket.on('connection-unhealthy', (data: any) => {
        const health = websocket.getConnectionHealth();
        console.warn('[useWebSocket] ⚠️ Connection unhealthy - pong timeout', {
          lastPing: health.lastPing,
          lastPong: health.lastPong,
          pingsSent: health.pingsSent,
          pongsReceived: health.pongsReceived,
          timeSincePing: data?.timeSincePing
        });
      })
    ];

    websocket.connect(webSocketUrl).catch((err: any) => {
      console.error('Failed to connect WebSocket:', err);
      session.actions.setWebSocketState(WebsocketStatus.DISCONNECTED);
    });

    // Add connection health monitoring
    const healthCheckInterval = setInterval(() => {
      // Health check monitoring
    }, 60000);

    return () => {
      clearInterval(healthCheckInterval);
      try { websocket.send(actionFactory.closeSession()); } catch {}
      unsubscribeHandlers.forEach((unsubscribe) => unsubscribe?.());
      // Do not close or forcibly change state here to preserve singleton connection
    };
  }, [webSocketUrl]);

  useEffect(() => {
    const remoteConnectionId = session.state.remoteInfo?.connectionId;
    if (!remoteConnectionId || remoteConnectionId.trim() === '') {
      return;
    }
    if (session.state.remoteMessageQueue.length === 0) {
      return;
    }

    const queueToProcess = [...session.state.remoteMessageQueue];

    queueToProcess.forEach((data) => {
      websocketRef.current!.send(
        actionFactory.sendMessage(remoteConnectionId, data),
        true
      );
    });

    session.actions.clearRemoteMessageQueue();
  }, [session.state.remoteInfo?.connectionId, session.state.remoteMessageQueue.length]);

  useEffect(() => {
    const lastMessage = session.state.history[session.state.history.length - 1];
    const remoteConnectionId = session.state.remoteInfo?.connectionId;

    if (!lastMessage || !remoteConnectionId || remoteConnectionId.trim() === '') {
      return;
    }
    if (lastMessage.sender !== MessageSender.Assistant) {
      return;
    }
    if (session.state.sentMessageIds.has(lastMessage.id)) {
      return;
    }

    websocketRef.current!.send(
      actionFactory.sendMessage(remoteConnectionId, lastMessage),
      true
    );

    session.actions.markMessageAsSent(lastMessage.id);
  }, [session.state.history]);

  return {
    websocket: websocketRef.current!,
  };
};


