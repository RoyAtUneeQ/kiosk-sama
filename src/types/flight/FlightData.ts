/**
 * Flight data structure from booking pipeline
 */
export interface FlightData {
  duration: number; // Duration in seconds
  numberOfStops: number;
  minPrice: number;
  departureDateTime: string; // ISO 8601 format
  currency: string;
  arrivalDateTime: string; // ISO 8601 format
  hasQSuite: number; // 0 or 1
  flightNumber: string;
}

