import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FlightsSearchData } from "@/types/booking";

export class FlightsSearchListener implements CustomEventListener {
  type = "flight_search";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FlightsSearchListener] FlightsSearch event received');
    console.dir(data);

    // Fetch flights search data from persistent state
    try {
      if (!session.state.stateManager) {
        console.warn('[FlightsSearchListener] State Manager not available');
        return;
      }

      const flightsSearchData = await session.state.stateManager.get<FlightsSearchData>('flights');

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
