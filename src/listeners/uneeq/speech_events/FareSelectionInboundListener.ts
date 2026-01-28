import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FareSelectionData } from "@/types/booking";

export class FareSelectionInboundListener implements CustomEventListener {
  type = "fare_selection_inbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FareSelectionInboundListener] Fare selection inbound event received');
    console.dir(data);

    // Fetch fare selection data from persistent state
    try {
      if (!session.state.stateManager) {
        console.warn('[FareSelectionInboundListener] State Manager not available');
        return;
      }

      const fareSelectionData = await session.state.stateManager.get<FareSelectionData>('fares_inbound');

      if (fareSelectionData && Array.isArray(fareSelectionData) && fareSelectionData.length > 0) {
        console.log('[FareSelectionInboundListener] Fare selection inbound data found:', fareSelectionData);
        session.actions.setFareSelectionData(fareSelectionData);
        session.actions.sendRemoteMessage({
          type: 'fare_selection_inbound',
          payload: {
            data: fareSelectionData
          }
        });
      } else {
        console.log('[FareSelectionInboundListener] No fare selection inbound data found in state');
        session.actions.setFareSelectionData(null);
      }
    } catch (error) {
      console.error('[FareSelectionInboundListener] Error fetching fare selection inbound data:', error);
      session.actions.setFareSelectionData(null);
    }
  }
}
