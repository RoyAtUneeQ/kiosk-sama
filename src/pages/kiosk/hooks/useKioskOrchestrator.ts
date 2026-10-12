import { useEffect, useCallback } from 'react';
import type { Config } from '@/types';
import type { UneeqOptions } from '@/types/uneeq';
import { defaultUneeqOptions } from '@/types';
import type { MessageCardSet } from '@/types/booking';
import {
  useUneeq,
  useStateManager,
  useWebSocketAdapter
} from '@/hooks';
import { useSession } from '@/contexts/SessionContext';
import type { State } from '@/contexts/types';
import { createActionFactory, MessageFactory } from '@/factories';
import type { WebSocketService } from '@/services';

interface UseKioskOrchestratorParams {
  config: Config | null;
  language: string;
  renderMode: 'cloud' | 'miniprem';
}

interface UseKioskOrchestratorReturn {
  websocket: WebSocketService | null;
  cardData: MessageCardSet | null;
  hasCards: boolean;
  handleGuidedExperienceConfirm: () => void;
  useSeatViewerBackground: boolean;
}

export const useKioskOrchestrator = (params: UseKioskOrchestratorParams): UseKioskOrchestratorReturn => {
  const { config, language, renderMode } = params;
  const { state, actions } = useSession();
  
  useUneeq(
    {
      ...defaultUneeqOptions,
      showClosedCaptions: state.showClosedCaptions,
      showUserInputInterface: false
    } as UneeqOptions,
    language,
    renderMode
  );
  useStateManager();

  useEffect(() => {
    if (config) {
      actions.setConfig(config);
    }
  }, [config, actions]);

  const { websocket } = useWebSocketAdapter({
    webSocketUrl: config?.backend?.endpoints?.ws || ''
  });

  useEffect(() => {
    const remoteConnectionId = state.remoteInfo?.connectionId;
    if (!websocket || !remoteConnectionId || remoteConnectionId.trim() === '') {
      return;
    }

    const actionFactory = createActionFactory();
    let consecutiveFailures = 0;
    const MAX_FAILURES = 3;

    const interval = setInterval(() => {
      // Re-check remoteConnectionId in case it was cleared
      const currentRemoteId = state.remoteInfo?.connectionId;
      if (!currentRemoteId || currentRemoteId.trim() === '') {
        clearInterval(interval);
        return;
      }

      const pendingCount = websocket.getPendingMessagesCount();
      const connectionHealth = websocket.getConnectionHealth();
      
      // Check if connection is actually healthy (keepalive working)
      const isConnectionHealthy = connectionHealth.isHealthy && connectionHealth.pingsSent > 0;

      // Only count as failure if:
      // 1. There are pending messages AND
      // 2. Connection is not healthy (keepalive not working)
      if (pendingCount > 0 && !isConnectionHealthy) {
        consecutiveFailures++;
        console.warn(`[useKioskOrchestrator] ⚠️ ${pendingCount} pending messages, connection unhealthy, failure count: ${consecutiveFailures}/${MAX_FAILURES}`, {
          isHealthy: connectionHealth.isHealthy,
          pingsSent: connectionHealth.pingsSent,
          pongsReceived: connectionHealth.pongsReceived
        });

        if (consecutiveFailures >= MAX_FAILURES) {
          console.error('[useKioskOrchestrator] ❌ Connection unhealthy after multiple checks, clearing remote info');
          actions.clearRemoteInfo();
          clearInterval(interval);
          return;
        }
        return;
      }

      // Reset failure count if connection is healthy or no pending messages
      if (consecutiveFailures > 0) {
        consecutiveFailures = 0;
      }

      websocket.send(actionFactory.checkPeerConnection(currentRemoteId));
    }, 60000);

    return () => clearInterval(interval);
  }, [websocket, state.remoteInfo?.connectionId, actions]);

  let cardData: MessageCardSet | null = null;
  for (let i = state.history.length - 1; i >= 0; i--) {
    const cards = state.messageCards[state.history[i].id];
    if (hasVisibleCards(cards)) {
      cardData = cards;
      break;
    }
  }
  if (!cardData) {
    cardData = cardsFromSessionFields(state);
  }

  const hasCards = cardData !== null;
  const useSeatViewerBackground = cardData?.seatViewer != null;

  const handleGuidedExperienceConfirm = useCallback(() => {
    actions.addMessageToHistory(MessageFactory.createUserMessage('I confirm'));
  }, [actions]);

  return {
    websocket: websocket ?? null,
    cardData,
    hasCards,
    handleGuidedExperienceConfirm,
    useSeatViewerBackground
  };
};

function cardsFromSessionFields(state: State): MessageCardSet | null {
  const cards: MessageCardSet = {
    flightsSearch: state.flightsSearchData,
    fareSelection: state.fareSelectionData,
    bookingSummary: state.bookingSummaryData,
    guidedExperience: state.guidedExperienceData,
    seatViewer: state.seatViewerData,
  };
  return hasVisibleCards(cards) ? cards : null;
}

function hasVisibleCards(cards: MessageCardSet | undefined): cards is MessageCardSet {
  if (!cards) return false;
  return Object.values(cards).some((value) => {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
}
