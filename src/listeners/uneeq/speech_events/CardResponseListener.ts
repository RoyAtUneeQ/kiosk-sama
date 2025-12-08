import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { BookingData } from "@/types/booking";

/**
 * Handle the CardResponse event.
 * When a card event is received, fetch booking data from persistent state
 * and store it in session state for display on the Remote page.
 */
export class CardResponseListener implements CustomEventListener {
  type = "card";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[CardResponseListener] CardResponse event received');
    console.dir(data);

    // Fetch booking data from persistent state
    try {
      if (!session.state.persist) {
        console.warn('[CardResponseListener] Persistent state not available');
        return;
      }

      const bookingData = await session.state.persist.get<BookingData>('booking');

      if (bookingData && bookingData.data && Array.isArray(bookingData.data) && bookingData.data.length > 0) {
        console.log('[CardResponseListener] Booking data found:', bookingData);
        session.actions.setBookingData(bookingData);
        session.actions.sendRemoteMessage({
          type: 'card',
          payload: {
            data: bookingData
          }
        });
      } else {
        console.log('[CardResponseListener] No booking data found in state');
        session.actions.setBookingData(null);
      }
    } catch (error) {
      console.error('[CardResponseListener] Error fetching booking data:', error);
      session.actions.setBookingData(null);
    }
  }
}
