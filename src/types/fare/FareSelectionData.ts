import type { FareData } from './FareData';

/**
 * Fare selection data structure stored in state
 */
export interface FareSelectionData {
  data: FareData[];
  metadata?: {
    executionTime?: number;
    apiCalled?: string;
    environment?: string;
    cached?: boolean;
  };
}

