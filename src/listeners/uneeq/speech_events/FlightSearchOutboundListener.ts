import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FlightsSearchData } from "@/types/booking";

export class FlightSearchOutboundListener implements CustomEventListener {
  type = "flight_search_outbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FlightSearchOutboundListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.log('[FlightSearchOutboundListener] ⚠️  State manager not available');
        return;
      }

      console.log('[FlightSearchOutboundListener] 📊 Fetching from state manager', { key: 'flights_outbound' });
      const flightsSearchData = await session.state.stateManager.get<FlightsSearchData>('flights_outbound');

      if (flightsSearchData && Array.isArray(flightsSearchData) && flightsSearchData.length > 0) {
        console.log('[FlightSearchOutboundListener] ✅ Flights retrieved from state', {
          flightCount: flightsSearchData.length,
          sampleFlight: {
            flightId: flightsSearchData[0]?.flightId,
            flightNumber: flightsSearchData[0]?.flightNumber,
            departureDateTime: flightsSearchData[0]?.departureDateTime,
            minPrice: flightsSearchData[0]?.minPrice,
          }
        });

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

        console.log('[FlightSearchOutboundListener] 🔄 Data transformed', { transformedCount: transformedData.length });

        session.actions.setFlightsSearchData(transformedData);
        session.actions.sendRemoteMessage({
          type: 'flights_search_outbound',
          payload: {
            data: transformedData
          }
        });

        console.log('[FlightSearchOutboundListener] 📤 Remote message sent', { type: 'flights_search_outbound', flightCount: transformedData.length });
      } else {
        console.log('[FlightSearchOutboundListener] ⚠️  No flights found in state manager');
        session.actions.setFlightsSearchData(null);
      }
    } catch (error) {
      console.error('[FlightSearchOutboundListener] ❌ Error fetching flights outbound data:', error);
      session.actions.setFlightsSearchData(null);
    }
  }
}
