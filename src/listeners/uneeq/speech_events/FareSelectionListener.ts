import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FareSelectionData } from "@/types/booking";

export class FareSelectionListener implements CustomEventListener {
  type = "fare_selection";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FareSelectionListener] FareSelection event received');
    console.dir(data);

    // Fetch fare selection data from persistent state
    try {
      if (!session.state.stateManager) {
        console.warn('[FareSelectionListener] State Manager not available');
        return;
      }

      const fareSelectionData = await session.state.stateManager.get<FareSelectionData>('fares');

      if (fareSelectionData && Array.isArray(fareSelectionData) && fareSelectionData.length > 0) {
        console.log('[FareSelectionListener] Fare selection data found:', fareSelectionData);
        session.actions.setFareSelectionData(fareSelectionData);
        session.actions.sendRemoteMessage({
          type: 'fare_selection',
          payload: {
            data: fareSelectionData
          }
        });
      } else {
        console.log('[FareSelectionListener] No fare selection data found in state');
        session.actions.setFareSelectionData(null);
      }
    } catch (error) {
      console.error('[FareSelectionListener] Error fetching fare selection data:', error);
      session.actions.setFareSelectionData(null);
    }
  }
}

