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
    console.log('[HistorySyncListener] 🎯 Executing history sync', { payload });
    
    const data = payload.data as HistorySyncPayload;
    
    if (!data || !data.messages) {
      console.warn('[HistorySyncListener] ⚠️ Received history sync without messages', { data });
      return;
    }

    console.log(`[HistorySyncListener] 📜 Syncing ${data.messages.length} messages from kiosk`);
    console.log('[HistorySyncListener] Messages to sync:', data.messages);
    console.log('[HistorySyncListener] Current history before sync:', session.state.history);
    
    // Add all messages to history
    // This ensures the remote has the exact same conversation state as the kiosk
    // Mark messages as historical to disable animation
    data.messages.forEach((message, index) => {
      console.log(`[HistorySyncListener] Adding message ${index + 1}/${data.messages.length}:`, {
        id: message.id,
        sender: message.sender,
        content: message.content?.substring(0, 50) + '...',
        timestamp: message.timestamp
      });
      session.actions.addMessageToHistory({
        ...message,
        isHistorical: true
      });
    });
    
    console.log('[HistorySyncListener] History after sync:', session.state.history);
    
    // Sync message cards if provided
    if (data.messageCards && Object.keys(data.messageCards).length > 0) {
      console.log(`[HistorySyncListener] 🎴 Syncing ${Object.keys(data.messageCards).length} message cards`);
      
      // Apply each card data to the appropriate message
      // The card data is already keyed by messageId, which matches our history messages
      Object.entries(data.messageCards).forEach(([messageId, cardData]) => {
        if (!cardData) return;
        
        // Determine card type by checking data structure
        // This allows the remote to properly display cards for each message
        if (Array.isArray(cardData)) {
          // Could be flights or fares
          if (cardData.length > 0 && 'flightNumber' in cardData[0]) {
            // Flights data
            console.log(`[HistorySyncListener] Setting flights data for message ${messageId}`);
            session.actions.setFlightsSearchData(cardData, messageId);
          } else if (cardData.length > 0 && 'boundId' in cardData[0]) {
            // Fares data
            console.log(`[HistorySyncListener] Setting fares data for message ${messageId}`);
            session.actions.setFareSelectionData(cardData, messageId);
          }
        } else if (typeof cardData === 'object' && 'cabinClass' in cardData) {
          // Booking summary data
          console.log(`[HistorySyncListener] Setting booking summary for message ${messageId}`);
          session.actions.setBookingSummaryData(cardData, messageId);
        }
      });
    }
    
    console.log('[HistorySyncListener] ✅ History sync complete - remote is now in sync with kiosk');
  }
}
