import type { PassengerData } from './PassengerData';

export interface BookingSummaryData {
  cabinClass: string;
  passengers: PassengerData[];
  adultsCount: number;
  selectedInboundFare: string | null;
  contactEmail: string;
  cartCurrency: string;
  origin: string;
  destination: {
    image: string;
    destinationTitle: string;
  };
  infantsCount: number;
  paymentUrl: string;
  selectedOutbound: string;
  selectedInbound: string | null;
  tripType: string;
  returnDate: string | null;
  fareRulesText: string;
  cartDetails: {
    currencyCode: string;
  };
  departureDate: string;
  contactPhone: string;
  selectedOutboundFare: string;
  childrenCount: number;
  fareFamilyType?: string;
}

