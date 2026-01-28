import type { SessionContextType } from '@/contexts/SessionContext';
import type { FlightsSearchData, FareSelectionData, AddToCartData, PassengerDetailsData, ContactDetailsData } from '@/types/booking';
import type { BookingSummaryData } from '@/types/booking';

export class PeerCardMessageListener {
  static execute(payload: any, session: SessionContextType): boolean {
    // Check if this is a card message
    console.log('[PeerCardMessageListener] Card message received:', payload);
    
    if (!payload.data || !payload.data.type || !payload.data.payload) {
      return false; // Not a card message, let other handlers process it
    }

    // Handle flights search messages (outbound and inbound use same payload structure)
    const flightsSearchTypes = ['flights_search_outbound', 'flights_search_inbound'] as const;
    if (flightsSearchTypes.includes(payload.data.type as (typeof flightsSearchTypes)[number])) {
      const flightsData = payload.data.payload.data;
      console.log(`[PeerCardMessageListener] Flights search (${payload.data.type}) message received, raw data:`, flightsData);

      if (flightsData && Array.isArray(flightsData) && flightsData.length > 0) {
        const flightsSearchData: FlightsSearchData = flightsData.map((flight: any) => ({
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
        session.actions.setFlightsSearchData(flightsSearchData);
      } else {
        session.actions.setFlightsSearchData(null);
      }

      return true;
    }

    // Handle fare selection messages (outbound and inbound)
    if (payload.data.type === 'fare_selection_outbound' || payload.data.type === 'fare_selection_inbound') {
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

    // Handle add to cart messages
    if (payload.data.type === 'add_to_cart') {
      // The payload structure is: payload.data.payload.data contains the cart data object
      const cartData = payload.data.payload.data;
      console.log('[PeerCardMessageListener] Add to cart message received, updating cart data:', cartData);
      
      if (cartData && typeof cartData === 'object' && cartData.items && Array.isArray(cartData.items)) {
        const addToCartData: AddToCartData = cartData;
        session.actions.setAddToCartData(addToCartData);
      } else {
        session.actions.setAddToCartData(null);
      }
      
      // Add to cart messages are not added to history - they're displayed as cards instead
      return true; // Message was handled
    }

    // Handle passenger details messages
    if (payload.data.type === 'passenger_details') {
      // The payload structure is: payload.data.payload.data contains the passenger details object
      const passengerData = payload.data.payload.data;
      console.log('[PeerCardMessageListener] Passenger details message received, updating passenger details data:', passengerData);
      
      if (passengerData && typeof passengerData === 'object' && passengerData.passengerId && passengerData.firstName && passengerData.lastName) {
        const passengerDetailsData: PassengerDetailsData = passengerData;
        session.actions.setPassengerDetailsData(passengerDetailsData);
      } else {
        session.actions.setPassengerDetailsData(null);
      }
      
      // Passenger details messages are not added to history - they're displayed as cards instead
      return true; // Message was handled
    }

    // Handle contact details messages
    if (payload.data.type === 'contact_details') {
      // The payload structure is: payload.data.payload.data contains the contact details object
      const contactData = payload.data.payload.data;
      console.log('[PeerCardMessageListener] Contact details message received, updating contact details data:', contactData);
      
      if (contactData && typeof contactData === 'object' && contactData.email && contactData.phoneNumber) {
        const contactDetailsData: ContactDetailsData = contactData;
        session.actions.setContactDetailsData(contactDetailsData);
      } else {
        session.actions.setContactDetailsData(null);
      }
      
      // Contact details messages are not added to history - they're displayed as cards instead
      return true; // Message was handled
    }

    return false; // Not a recognized card message type
  }
}
