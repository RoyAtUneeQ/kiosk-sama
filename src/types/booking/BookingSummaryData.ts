/**
 * Passenger data structure in booking summary
 */
export interface Passenger {
  passportNumber: string;
  firstName: string;
  lastName: string;
  passengerType: string; // e.g., "ADT" for adult
  gender: string;
  nationality: string;
  passengerId: string;
  dateOfBirth: string; // ISO date format
  title: string;
  passportExpiry: string; // ISO date format
}

/**
 * Booking summary data structure stored in state
 */
export interface BookingSummaryData {
  cabinClass: string;
  passengers: Passenger[];
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

