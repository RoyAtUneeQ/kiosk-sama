import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FareSelectionData } from "@/types/booking";

export class FareSelectionOutboundListener implements CustomEventListener {
  type = "fare_selection_outbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FareSelectionOutboundListener] Fare selection outbound event received');
    console.dir(data);

    // Fetch fare selection data from persistent state
    try {
      if (!session.state.stateManager) {
        console.warn('[FareSelectionOutboundListener] State Manager not available');
        return;
      }

      const fareSelectionData = await session.state.stateManager.get<FareSelectionData>('fares_outbound');

      if (fareSelectionData && Array.isArray(fareSelectionData) && fareSelectionData.length > 0) {
        console.log('[FareSelectionOutboundListener] Fare selection outbound data found:', fareSelectionData);
        session.actions.setFareSelectionData(fareSelectionData);
        session.actions.sendRemoteMessage({
          type: 'fare_selection_outbound',
          payload: {
            data: fareSelectionData
          }
        });
      } else {
        console.log('[FareSelectionOutboundListener] No fare selection outbound data found in state');
        session.actions.setFareSelectionData(null);
      }
    } catch (error) {
      console.error('[FareSelectionOutboundListener] Error fetching fare selection outbound data:', error);
      session.actions.setFareSelectionData(null);
    }
  }
}
