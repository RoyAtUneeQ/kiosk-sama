import type { SessionContextType } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { Message } from '@/types/transport/Message';

interface HistorySyncPayload {
  type: 'historySync';
  messages: Message[];
  messageCards: Record<string, any>;
}

/**
 * HistorySyncListener - Handles receiving complete conversation history from kiosk
 * 
 * When a remote connects to an already active kiosk session, this listener
 * receives and applies the full conversation history so the remote user can
 * see the complete transcription from the beginning.
 * 
 * This includes:
 * - All conversation messages (user and assistant)
 * - Card data associated with messages (flights, fares, booking summaries)
 */
export class HistorySyncListener implements WebSocketEventListener {
  eventType = WebSocketEventType.HISTORY_SYNC;

  execute(payload: any, session: SessionContextType): void {
    const data = payload.data as HistorySyncPayload;

    if (!data || !data.messages) {
      return;
    }

    console.log(
      '%c📥 HISTORY SYNC',
      'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      `${data.messages.length} messages`
    );

    data.messages.forEach((message) => {
      session.actions.addMessageToHistory({
        ...message,
        isHistorical: true
      });
    });

    if (data.messageCards && Object.keys(data.messageCards).length > 0) {
      Object.entries(data.messageCards).forEach(([messageId, cardData]) => {
        if (!cardData) return;

        const card = cardData as Record<string, unknown>;
        const isMessageCardSet =
          typeof card === 'object' &&
          !Array.isArray(card) &&
          ('fareSelection' in card || 'addToCart' in card || 'flightsSearch' in card || 'bookingSummary' in card || 'passengerDetails' in card || 'contactDetails' in card);

        if (isMessageCardSet) {
          if (card.fareSelection != null) session.actions.setFareSelectionData(card.fareSelection as any, messageId);
          if (card.flightsSearch != null) session.actions.setFlightsSearchData(card.flightsSearch as any, messageId);
          if (card.bookingSummary != null) session.actions.setBookingSummaryData(card.bookingSummary as any, messageId);
          if (card.addToCart != null) session.actions.setAddToCartData(card.addToCart as any, messageId);
          if (card.passengerDetails != null) session.actions.setPassengerDetailsData(card.passengerDetails as any, messageId);
          if (card.contactDetails != null) session.actions.setContactDetailsData(card.contactDetails as any, messageId);
          return;
        }

        // Legacy shape: single card value
        if (Array.isArray(cardData)) {
          if (cardData.length > 0 && 'flightNumber' in cardData[0]) {
            session.actions.setFlightsSearchData(cardData, messageId);
          } else if (cardData.length > 0 && 'boundId' in cardData[0]) {
            session.actions.setFareSelectionData(cardData, messageId);
          }
        } else if (typeof cardData === 'object' && 'cabinClass' in cardData) {
          session.actions.setBookingSummaryData(cardData, messageId);
        }
      });
    }
  }
}
