import type { FlightData } from './FlightData';

/**
 * Flights search data structure stored in state
 */
export interface FlightsSearchData {
  data: FlightData[];
  metadata?: {
    executionTime?: number;
    apiCalled?: string;
    environment?: string;
    cached?: boolean;
  };
}

