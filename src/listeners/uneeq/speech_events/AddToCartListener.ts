import type { SessionContextType } from "@/contexts/SessionContext";
import type { CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { AddToCartData, FareSelectionData, FlightsSearchData } from "@/types/booking";

interface AddToCartStateData {
  selectedOutboundFare: string; // flightId (segment ID) for outbound
  selectedInboundFare: string; // flightId (segment ID) for inbound (empty string for one-way)
}

export class AddToCartListener implements CustomEventListener {
  type = "add_to_cart";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[AddToCartListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.log('[AddToCartListener] ⚠️  State manager not available');
        return;
      }

      console.log('[AddToCartListener] 📊 Fetching from state manager', { key: 'add_to_cart' });
      const addToCartStateData = await session.state.stateManager.get<AddToCartStateData>('add_to_cart');

      if (!addToCartStateData || !addToCartStateData.selectedOutboundFare) {
        console.log('[AddToCartListener] ⚠️  No add_to_cart data or missing selectedOutboundFare');
        session.actions.setAddToCartData(null);
        return;
      }

      const { selectedOutboundFare, selectedInboundFare } = addToCartStateData;
      // Normalize empty string to undefined for easier handling
      const normalizedInboundFare = selectedInboundFare && selectedInboundFare !== '' ? selectedInboundFare : undefined;

      console.log('[AddToCartListener] ✅ Cart selection retrieved', {
        selectedOutboundFare,
        selectedInboundFare: normalizedInboundFare || 'none (one-way)',
      });

      // Get outbound and inbound fares/flights from state manager (separate states)
      console.log('[AddToCartListener] 📊 Fetching fares and flights from state manager', {
        keys: ['fares_outbound', 'fares_inbound', 'flights_outbound', 'flights_inbound']
      });
      const [faresOutbound, faresInbound, flightsOutbound, flightsInbound] = await Promise.all([
        session.state.stateManager.get<FareSelectionData>('fares_outbound'),
        session.state.stateManager.get<FareSelectionData>('fares_inbound'),
        session.state.stateManager.get<FlightsSearchData>('flights_outbound'),
        session.state.stateManager.get<FlightsSearchData>('flights_inbound'),
      ]);

      console.log('[AddToCartListener] ✅ Fares and flights retrieved', {
        faresOutboundCount: Array.isArray(faresOutbound) ? faresOutbound.length : 0,
        faresInboundCount: Array.isArray(faresInbound) ? faresInbound.length : 0,
        flightsOutboundCount: Array.isArray(flightsOutbound) ? flightsOutbound.length : 0,
        flightsInboundCount: Array.isArray(flightsInbound) ? flightsInbound.length : 0,
      });

      if (!Array.isArray(faresOutbound) || faresOutbound.length === 0) {
        console.log('[AddToCartListener] ❌ No outbound fares available');
        session.actions.setAddToCartData(null);
        return;
      }

      if (!Array.isArray(flightsOutbound) || flightsOutbound.length === 0) {
        console.log('[AddToCartListener] ❌ No outbound flights available');
        session.actions.setAddToCartData(null);
        return;
      }

      const outboundFare = faresOutbound.find((fare) => fare.flightId === selectedOutboundFare);
      if (!outboundFare) {
        console.log('[AddToCartListener] ❌ Selected outbound fare not found', {
          selectedOutboundFare,
          availableFareFlightIds: faresOutbound.map(f => f.flightId)
        });
        session.actions.setAddToCartData(null);
        return;
      }

      const outboundFlight = flightsOutbound.find((f) => f.flightId === outboundFare.flightId);
      if (!outboundFlight) {
        console.log('[AddToCartListener] ❌ Outbound flight not found', { flightId: outboundFare.flightId });
        session.actions.setAddToCartData(null);
        return;
      }

      console.log('[AddToCartListener] ✅ Outbound fare and flight matched', {
        flightId: outboundFare.flightId,
        boundId: outboundFare.boundId,
        flightNumber: outboundFlight.flightNumber,
        price: outboundFare.priceTotal,
        departureDateTime: (outboundFlight as any).departure || outboundFlight.departureDateTime,
        arrivalDateTime: (outboundFlight as any).arrival || outboundFlight.arrivalDateTime,
      });

      const items: AddToCartData['items'] = [
        {
          flightId: outboundFare.flightId,
          flightNumber: outboundFlight.flightNumber || '',
          price: outboundFare.priceTotal,
          currency: outboundFare.priceCurrency,
          fareFamilyType: outboundFare.fareFamilyType,
          origin: outboundFlight.origin?.code || '',
          destination: outboundFlight.destination?.code || '',
          departureDateTime: (outboundFlight as any).departure || outboundFlight.departureDateTime || '',
          arrivalDateTime: (outboundFlight as any).arrival || outboundFlight.arrivalDateTime || '',
        },
      ];

      let totalPrice = outboundFare.priceTotal;
      const currency = outboundFare.priceCurrency;

      if (normalizedInboundFare && Array.isArray(faresInbound) && Array.isArray(flightsInbound)) {
        const inboundFare = faresInbound.find((fare) => fare.flightId === normalizedInboundFare);
        if (inboundFare) {
          const inboundFlight = flightsInbound.find((f) => f.flightId === inboundFare.flightId);
          if (inboundFlight) {
            console.log('[AddToCartListener] ✅ Inbound fare and flight matched', {
              flightId: inboundFare.flightId,
              boundId: inboundFare.boundId,
              flightNumber: inboundFlight.flightNumber,
              price: inboundFare.priceTotal,
            });

            items.push({
              flightId: inboundFare.flightId,
              flightNumber: inboundFlight.flightNumber || '',
              price: inboundFare.priceTotal,
              currency: inboundFare.priceCurrency,
              fareFamilyType: inboundFare.fareFamilyType,
              origin: inboundFlight.origin?.code || '',
              destination: inboundFlight.destination?.code || '',
              departureDateTime: (inboundFlight as any).departure || inboundFlight.departureDateTime || '',
              arrivalDateTime: (inboundFlight as any).arrival || inboundFlight.arrivalDateTime || '',
            });
            totalPrice += inboundFare.priceTotal;
          } else {
            console.log('[AddToCartListener] ⚠️  Inbound flight not found (continuing with outbound only)', { flightId: inboundFare.flightId });
          }
        } else {
          console.log('[AddToCartListener] ⚠️  Inbound fare not found (continuing with outbound only)', {
            normalizedInboundFare,
            availableFareFlightIds: faresInbound.map(f => f.flightId)
          });
        }
      }

      const addToCartData: AddToCartData = {
        items,
        totalPrice,
        currency,
      };

      console.log('[AddToCartListener] 🛒 Cart data assembled', {
        itemCount: items.length,
        totalPrice,
        currency,
      });

      session.actions.setAddToCartData(addToCartData);

      session.actions.sendRemoteMessage({
        type: 'add_to_cart',
        payload: {
          data: addToCartData
        }
      });

      console.log('[AddToCartListener] 📤 Remote message sent', { type: 'add_to_cart', itemCount: items.length });
    } catch (error) {
      console.error('[AddToCartListener] ❌ Error processing add to cart:', error);
      session.actions.setAddToCartData(null);
    }
  }
}
