import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FlightsSearchData } from "@/types/flight";

/**
 * Handle the FlightsSearch event.
 * When a flights search event is received, fetch flights search data from persistent state
 * and store it in session state for display on the Remote page.
 */
export class FlightsSearchListener implements CustomEventListener {
  type = "flight_search";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FlightsSearchListener] FlightsSearch event received');
    console.dir(data);

    // Fetch flights search data from persistent state
    try {
      if (!session.state.persist) {
        console.warn('[FlightsSearchListener] Persistent state not available');
        return;
      }

      const flightsSearchData = await session.state.persist.get<FlightsSearchData>('flights');

      if (flightsSearchData && Array.isArray(flightsSearchData) && flightsSearchData.length > 0) {
        console.log('[FlightsSearchListener] Flights search data found:', flightsSearchData);
        session.actions.setFlightsSearchData(flightsSearchData);
        session.actions.sendRemoteMessage({
          type: 'flights_search',
          payload: {
            data: flightsSearchData
          }
        });
      } else {
        console.log('[FlightsSearchListener] No flights search data found in state');
        session.actions.setFlightsSearchData(null);
      }
    } catch (error) {
      console.error('[FlightsSearchListener] Error fetching flights search data:', error);
      session.actions.setFlightsSearchData(null);
    }
  }
}
