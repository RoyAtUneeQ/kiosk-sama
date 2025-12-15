/**
 * Fare data structure from booking pipeline
 */
export interface FareData {
  fareFamilyCode: string;
  isPromotionalOffer: number;
  features: string;
  priceCurrency: string;
  mixedCabin: number;
  availableSeats: number;
  priceTotal: number;
  boundId: string;
  flightId: string;
  priceBase: number;
  cabinType: string;
  isLowestFare: number;
}

