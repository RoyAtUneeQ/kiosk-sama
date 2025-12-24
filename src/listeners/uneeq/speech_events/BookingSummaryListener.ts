import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { BookingSummaryData } from "@/types/booking";

export class BookingSummaryListener implements CustomEventListener {
  type = "booking_summary";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[BookingSummaryListener] BookingSummary event received');
    console.dir(data);

    // Fetch booking summary data from persistent state
    try {
      if (!session.state.stateManager) {
        console.warn('[BookingSummaryListener] State Manager not available');
        return;
      }

      const bookingSummaryData = await session.state.stateManager.get<BookingSummaryData>('booking');

      if (bookingSummaryData && typeof bookingSummaryData === 'object' && bookingSummaryData.cabinClass) {
        console.log('[BookingSummaryListener] Booking summary data found:', bookingSummaryData);
        session.actions.setBookingSummaryData(bookingSummaryData);
        session.actions.sendRemoteMessage({
          type: 'booking_summary',
          payload: {
            data: bookingSummaryData
          }
        });
      } else {
        console.log('[BookingSummaryListener] No booking summary data found in state');
        session.actions.setBookingSummaryData(null);
      }
    } catch (error) {
      console.error('[BookingSummaryListener] Error fetching booking summary data:', error);
      session.actions.setBookingSummaryData(null);
    }
  }
}

