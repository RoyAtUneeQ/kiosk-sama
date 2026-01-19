export interface FareData {
  fareFamilyType: string;  // Changed from fareFamilyCode
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
  totalPrice?: {  // Optional - backend sends both formats
    amount: number;
    currency: string;
  };
  appliedDiscount?: {  // Optional discount info
    originalTotalPrice: number;
  };
}

