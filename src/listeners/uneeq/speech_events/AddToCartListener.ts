import type { SessionContextType } from "@/contexts/SessionContext";
import type { CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { AddToCartData, FareSelectionData, FlightsSearchData } from "@/types/booking";

interface AddToCartStateData {
  selectedOutboundFare: string; // boundId for outbound
  selectedInboundFare?: string; // boundId for inbound (optional, one-way has only outbound)
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

      const addToCartStateData = await session.state.stateManager.get<AddToCartStateData>('add_to_cart');

      if (!addToCartStateData || !addToCartStateData.selectedOutboundFare) {
        console.log('[AddToCartListener] No selectedOutboundFare found in add_to_cart state');
        session.actions.setAddToCartData(null);
        return;
      }

      const { selectedOutboundFare, selectedInboundFare } = addToCartStateData;
      console.log('[AddToCartListener] Selected outbound fare (boundId):', selectedOutboundFare, selectedInboundFare != null ? ', inbound:' + selectedInboundFare : '');

      // Get outbound and inbound fares/flights from state manager (separate states)
      const [faresOutbound, faresInbound, flightsOutbound, flightsInbound] = await Promise.all([
        session.state.stateManager.get<FareSelectionData>('fares_outbound'),
        session.state.stateManager.get<FareSelectionData>('fares_inbound'),
        session.state.stateManager.get<FlightsSearchData>('flights_outbound'),
        session.state.stateManager.get<FlightsSearchData>('flights_inbound'),
      ]);

      if (!Array.isArray(faresOutbound) || faresOutbound.length === 0) {
        console.log('[AddToCartListener] No outbound fare selection data in state');
        session.actions.setAddToCartData(null);
        return;
      }

      if (!Array.isArray(flightsOutbound) || flightsOutbound.length === 0) {
        console.log('[AddToCartListener] No outbound flights data in state');
        session.actions.setAddToCartData(null);
        return;
      }

      const outboundFare = faresOutbound.find((fare) => fare.boundId === selectedOutboundFare);
      if (!outboundFare) {
        console.warn('[AddToCartListener] No outbound fare found with boundId:', selectedOutboundFare);
        session.actions.setAddToCartData(null);
        return;
      }

      const outboundFlight = flightsOutbound.find((f) => f.flightId === outboundFare.flightId);
      if (!outboundFlight) {
        console.warn('[AddToCartListener] No outbound flight found with flightId:', outboundFare.flightId);
        session.actions.setAddToCartData(null);
        return;
      }

      const items: AddToCartData['items'] = [
        {
          flightId: outboundFare.flightId,
          flightNumber: outboundFlight.flightNumber || '',
          price: outboundFare.priceTotal,
          currency: outboundFare.priceCurrency,
          fareFamilyType: outboundFare.fareFamilyType,
          origin: outboundFlight.origin?.code || '',
          destination: outboundFlight.destination?.code || '',
          departureDateTime: outboundFlight.departureDateTime,
          arrivalDateTime: outboundFlight.arrivalDateTime,
        },
      ];

      let totalPrice = outboundFare.priceTotal;
      const currency = outboundFare.priceCurrency;

      if (selectedInboundFare && Array.isArray(faresInbound) && Array.isArray(flightsInbound)) {
        const inboundFare = faresInbound.find((fare) => fare.boundId === selectedInboundFare);
        if (inboundFare) {
          const inboundFlight = flightsInbound.find((f) => f.flightId === inboundFare.flightId);
          if (inboundFlight) {
            items.push({
              flightId: inboundFare.flightId,
              flightNumber: inboundFlight.flightNumber || '',
              price: inboundFare.priceTotal,
              currency: inboundFare.priceCurrency,
              fareFamilyType: inboundFare.fareFamilyType,
              origin: inboundFlight.origin?.code || '',
              destination: inboundFlight.destination?.code || '',
              departureDateTime: inboundFlight.departureDateTime,
              arrivalDateTime: inboundFlight.arrivalDateTime,
            });
            totalPrice += inboundFare.priceTotal;
          }
        }
      }

      const addToCartData: AddToCartData = {
        items,
        totalPrice,
        currency,
      };

      console.log('[AddToCartListener] Created add to cart data:', addToCartData);

      session.actions.setAddToCartData(addToCartData);

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
