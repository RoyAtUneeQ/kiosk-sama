import { useSession } from '@/contexts/SessionContext';
import { MessageSender } from '@/types';
import type { Message } from '@/types/transport/Message';
import type { FlightsSearchData, FareSelectionData, BookingSummaryData } from '@/types/booking';

type CardData = FlightsSearchData | FareSelectionData | BookingSummaryData | null;

interface UseCardDataReturn {
  cardData: CardData;
  lastAssistantMessage: Message | null;
  hasCards: boolean;
}

export function useCardData(): UseCardDataReturn {
  const { state } = useSession();
  const cardData: CardData = state.bookingSummaryData ?? state.fareSelectionData ?? state.flightsSearchData;
  let lastAssistantMessage: Message | null = null;
  for (let i = state.history.length - 1; i >= 0; i--) {
    if (state.history[i].sender === MessageSender.Assistant) {
      lastAssistantMessage = state.history[i];
      break;
    }
  }

  const hasCards = cardData !== null && lastAssistantMessage !== null;

  return { cardData, lastAssistantMessage, hasCards };
}
