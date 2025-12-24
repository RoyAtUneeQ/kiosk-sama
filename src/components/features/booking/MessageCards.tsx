import type { Message } from '@/types/transport/Message';
import { MessageSender } from '@/types';
import type { FlightsSearchData, FareSelectionData, BookingSummaryData } from '@/types/booking';
import FlightCard from '@/components/features/booking/FlightCard/FlightCard';
import FareCard from '@/components/features/booking/FareCard/FareCard';
import SummaryCard from '@/components/features/booking/SummaryCard/SummaryCard';
import './MessageCards.scss';

interface MessageCardsProps {
  message: Message;
  cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | null;
  onFlightIdClick?: (flightId: string) => void;
  onBoundIdClick?: (boundId: string) => void;
}

function isFlightsSearchData(data: unknown): data is FlightsSearchData {
  return Array.isArray(data) && data.length > 0 && 'flightNumber' in data[0];
}

function isFareSelectionData(data: unknown): data is FareSelectionData {
  return Array.isArray(data) && data.length > 0 && 'fareFamilyCode' in data[0];
}

function isBookingSummaryData(data: unknown): data is BookingSummaryData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'cabinClass' in data && 'passengers' in data;
}

export default function MessageCards({ message, cardData, onFlightIdClick, onBoundIdClick }: MessageCardsProps) {
  if (message.sender !== MessageSender.Assistant || !cardData) {
    return null;
  }

  let title: string;
  let count: number;
  let itemLabel: string;
  let children: React.ReactNode;

  if (isFlightsSearchData(cardData)) {
    title = 'Available Flights';
    count = cardData.length;
    itemLabel = 'flight';
    children = cardData.map((flight, index) => (
      <FlightCard
        key={`${flight.flightId}-${index}`}
        flight={flight}
        onFlightIdClick={onFlightIdClick}
      />
    ));
  } else if (isFareSelectionData(cardData)) {
    title = 'Available Fares';
    count = cardData.length;
    itemLabel = 'fare';
    children = cardData.map((fare, index) => (
      <FareCard
        key={`${fare.fareFamilyCode}-${fare.flightId}-${index}`}
        fare={fare}
        onBoundIdClick={onBoundIdClick}
      />
    ));
  } else if (isBookingSummaryData(cardData)) {
    title = 'Booking Summary';
    count = 1;
    itemLabel = 'booking';
    children = <SummaryCard booking={cardData} />;
  } else {
    return null;
  }

  return (
    <div className="message-cards">
      <div className="message-cards__header">
        <h3 className="message-cards__title">{title}</h3>
        <span className="message-cards__count">
          {count} {itemLabel}{count !== 1 ? 's' : ''} found
        </span>
      </div>
      <div className="message-cards__items">
        {children}
      </div>
    </div>
  );
}
