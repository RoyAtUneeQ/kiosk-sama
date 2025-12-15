import { useEffect, useCallback } from 'react';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { MessageSender } from '@/types';
import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';
import { createActionFactory, MessageFactory } from '@/factories';
import { useSession } from '@/contexts/SessionContext';
import type { WebSocketService } from '@/services';

interface UseKioskConnectionParams {
  websocket: WebSocketService | null;
  kioskConnectionId: string | null;
  userInspect: RemoteSessionInfo;
}

interface UseKioskConnectionReturn {
  handleCardValueClick: (value: string) => void;
}

/**
 * Handle kiosk connection logic: connect to kiosk, forward messages, and card click handling.
 *
 * @param params - Connection parameters
 * @returns Card click handler for sending values to kiosk
 */
export const useKioskConnection = ({
  websocket,
  kioskConnectionId,
  userInspect
}: UseKioskConnectionParams): UseKioskConnectionReturn => {
  const { state, actions } = useSession();

  // Connect to kiosk session when WebSocket is ready
  useEffect(() => {
    if (
      state.webSocketState === WebsocketStatus.CONNECTED &&
      kioskConnectionId &&
      state.connectionId
    ) {
      console.log(`[useKioskConnection] Connecting from ${state.connectionId} to ${kioskConnectionId}`);
      websocket?.send(createActionFactory().peerConnect(kioskConnectionId, userInspect));
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId, websocket, userInspect]);

  // Forward user messages to kiosk
  useEffect(() => {
    const lastMessage = state.history[state.history.length - 1];
    if (!lastMessage) return;

    if (lastMessage.sender === MessageSender.User && kioskConnectionId) {
      console.log('[useKioskConnection] Forwarding user message to kiosk:', lastMessage);
      actions.setAwaitingPromptResponse(true);
      websocket?.send(createActionFactory().sendMessage(kioskConnectionId, lastMessage));
    }
  }, [state.history, kioskConnectionId, websocket, actions]);

  // Handle card value clicks (flight numbers, boundIds, etc.)
  const handleCardValueClick = useCallback(
    (value: string) => {
      if (!kioskConnectionId || !websocket) {
        console.warn('[useKioskConnection] Cannot send card value: missing kioskConnectionId or websocket');
        return;
      }

      actions.setAwaitingPromptResponse(true);
      const message = MessageFactory.createUserMessage(value, true);
      console.log('[useKioskConnection] Sending card value to kiosk:', value);
      websocket.send(createActionFactory().sendMessage(kioskConnectionId, message));
    },
    [kioskConnectionId, websocket, actions]
  );

  return { handleCardValueClick };
};
