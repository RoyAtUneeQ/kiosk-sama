export type { BookingSummaryData } from './SummaryData';
export type { PassengerData } from './PassengerData';
export type { FlightData } from './FlightData';
export type { FareData } from './FareData';
export type { AddToCartData } from './AddToCartData';
export type { PassengerDetailsData } from './PassengerDetailsData';
export type { ContactDetailsData } from './ContactDetailsData';
export type { MessageCardSet } from './MessageCardSet';
export type { GuidedExperienceData, GuidedExperienceScene } from './GuidedExperienceData';
export type { SeatViewerData } from './SeatViewerData';

// Import types for array type aliases
import type { FlightData } from './FlightData';
import type { FareData } from './FareData';

// Array type aliases for collections
export type FlightsSearchData = FlightData[];
export type FareSelectionData = FareData[];
