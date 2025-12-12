import type { Message } from '@/types/transport/Message';
import { MessageSender } from '@/types';
import type { FlightsSearchData } from '@/types/flight';
import type { FareSelectionData } from '@/types/fare';
import type { BookingSummaryData } from '@/types/booking';
import FlightCards from '../FlightCards/FlightCards';
import FareCards from '../FareCards/FareCards';
import BookingSummaryCard from '@/components/features/booking/booking_summary/BookingSummaryCard';

/**
 * Props for MessageCards component
 */
interface MessageCardsProps {
  message: Message;
  cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | null;
  onFlightNumberClick?: (flightNumber: string) => void;
  onBoundIdClick?: (boundId: string) => void;
}

/**
 * Type guard to check if cardData is FlightsSearchData
 */
function isFlightsSearchData(cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | null): cardData is FlightsSearchData {
  if (!cardData || !('data' in cardData) || !cardData.data) return false;
  // Check if it's flights data by looking for flight-specific properties
  // FlightsSearchData contains FlightData which has flightNumber
  return Array.isArray(cardData.data) && cardData.data.length > 0 && 'flightNumber' in cardData.data[0];
}

/**
 * Type guard to check if cardData is FareSelectionData
 */
function isFareSelectionData(cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | null): cardData is FareSelectionData {
  if (!cardData || !('data' in cardData) || !cardData.data) return false;
  // Check if it's fare data by looking for fare-specific properties
  // FareSelectionData contains FareData which has fareFamilyCode
  return Array.isArray(cardData.data) && cardData.data.length > 0 && 'fareFamilyCode' in cardData.data[0];
}

/**
 * Type guard to check if cardData is BookingSummaryData
 */
function isBookingSummaryData(cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | null): cardData is BookingSummaryData {
  if (!cardData) return false;
  // Check if it's booking summary data by looking for booking-specific properties
  // BookingSummaryData is a single object (not an array) with cabinClass property
  return typeof cardData === 'object' && 'cabinClass' in cardData && 'passengers' in cardData;
}

/**
 * MessageCards component determines and renders appropriate cards
 * based on the message content and current state.
 * 
 * This component is extensible - add new card types here as needed.
 * 
 * Cards are shown only after assistant messages that trigger them.
 * For example, FlightCards are shown after the assistant's response about available flights.
 * Cards are stored per message ID, so they stay with the message that originally triggered them.
 */
export default function MessageCards({ message, cardData, onFlightNumberClick, onBoundIdClick }: MessageCardsProps) {
  // Only show cards after assistant messages
  if (message.sender !== MessageSender.Assistant) {
    return null;
  }

  // Show FlightCards if cardData is FlightsSearchData
  if (isFlightsSearchData(cardData)) {
    return <FlightCards onFlightNumberClick={onFlightNumberClick} />;
  }

  // Show FareCards if cardData is FareSelectionData
  if (isFareSelectionData(cardData)) {
    return <FareCards onBoundIdClick={onBoundIdClick} />;
  }

  // Show BookingSummaryCard if cardData is BookingSummaryData
  if (isBookingSummaryData(cardData)) {
    return (
      <div className="booking-summary-card-wrapper">
        <BookingSummaryCard booking={cardData} />
      </div>
    );
  }

  // Future: Add other card types here based on message content or state
  // Example:
  // if (isLastAssistantMessage && shouldShowHotelCards(message, state)) {
  //   return <HotelCards />;
  // }

  return null;
}

