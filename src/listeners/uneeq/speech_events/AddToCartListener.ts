import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { AddToCartData } from "@/types/booking";

interface AddToCartStateData {
  selectedFare: string; // This is actually a boundId
}

export class AddToCartListener implements CustomEventListener {
  type = "add_to_cart";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[AddToCartListener] AddToCart event received');
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.warn('[AddToCartListener] State Manager not available');
        return;
      }

      // Get add_to_cart data from state manager
      const addToCartStateData = await session.state.stateManager.get<AddToCartStateData>('add_to_cart');
      
      if (!addToCartStateData || !addToCartStateData.selectedFare) {
        console.log('[AddToCartListener] No selectedFare found in add_to_cart state');
        session.actions.setAddToCartData(null);
        return;
      }

      const boundId = addToCartStateData.selectedFare;
      console.log('[AddToCartListener] Found selectedFare (boundId):', boundId);

      // Get fare selection data from state to find the selected fare
      const fareSelectionData = session.state.fareSelectionData;

      if (!fareSelectionData || !Array.isArray(fareSelectionData) || fareSelectionData.length === 0) {
        console.log('[AddToCartListener] No fare selection data available in state');
        session.actions.setAddToCartData(null);
        return;
      }

      // Find the fare with matching boundId
      const selectedFare = fareSelectionData.find((fare) => fare.boundId === boundId);

      if (!selectedFare) {
        console.warn('[AddToCartListener] No fare found with boundId:', boundId);
        session.actions.setAddToCartData(null);
        return;
      }

      console.log('[AddToCartListener] Found selected fare:', selectedFare);

      // Get flight data to populate origin, destination, and date/time
      const flightsSearchData = session.state.flightsSearchData;
      if (!flightsSearchData || !Array.isArray(flightsSearchData) || flightsSearchData.length === 0) {
        console.log('[AddToCartListener] No flights search data available');
        session.actions.setAddToCartData(null);
        return;
      }

      const flight = flightsSearchData.find((f) => f.flightId === selectedFare.flightId);
      if (!flight) {
        console.warn('[AddToCartListener] No flight found with flightId:', selectedFare.flightId);
        session.actions.setAddToCartData(null);
        return;
      }

      // Get origin and destination codes
      const origin = flight.origin?.code || '';
      const destination = flight.destination?.code || '';

      // Create AddToCartData from the selected fare and flight
      const addToCartData: AddToCartData = {
        items: [
          {
            flightId: selectedFare.flightId,
            flightNumber: flight.flightNumber || '',
            price: selectedFare.priceTotal,
            currency: selectedFare.priceCurrency,
            fareFamilyType: selectedFare.fareFamilyType,
            origin: origin,
            destination: destination,
            departureDateTime: flight.departureDateTime,
            arrivalDateTime: flight.arrivalDateTime,
          }
        ],
        totalPrice: selectedFare.priceTotal,
        currency: selectedFare.priceCurrency,
      };

      console.log('[AddToCartListener] Created add to cart data:', addToCartData);
      // Set in state
      session.actions.setAddToCartData(addToCartData);

      // Send to remote
      session.actions.sendRemoteMessage({
        type: 'add_to_cart',
        payload: {
          data: addToCartData
        }
      });
    } catch (error) {
      console.error('[AddToCartListener] Error processing add to cart:', error);
      session.actions.setAddToCartData(null);
    }
  }
}
