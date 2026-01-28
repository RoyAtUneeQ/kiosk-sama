import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FlightsSearchData } from "@/types/booking";

export class FlightSearchOutboundListener implements CustomEventListener {
  type = "flight_search_outbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FlightSearchOutboundListener] Flight search outbound event received');
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.warn('[FlightSearchOutboundListener] State Manager not available');
        return;
      }

      const flightsSearchData = await session.state.stateManager.get<FlightsSearchData>('flights_outbound');

      if (flightsSearchData && Array.isArray(flightsSearchData) && flightsSearchData.length > 0) {
        console.log('[FlightSearchOutboundListener] Flights outbound data found (raw):', flightsSearchData);

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

        console.log('[FlightSearchOutboundListener] Transformed flights outbound data:', transformedData);
        session.actions.setFlightsSearchData(transformedData);
        session.actions.sendRemoteMessage({
          type: 'flights_search_outbound',
          payload: {
            data: transformedData
          }
        });
      } else {
        console.log('[FlightSearchOutboundListener] No flights outbound data found in state');
        session.actions.setFlightsSearchData(null);
      }
    } catch (error) {
      console.error('[FlightSearchOutboundListener] Error fetching flights outbound data:', error);
      session.actions.setFlightsSearchData(null);
    }
  }
}
