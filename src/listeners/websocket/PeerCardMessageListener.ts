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

    // Handle flights search messages
    if (payload.data.type === 'flights_search') {
      // The payload structure is: payload.data.payload.data contains the array of flights
      const flightsData = payload.data.payload.data;
      console.log('[PeerCardMessageListener] Flights search message received, raw data:', flightsData);
      
      if (flightsData && Array.isArray(flightsData) && flightsData.length > 0) {
        // Transform the data to match FlightData interface
        // The API returns 'departure' and 'arrival', but we need 'departureDateTime' and 'arrivalDateTime'
        const flightsSearchData: FlightsSearchData = flightsData.map((flight: any) => {
          const transformed = {
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
          };
          console.log('[PeerCardMessageListener] Transformed flight:', {
            original: flight,
            transformed: transformed
          });
          return transformed;
        });
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
