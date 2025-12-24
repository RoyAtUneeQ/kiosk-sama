import type { PassengerData } from './PassengerData';

export interface BookingSummaryData {
  cabinClass: string;
  passengers: PassengerData[];
  adultsCount: number;
  contactEmail: string;
  cartCurrency: string;
  origin: string;
  destination: string;
  infantsCount: number;
  paymentUrl: string;
  selectedOutbound: string;
  selectedInbound: string | null;
  selectedFare: string;
  cartTotal: number;
  tripType: string;
  returnDate: string | null;
  departureDate: string;
  contactPhone: string;
  childrenCount: number;
}

