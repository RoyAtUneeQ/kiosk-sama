import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FareSelectionData } from "@/types/fare";

/**
 * Handle the FareSelection event.
 * When a fare selection event is received, fetch fare selection data from persistent state
 * and store it in session state for display on the Remote page.
 */
export class FareSelectionListener implements CustomEventListener {
  type = "fare_selection";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FareSelectionListener] FareSelection event received');
    console.dir(data);

    // Fetch fare selection data from persistent state
    try {
      if (!session.state.persist) {
        console.warn('[FareSelectionListener] Persistent state not available');
        return;
      }

      const fareSelectionData = await session.state.persist.get<FareSelectionData>('fares');

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

