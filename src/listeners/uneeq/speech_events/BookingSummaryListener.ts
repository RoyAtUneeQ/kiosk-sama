import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { BookingSummaryData, FareSelectionData } from "@/types/booking";

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
        // Fetch fare selection data to get fareFamilyType
        let fareFamilyType: string | undefined;
        try {
          const fareSelectionData = await session.state.stateManager.get<FareSelectionData>('fares');
          if (fareSelectionData && Array.isArray(fareSelectionData) && fareSelectionData.length > 0) {
            // Try to find fare matching selectedFare by boundId, otherwise use first fare
            const selectedFare = fareSelectionData.find(fare => fare.boundId === bookingSummaryData.selectedFare);
            fareFamilyType = selectedFare?.fareFamilyType ?? fareSelectionData[0]?.fareFamilyType;
          }
        } catch (error) {
          console.warn('[BookingSummaryListener] Error fetching fare selection data for fareFamilyType:', error);
        }

        // Add fareFamilyType to bookingSummaryData
        const enrichedBookingSummaryData: BookingSummaryData = {
          ...bookingSummaryData,
          ...(fareFamilyType && { fareFamilyType })
        };

        console.log('[BookingSummaryListener] Booking summary data found:', enrichedBookingSummaryData);
        session.actions.setBookingSummaryData(enrichedBookingSummaryData);
        session.actions.sendRemoteMessage({
          type: 'booking_summary',
          payload: {
            data: enrichedBookingSummaryData
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

