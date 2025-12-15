import { useEffect } from 'react';
import { createActionFactory } from '@/factories';
import type { WebSocketService } from '@/services';

interface UseRemoteConnectionProps {
  websocket: WebSocketService | null;
  connectionId: string | null;
}

/**
 * Hook that encapsulates remote connection polling logic.
 * Sends periodic health check messages to verify peer connection status.
 *
 * Polls every 1000ms to check if the remote peer is still connected,
 * cleaning up the interval on unmount.
 *
 * @param websocket - The WebSocket service instance, or null if not connected.
 * @param connectionId - The remote peer's connection ID, or null if no connection.
 *
 * @example
 * const { websocket } = useWebSocket({ webSocketUrl: config.backend.endpoints.ws });
 * useRemoteConnection({ websocket, connectionId: state.remoteInfo?.connectionId });
 */
export const useRemoteConnection = ({
  websocket,
  connectionId
}: UseRemoteConnectionProps): void => {
  useEffect(() => {
    // Only set up polling if we have both a websocket and a connectionId
    if (!websocket || !connectionId) {
      return;
    }

    const actionFactory = createActionFactory();

    // Poll every 1 second to check peer connection status
    const interval = setInterval(() => {
      if (connectionId) {
        websocket.send(actionFactory.checkPeerConnection(connectionId));
      }
    }, 1000);

    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [websocket, connectionId]);
};
