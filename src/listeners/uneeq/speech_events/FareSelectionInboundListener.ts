import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FareSelectionData } from "@/types/booking";

export class FareSelectionInboundListener implements CustomEventListener {
  type = "fare_selection_inbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FareSelectionInboundListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    // Fetch fare selection data from persistent state
    try {
      if (!session.state.stateManager) {
        console.log('[FareSelectionInboundListener] ⚠️  State manager not available');
        return;
      }

      console.log('[FareSelectionInboundListener] 📊 Fetching from state manager', { key: 'fares_inbound' });
      const fareSelectionData = await session.state.stateManager.get<FareSelectionData>('fares_inbound');

      if (fareSelectionData && Array.isArray(fareSelectionData) && fareSelectionData.length > 0) {
        console.log('[FareSelectionInboundListener] ✅ Fares retrieved successfully', {
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
          type: 'fare_selection_inbound',
          payload: {
            data: fareSelectionData
          }
        });

        console.log('[FareSelectionInboundListener] 📤 Remote message sent', { type: 'fare_selection_inbound', fareCount: fareSelectionData.length });
      } else {
        console.log('[FareSelectionInboundListener] ⚠️  No fares found in state manager');
        session.actions.setFareSelectionData(null);
      }
    } catch (error) {
      console.error('[FareSelectionInboundListener] ❌ Error fetching fare selection inbound data:', error);
      session.actions.setFareSelectionData(null);
    }
  }
}
