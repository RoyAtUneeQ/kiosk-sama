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
    if (!websocket || !remoteConnectionId) {
      return;
    }

    const actionFactory = createActionFactory();
    const interval = setInterval(() => {
      websocket.send(actionFactory.checkPeerConnection(remoteConnectionId));
    }, 1000);

    return () => clearInterval(interval);
  }, [websocket, state.remoteInfo?.connectionId]);

  const cardData: CardData = state.bookingSummaryData ?? state.fareSelectionData ?? state.flightsSearchData;
  
  let lastAssistantMessage: Message | null = null;
  for (let i = state.history.length - 1; i >= 0; i--) {
    if (state.history[i].sender === MessageSender.Assistant) {
      lastAssistantMessage = state.history[i];
      break;
    }
  }

  const hasCards = cardData !== null && lastAssistantMessage !== null;

  return {
    websocket: websocket ?? null,
    cardData,
    lastAssistantMessage,
    hasCards
  };
};
