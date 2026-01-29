import type { SessionContextType } from '@/contexts/SessionContext';
import type { FlightsSearchData, FareSelectionData, AddToCartData, PassengerDetailsData, ContactDetailsData } from '@/types/booking';
import type { BookingSummaryData } from '@/types/booking';

export class PeerCardMessageListener {
  static execute(payload: any, session: SessionContextType): boolean {
    if (!payload.data || !payload.data.type || !payload.data.payload) {
      return false; // Not a card message, let other handlers process it
    }

    // Handle flights search messages (outbound and inbound use same payload structure)
    const flightsSearchTypes = ['flights_search_outbound', 'flights_search_inbound'] as const;
    if (flightsSearchTypes.includes(payload.data.type as (typeof flightsSearchTypes)[number])) {
      const flightsData = payload.data.payload.data;

      console.log(
        `%c📥 ${payload.data.type === 'flights_search_outbound' ? 'OUTBOUND' : 'INBOUND'} FLIGHTS`,
        'background: #0891b2; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        `${flightsData?.length || 0} flights`
      );

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
      const faresData = payload.data.payload.data;

      console.log(
        `%c📥 ${payload.data.type === 'fare_selection_outbound' ? 'OUTBOUND' : 'INBOUND'} FARES`,
        'background: #059669; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        `${faresData?.length || 0} fares`
      );

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
      const bookingData = payload.data.payload.data;

      console.log(
        '%c📥 BOOKING SUMMARY',
        'background: #7c3aed; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );

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
      const cartData = payload.data.payload.data;

      console.log(
        '%c📥 ADD TO CART',
        'background: #ea580c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        `${cartData?.items?.length || 0} items`
      );

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
      const passengerData = payload.data.payload.data;

      console.log(
        '%c📥 PASSENGER DETAILS',
        'background: #db2777; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );

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
      const contactData = payload.data.payload.data;

      console.log(
        '%c📥 CONTACT DETAILS',
        'background: #0284c7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );

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
