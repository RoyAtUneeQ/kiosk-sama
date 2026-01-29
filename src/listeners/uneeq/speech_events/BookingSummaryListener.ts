import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { BookingSummaryData, FareSelectionData } from "@/types/booking";

export class BookingSummaryListener implements CustomEventListener {
  type = "booking_summary";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[BookingSummaryListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    // Fetch booking summary data from persistent state
    try {
      if (!session.state.stateManager) {
        console.log('[BookingSummaryListener] ⚠️  State manager not available');
        return;
      }

      console.log('[BookingSummaryListener] 📊 Fetching from state manager', { key: 'booking' });
      const bookingSummaryData = await session.state.stateManager.get<BookingSummaryData>('booking');

      if (bookingSummaryData && typeof bookingSummaryData === 'object' && bookingSummaryData.cabinClass && bookingSummaryData.destination?.destinationTitle) {
        console.log('[BookingSummaryListener] ✅ Booking summary retrieved', {
          cabinClass: bookingSummaryData.cabinClass,
          selectedOutboundFare: bookingSummaryData.selectedOutboundFare,
          selectedInboundFare: bookingSummaryData.selectedInboundFare,
          tripType: bookingSummaryData.tripType,
          bookingKeys: Object.keys(bookingSummaryData)
        });

        // Fetch fare selection data to get fareFamilyType (check both outbound and inbound)
        let fareFamilyType: string | undefined;
        try {
          console.log('[BookingSummaryListener] 📊 Fetching fare data for enrichment', {
            keys: ['fares_outbound', 'fares_inbound']
          });
          const [faresOutbound, faresInbound] = await Promise.all([
            session.state.stateManager.get<FareSelectionData>('fares_outbound'),
            session.state.stateManager.get<FareSelectionData>('fares_inbound'),
          ]);
          const fareSelectionData = [
            ...(Array.isArray(faresOutbound) ? faresOutbound : []),
            ...(Array.isArray(faresInbound) ? faresInbound : []),
          ];

          console.log('[BookingSummaryListener] ✅ Fare data retrieved for enrichment', {
            totalFares: fareSelectionData.length,
            outboundCount: Array.isArray(faresOutbound) ? faresOutbound.length : 0,
            inboundCount: Array.isArray(faresInbound) ? faresInbound.length : 0,
          });

          if (fareSelectionData.length > 0) {
            // Conditionally match fare based on trip type
            if (bookingSummaryData.tripType === 'one-way') {
              // One-way: match outbound fare only
              const outboundFare = fareSelectionData.find(fare => fare.boundId === bookingSummaryData.selectedOutboundFare);
              fareFamilyType = outboundFare?.fareFamilyType ?? fareSelectionData[0]?.fareFamilyType;

              console.log('[BookingSummaryListener] 🔍 Fare family resolved (one-way)', {
                fareFamilyType,
                matchedOutbound: !!outboundFare,
                selectedOutboundFare: bookingSummaryData.selectedOutboundFare
              });
            } else {
              // Round-trip: prefer outbound, fallback to inbound
              const outboundFare = fareSelectionData.find(fare => fare.boundId === bookingSummaryData.selectedOutboundFare);
              const inboundFare = fareSelectionData.find(fare => fare.boundId === bookingSummaryData.selectedInboundFare);
              fareFamilyType = outboundFare?.fareFamilyType || inboundFare?.fareFamilyType || fareSelectionData[0]?.fareFamilyType;

              console.log('[BookingSummaryListener] 🔍 Fare family resolved (round-trip)', {
                fareFamilyType,
                matchedOutbound: !!outboundFare,
                matchedInbound: !!inboundFare,
                selectedOutboundFare: bookingSummaryData.selectedOutboundFare,
                selectedInboundFare: bookingSummaryData.selectedInboundFare
              });
            }
          }
        } catch (error) {
          console.log('[BookingSummaryListener] ⚠️  Failed to fetch fare data for enrichment (continuing without)', error);
        }

        // Add fareFamilyType to bookingSummaryData
        const enrichedBookingSummaryData: BookingSummaryData = {
          ...bookingSummaryData,
          ...(fareFamilyType && { fareFamilyType })
        };

        console.log('[BookingSummaryListener] 🎁 Booking data enriched', {
          fareFamilyType: enrichedBookingSummaryData.fareFamilyType
        });

        session.actions.setBookingSummaryData(enrichedBookingSummaryData);
        session.actions.sendRemoteMessage({
          type: 'booking_summary',
          payload: {
            data: enrichedBookingSummaryData
          }
        });

        console.log('[BookingSummaryListener] 📤 Remote message sent', { type: 'booking_summary' });
      } else {
        console.log('[BookingSummaryListener] ⚠️  No valid booking summary data found');
        session.actions.setBookingSummaryData(null);
      }
    } catch (error) {
      console.error('[BookingSummaryListener] ❌ Error fetching booking summary data:', error);
      session.actions.setBookingSummaryData(null);
    }
  }
}

