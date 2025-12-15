import { useEffect } from 'react';
import type { Config } from '@/types';
import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';
import { useWebSocket, useViewport, useUserInspect } from '@/hooks';
import { useSession } from '@/contexts/SessionContext';
import type { WebSocketService } from '@/services';

interface UseRemoteSessionParams {
  config: Config | null;
}

interface UseRemoteSessionReturn {
  websocket: WebSocketService | null;
  isLargeScreen: boolean;
  userInspect: RemoteSessionInfo;
}

/**
 * Bundle remote page session initialization: config loading, WebSocket, viewport, and user inspect.
 *
 * @param params - Configuration parameters
 * @returns Session utilities for remote page
 */
export const useRemoteSession = ({ config }: UseRemoteSessionParams): UseRemoteSessionReturn => {
  const { state, actions } = useSession();

  // Load config to session state
  useEffect(() => {
    if (config) {
      actions.setConfig(config);
    }
  }, [config, actions]);

  // Initialize WebSocket connection
  const { websocket } = useWebSocket({
    webSocketUrl: config?.backend?.endpoints?.ws || ''
  });

  // Viewport management for responsive behavior
  const { isLargeScreen } = useViewport();

  // Initialize user inspect data
  const userInspect = useUserInspect(state.connectionId ?? '');

  return {
    websocket: websocket ?? null,
    isLargeScreen,
    userInspect
  };
};
