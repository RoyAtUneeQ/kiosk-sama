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
        console.log('[FlightsSearchListener] Flights search data found (raw):', flightsSearchData);
        
        // Transform the data to match FlightData interface
        // The API returns 'departure' and 'arrival', but we need 'departureDateTime' and 'arrivalDateTime'
        const transformedData: FlightsSearchData = flightsSearchData.map((flight: any) => ({
          flightId: flight.flightId,
          duration: flight.duration,
          numberOfStops: flight.numberOfStops,
          minPrice: flight.lowestFare || flight.minPrice, // API uses 'lowestFare' now
          departureDateTime: flight.departure || flight.departureDateTime,
          currency: flight.currency,
          arrivalDateTime: flight.arrival || flight.arrivalDateTime,
          hasQSuite: flight.hasQSuite, // Optional field
          flightNumber: flight.flightNumber,
          // Include additional fields from new API
          origin: flight.origin,
          destination: flight.destination,
          segments: flight.segments,
          flightOfferId: flight.flightOfferId,
        }));
        
        console.log('[FlightsSearchListener] Transformed flights data:', transformedData);
        session.actions.setFlightsSearchData(transformedData);
        session.actions.sendRemoteMessage({
          type: 'flights_search',
          payload: {
            data: transformedData
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
