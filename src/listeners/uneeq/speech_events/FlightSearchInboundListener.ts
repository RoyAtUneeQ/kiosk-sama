import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { FlightsSearchData } from "@/types/booking";

export class FlightSearchInboundListener implements CustomEventListener {
  type = "flight_search_inbound";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[FlightSearchInboundListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.log('[FlightSearchInboundListener] ⚠️  State manager not available');
        return;
      }

      console.log('[FlightSearchInboundListener] 📊 Fetching from state manager', { key: 'flights_inbound' });
      const flightsSearchData = await session.state.stateManager.get<FlightsSearchData>('flights_inbound');

      if (flightsSearchData && Array.isArray(flightsSearchData) && flightsSearchData.length > 0) {
        console.log('[FlightSearchInboundListener] ✅ Flights retrieved from state', {
          flightCount: flightsSearchData.length,
          sampleFlight: {
            flightId: flightsSearchData[0]?.flightId,
            flightNumber: flightsSearchData[0]?.flightNumber,
            departure: flightsSearchData[0]?.departure || flightsSearchData[0]?.departureDateTime,
            minPrice: flightsSearchData[0]?.lowestFare || flightsSearchData[0]?.minPrice,
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

        console.log('[FlightSearchInboundListener] 🔄 Data transformed', { transformedCount: transformedData.length });

        session.actions.setFlightsSearchData(transformedData);
        session.actions.sendRemoteMessage({
          type: 'flights_search_inbound',
          payload: {
            data: transformedData
          }
        });

        console.log('[FlightSearchInboundListener] 📤 Remote message sent', { type: 'flights_search_inbound', flightCount: transformedData.length });
      } else {
        console.log('[FlightSearchInboundListener] ⚠️  No flights found in state manager');
        session.actions.setFlightsSearchData(null);
      }
    } catch (error) {
      console.error('[FlightSearchInboundListener] ❌ Error fetching flights inbound data:', error);
      session.actions.setFlightsSearchData(null);
    }
  }
}
