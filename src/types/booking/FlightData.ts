export interface FlightData {
  flightId: string;
  duration: number;
  numberOfStops: number;
  minPrice: number;
  departureDateTime: string;
  currency: string;
  arrivalDateTime: string;
  hasQSuite?: number; // Optional - may not be in all API responses
  flightNumber: string;
  // Optional additional fields from new API
  origin?: {
    name: string;
    city: string;
    iataCode: string;
  };
  destination?: {
    name: string;
    city: string;
    iataCode: string;
  };
  segments?: Array<{
    duration: number;
    departure: {
      originCity: string;
      origin: string;
      time: string;
    };
    arrival: {
      destination: string;
      destinationCity: string;
      time: string;
      daysDifference: number;
    };
    airlineName: string;
    airlineLogo?: string;
  }>;
  flightOfferId?: string;
}