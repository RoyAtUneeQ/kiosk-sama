import { useEffect, useCallback } from 'react';
import type { Config } from '@/types';
import { useWebSocketAdapter, useViewport } from '@/hooks';
import { useSession } from '@/contexts/SessionContext';
import type { WebSocketService } from '@/services';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { MessageSender } from '@/types';
import { createActionFactory, MessageFactory } from '@/factories';
import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';

interface UseRemoteOrchestratorParams {
  config: Config | null;
  kioskConnectionId: string | null;
}

interface UseRemoteOrchestratorReturn {
  websocket: WebSocketService | null;
  isLargeScreen: boolean;
  handleFlightSelection: (flightId: string) => void;
  handleFareSelection: (boundId: string) => void;
}

export const useRemoteOrchestrator = ({ 
  config, 
  kioskConnectionId 
}: UseRemoteOrchestratorParams): UseRemoteOrchestratorReturn => {
  const { state, actions } = useSession();

  useEffect(() => {
    if (config) {
      actions.setConfig(config);
    }
  }, [config, actions]);

  const { websocket } = useWebSocketAdapter({
    webSocketUrl: config?.backend?.endpoints?.ws || ''
  });

  const { isLargeScreen } = useViewport();
  
  useEffect(() => {
    if (state.webSocketState !== WebsocketStatus.CONNECTED || !websocket) {
      return;
    }
    if (!kioskConnectionId || kioskConnectionId.trim() === '') {
      console.warn('[useRemoteOrchestrator] ⚠️ Invalid kioskConnectionId');
      return;
    }
    if (!state.connectionId || state.connectionId.trim() === '') {
      return;
    }

    const userInspect: RemoteSessionInfo = {
      connectionId: state.connectionId,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      browser: 'Unknown',
      device: 'Unknown',
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connectionType: 'Unknown',
      online: navigator.onLine,
      referrer: document.referrer,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    websocket.send(createActionFactory().peerConnect(kioskConnectionId, userInspect));
  }, [state.webSocketState, kioskConnectionId, state.connectionId, websocket]);

  useEffect(() => {
    if (state.history.length === 0) return;
    if (!kioskConnectionId || kioskConnectionId.trim() === '' || !websocket) return;

    const lastMessage = state.history[state.history.length - 1];
    if (lastMessage.sender !== MessageSender.User) return;
    if (state.sentMessageIds.has(lastMessage.id)) return;

    actions.setAwaitingPromptResponse(true);

    const messageId = websocket.send(
      createActionFactory().sendMessage(kioskConnectionId, MessageFactory.createUserMessage(lastMessage.content)),
      true
    );

    actions.markMessageAsSent(lastMessage.id);
  }, [state.history.length]);

  const sendCardValue = useCallback(
    (messageText: string) => {
      if (!kioskConnectionId || kioskConnectionId.trim() === '' || !websocket) {
        console.warn('[useRemoteOrchestrator] ⚠️ Cannot send card value: invalid kioskConnectionId or no websocket');
        return;
      }

      if (state.webSocketState !== WebsocketStatus.CONNECTED) {
        console.warn('[useRemoteOrchestrator] ⚠️ Cannot send card value: WebSocket not connected');
        return;
      }

      actions.setAwaitingPromptResponse(true);
      const message = MessageFactory.createUserMessage(messageText, true);

      const messageId = websocket.send(
        createActionFactory().sendMessage(kioskConnectionId, message),
        true
      );

      console.log(
        '%c📤 MESSAGE SENT TO SERVER',
        'background: #7c3aed; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        { messageId, messageText: messageText }
      );
    },
    [kioskConnectionId, websocket, actions, state.webSocketState]
  );

  const handleFlightSelection = useCallback(
    (flightId: string) => {
      console.log(
        '%c✈️ FLIGHT SELECTED',
        'background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        flightId
      );
      sendCardValue(`User selected this flight: ${flightId} find the fare options for this flight.`);
    },
    [sendCardValue]
  );

  const handleFareSelection = useCallback(
    (boundId: string) => {
      console.log(
        '%c💳 FARE SELECTED',
        'background: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        boundId
      );
      sendCardValue(`User selected this fare: ${boundId} proceed to the next step.`);
    },
    [sendCardValue]
  );

  return { websocket: websocket ?? null, isLargeScreen, handleFlightSelection, handleFareSelection};
};
