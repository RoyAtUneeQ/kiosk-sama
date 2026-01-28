import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FlightsSearchData } from "@/types/booking";

export class FlightSearchInboundListener implements CustomEventListener {
  type = "flight_search_inbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FlightSearchInboundListener] Flight search inbound event received');
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.warn('[FlightSearchInboundListener] State Manager not available');
        return;
      }

      const flightsSearchData = await session.state.stateManager.get<FlightsSearchData>('flights_inbound');

      if (flightsSearchData && Array.isArray(flightsSearchData) && flightsSearchData.length > 0) {
        console.log('[FlightSearchInboundListener] Flights inbound data found (raw):', flightsSearchData);

        const transformedData: FlightsSearchData = flightsSearchData.map((flight: any) => ({
          flightId: flight.flightId,
          duration: flight.duration,
          numberOfStops: flight.numberOfStops,
          minPrice: flight.lowestFare || flight.minPrice,
          departureDateTime: flight.departure || flight.departureDateTime,
          currency: flight.currency,
          arrivalDateTime: flight.arrival || flight.arrivalDateTime,
          hasQSuite: flight.hasQSuite,
          flightNumber: flight.flightNumber,
          origin: flight.origin,
          destination: flight.destination,
          segments: flight.segments,
          flightOfferId: flight.flightOfferId,
        }));

        console.log('[FlightSearchInboundListener] Transformed flights inbound data:', transformedData);
        session.actions.setFlightsSearchData(transformedData);
        session.actions.sendRemoteMessage({
          type: 'flights_search_inbound',
          payload: {
            data: transformedData
          }
        });
      } else {
        console.log('[FlightSearchInboundListener] No flights inbound data found in state');
        session.actions.setFlightsSearchData(null);
      }
    } catch (error) {
      console.error('[FlightSearchInboundListener] Error fetching flights inbound data:', error);
      session.actions.setFlightsSearchData(null);
    }
  }
}
