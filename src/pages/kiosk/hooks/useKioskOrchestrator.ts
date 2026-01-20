import { useEffect } from 'react';
import type { Config } from '@/types';
import type { UneeqOptions } from '@/types/uneeq';
import { defaultUneeqOptions, MessageSender } from '@/types';
import type { Message } from '@/types/transport/Message';
import type { FlightsSearchData, FareSelectionData, BookingSummaryData } from '@/types/booking';
import {
  useUneeq,
  useStateManager,
  useWebSocketAdapter
} from '@/hooks';
import { useSession } from '@/contexts/SessionContext';
import { createActionFactory } from '@/factories';
import type { WebSocketService } from '@/services';

interface UseKioskOrchestratorParams {
  config: Config | null;
  language: string;
  renderMode: 'cloud' | 'miniprem';
}

type CardData = FlightsSearchData | FareSelectionData | BookingSummaryData | null;

interface UseKioskOrchestratorReturn {
  websocket: WebSocketService | null;
  cardData: CardData;
  lastAssistantMessage: Message | null;
  hasCards: boolean;
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
        console.log('[useKioskOrchestrator] ⏸️ Remote disconnected, stopping peer checks');
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
        console.log(`[useKioskOrchestrator] ✅ Connection recovered, resetting failure count`);
        consecutiveFailures = 0;
      }

      websocket.send(actionFactory.checkPeerConnection(currentRemoteId));
    }, 60000);

    return () => clearInterval(interval);
  }, [websocket, state.remoteInfo?.connectionId, actions]);

  const cardData: CardData = state.bookingSummaryData ?? state.fareSelectionData ?? state.flightsSearchData;
  
  console.log('[useKioskOrchestrator] Card data state:', {
    hasBookingSummaryData: !!state.bookingSummaryData,
    hasFareSelectionData: !!state.fareSelectionData,
    hasFlightsSearchData: !!state.flightsSearchData,
    selectedCardData: cardData ? (Array.isArray(cardData) ? `Array[${cardData.length}]` : 'Object') : 'null',
    bookingSummaryDataType: typeof state.bookingSummaryData,
    fareSelectionDataType: typeof state.fareSelectionData,
    flightsSearchDataType: typeof state.flightsSearchData,
  });
  
  let lastAssistantMessage: Message | null = null;
  for (let i = state.history.length - 1; i >= 0; i--) {
    if (state.history[i].sender === MessageSender.Assistant) {
      lastAssistantMessage = state.history[i];
      break;
    }
  }

  const hasCards = cardData !== null && lastAssistantMessage !== null;
  
  console.log('[useKioskOrchestrator] Card display state:', {
    hasCards,
    hasLastAssistantMessage: !!lastAssistantMessage,
    lastAssistantMessageId: lastAssistantMessage?.id,
    cardDataExists: !!cardData,
  });

  return {
    websocket: websocket ?? null,
    cardData,
    lastAssistantMessage,
    hasCards
  };
};
