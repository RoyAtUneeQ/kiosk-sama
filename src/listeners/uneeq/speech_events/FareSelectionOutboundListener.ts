import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FareSelectionData } from "@/types/booking";

export class FareSelectionOutboundListener implements CustomEventListener {
  type = "fare_selection_outbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FareSelectionOutboundListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    // Fetch fare selection data from persistent state
    try {
      if (!session.state.stateManager) {
        console.log('[FareSelectionOutboundListener] ⚠️  State manager not available');
        return;
      }

      console.log('[FareSelectionOutboundListener] 📊 Fetching from state manager', { key: 'fares_outbound' });
      const fareSelectionData = await session.state.stateManager.get<FareSelectionData>('fares_outbound');

      if (fareSelectionData && Array.isArray(fareSelectionData) && fareSelectionData.length > 0) {
        console.log('[FareSelectionOutboundListener] ✅ Fares retrieved successfully', {
          fareCount: fareSelectionData.length,
          sampleFare: {
            boundId: fareSelectionData[0]?.boundId,
            flightId: fareSelectionData[0]?.flightId,
            priceTotal: fareSelectionData[0]?.priceTotal,
            priceCurrency: fareSelectionData[0]?.priceCurrency,
            fareFamilyType: fareSelectionData[0]?.fareFamilyType,
          }
        });

        session.actions.setFareSelectionData(fareSelectionData);
        session.actions.sendRemoteMessage({
          type: 'fare_selection_outbound',
          payload: {
            data: fareSelectionData
          }
        });

        console.log('[FareSelectionOutboundListener] 📤 Remote message sent', { type: 'fare_selection_outbound', fareCount: fareSelectionData.length });
      } else {
        console.log('[FareSelectionOutboundListener] ⚠️  No fares found in state manager');
        session.actions.setFareSelectionData(null);
      }
    } catch (error) {
      console.error('[FareSelectionOutboundListener] ❌ Error fetching fare selection outbound data:', error);
      session.actions.setFareSelectionData(null);
    }
  }
}
