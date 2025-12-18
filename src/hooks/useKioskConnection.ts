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
  handleFlightSelection: (flightId: string) => void;
  handleFareSelection: (boundId: string) => void;
}

/**
 * Handle kiosk connection logic: connect to kiosk, forward messages, and card click handling.
 *
 * @param params - Connection parameters
 * @returns Handlers for flight and fare selection
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

  // Generic method to send card values with custom messages
  const sendCardValue = useCallback(
    (messageText: string) => {
      if (!kioskConnectionId || !websocket) {
        console.warn('[useKioskConnection] Cannot send card value: missing kioskConnectionId or websocket');
        return;
      }

      actions.setAwaitingPromptResponse(true);
      const message = MessageFactory.createUserMessage(messageText, true);
      websocket.send(createActionFactory().sendMessage(kioskConnectionId, message));
    },
    [kioskConnectionId, websocket, actions]
  );

  // Handle flight selection clicks
  const handleFlightSelection = useCallback(
    (flightId: string) => {
      console.log('[useKioskConnection] Sending flight selection to kiosk:', flightId);
      sendCardValue(`User selected this flight: ${flightId} find the fare options for this flight.`);
    },
    [sendCardValue]
  );

  // Handle fare selection clicks
  const handleFareSelection = useCallback(
    (boundId: string) => {
      console.log('[useKioskConnection] Sending fare selection to kiosk:', boundId);
      sendCardValue(`User selected this fare: ${boundId} proceed to the next step.`);
    },
    [sendCardValue]
  );

  return { handleFlightSelection, handleFareSelection };
};
