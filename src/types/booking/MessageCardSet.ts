import type { FlightData } from './FlightData';
import type { FareData } from './FareData';
import type { BookingSummaryData } from './SummaryData';
import type { AddToCartData } from './AddToCartData';
import type { PassengerDetailsData } from './PassengerDetailsData';
import type { ContactDetailsData } from './ContactDetailsData';

/**
 * Per-message card set: a message can have multiple card types at once
 * (e.g. fare offers and add-to-cart), so they are shown together instead of replacing each other.
 */
export interface MessageCardSet {
  flightsSearch?: FlightData[] | null;
  fareSelection?: FareData[] | null;
  bookingSummary?: BookingSummaryData | null;
  addToCart?: AddToCartData | null;
  passengerDetails?: PassengerDetailsData | null;
  contactDetails?: ContactDetailsData | null;
}
