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
    if (
      state.webSocketState === WebsocketStatus.CONNECTED &&
      kioskConnectionId &&
      state.connectionId &&
      websocket
    ) {
      console.log(`[useRemoteOrchestrator] Connecting from ${state.connectionId} to ${kioskConnectionId}`);
      
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
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId, websocket]);

  useEffect(() => {
    // If user
    if (state.history.length === 0 || !kioskConnectionId || !websocket) return;
    const lastMessage = state.history[state.history.length - 1];
    if (lastMessage.sender === MessageSender.User) {
      console.log('[useRemoteOrchestrator] Forwarding user message to kiosk:', lastMessage);
      actions.setAwaitingPromptResponse(true);
      websocket.send(createActionFactory().sendMessage(kioskConnectionId, MessageFactory.createUserMessage(lastMessage.content)));
    }
  }, [state.history.length]);

  const sendCardValue = useCallback(
    (messageText: string) => {
      if (!kioskConnectionId || !websocket) {
        console.warn('[useRemoteOrchestrator] Cannot send card value: missing kioskConnectionId or websocket');
        return;
      }

      actions.setAwaitingPromptResponse(true);
      const message = MessageFactory.createUserMessage(messageText, true);
      websocket.send(createActionFactory().sendMessage(kioskConnectionId, message));
    },
    [kioskConnectionId, websocket, actions]
  );

  const handleFlightSelection = useCallback(
    (flightId: string) => {
      console.log('[useRemoteOrchestrator] Sending flight selection to kiosk:', flightId);
      sendCardValue(`User selected this flight: ${flightId} find the fare options for this flight.`);
    },
    [sendCardValue]
  );

  const handleFareSelection = useCallback(
    (boundId: string) => {
      console.log('[useRemoteOrchestrator] Sending fare selection to kiosk:', boundId);
      sendCardValue(`User selected this fare: ${boundId} proceed to the next step.`);
    },
    [sendCardValue]
  );

  return { websocket: websocket ?? null, isLargeScreen, handleFlightSelection, handleFareSelection};
};
