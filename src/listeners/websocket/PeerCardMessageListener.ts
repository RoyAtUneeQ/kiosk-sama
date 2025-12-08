import type { SessionContextType } from '@/contexts/SessionContext';
import type { BookingData } from '@/types/booking';

/**
 * Handles peer messages with type 'card' (e.g., booking data).
 * These messages are not added to message history but instead update
 * the booking data state for display as cards.
 */
export class PeerCardMessageListener {
  /**
   * Handle card-type peer messages by updating booking data state.
   * @param payload - The card message payload containing booking data
   * @param session - Current session context
   * @returns true if the message was handled as a card message, false otherwise
   */
  static execute(payload: any, session: SessionContextType): boolean {
    // Check if this is a card message
    if (!payload.data || payload.data.type !== 'card' || !payload.data.payload) {
      return false; // Not a card message, let other handlers process it
    }

    const bookingData = payload.data.payload.data as BookingData;
    console.log('[PeerCardMessageListener] Card message received, updating booking data:', bookingData);
    
    if (bookingData && bookingData.data && Array.isArray(bookingData.data) && bookingData.data.length > 0) {
      session.actions.setBookingData(bookingData);
    } else {
      session.actions.setBookingData(null);
    }
    
    // Card messages are not added to history - they're displayed as cards instead
    return true; // Message was handled
  }
}
