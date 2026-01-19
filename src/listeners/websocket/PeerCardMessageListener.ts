import type { SessionContextType } from '@/contexts/SessionContext';
import type { FlightsSearchData, FareSelectionData } from '@/types/booking';
import type { BookingSummaryData } from '@/types/booking';

export class PeerCardMessageListener {
  static execute(payload: any, session: SessionContextType): boolean {
    // Check if this is a card message
    console.log('[PeerCardMessageListener] Card message received:', payload);
    
    if (!payload.data || !payload.data.type || !payload.data.payload) {
      return false; // Not a card message, let other handlers process it
    }

    // Handle flights search messages
    if (payload.data.type === 'flights_search') {
      // The payload structure is: payload.data.payload.data contains the array of flights
      const flightsData = payload.data.payload.data;
      console.log('[PeerCardMessageListener] Flights search message received, raw data:', flightsData);
      
      if (flightsData && Array.isArray(flightsData) && flightsData.length > 0) {
        // Transform the data to match FlightData interface
        // The API returns 'departure' and 'arrival', but we need 'departureDateTime' and 'arrivalDateTime'
        const flightsSearchData: FlightsSearchData = flightsData.map((flight: any) => ({
          ...flight,
          departureDateTime: flight.departure || flight.departureDateTime,
          arrivalDateTime: flight.arrival || flight.arrivalDateTime,
        }));
        console.log('[PeerCardMessageListener] Transformed flights data:', flightsSearchData);
        session.actions.setFlightsSearchData(flightsSearchData);
      } else {
        session.actions.setFlightsSearchData(null);
      }
      
      // Flights search messages are not added to history - they're displayed as cards instead
      return true; // Message was handled
    }

    // Handle fare selection messages
    if (payload.data.type === 'fare_selection') {
      // The payload structure is: payload.data.payload.data contains the array of fares
      const faresData = payload.data.payload.data;
      console.log('[PeerCardMessageListener] Fare selection message received, updating fare selection data:', faresData);
      
      if (faresData && Array.isArray(faresData) && faresData.length > 0) {
        // Set FareSelectionData directly as the array of fares
        const fareSelectionData: FareSelectionData = faresData;
        session.actions.setFareSelectionData(fareSelectionData);
      } else {
        session.actions.setFareSelectionData(null);
      }
      
      // Fare selection messages are not added to history - they're displayed as cards instead
      return true; // Message was handled
    }

    // Handle booking summary messages
    if (payload.data.type === 'booking_summary') {
      // The payload structure is: payload.data.payload.data contains the booking summary object
      const bookingData = payload.data.payload.data;
      console.log('[PeerCardMessageListener] Booking summary message received, updating booking summary data:', bookingData);
      
      if (bookingData && typeof bookingData === 'object' && bookingData.cabinClass) {
        // Construct BookingSummaryData object
        const bookingSummaryData: BookingSummaryData = bookingData;
        session.actions.setBookingSummaryData(bookingSummaryData);
      } else {
        session.actions.setBookingSummaryData(null);
      }
      
      // Booking summary messages are not added to history - they're displayed as cards instead
      return true; // Message was handled
    }

    return false; // Not a recognized card message type
  }
}
