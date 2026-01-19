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
  return Array.isArray(data) && data.length > 0 && 'fareFamilyType' in data[0];
}

function isBookingSummaryData(data: unknown): data is BookingSummaryData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'cabinClass' in data && 'passengers' in data;
}

export default function MessageCards({ message, cardData, onFlightIdClick, onBoundIdClick }: MessageCardsProps) {
  console.log('[MessageCards] Render called:', {
    messageId: message.id,
    messageSender: message.sender,
    hasCardData: !!cardData,
    cardDataType: cardData ? (Array.isArray(cardData) ? `Array[${cardData.length}]` : 'Object') : 'null'
  });

  if (message.sender !== MessageSender.Assistant || !cardData) {
    console.log('[MessageCards] Early return:', {
      reason: message.sender !== MessageSender.Assistant ? 'Not assistant message' : 'No card data',
      messageId: message.id
    });
    return null;
  }

  let title: string;
  let count: number;
  let itemLabel: string;
  let children: React.ReactNode;

  const isFlights = isFlightsSearchData(cardData);
  const isFares = isFareSelectionData(cardData);
  const isBooking = isBookingSummaryData(cardData);
  
  console.log('[MessageCards] Type guard results:', {
    messageId: message.id,
    isFlights,
    isFares,
    isBooking,
    firstItem: Array.isArray(cardData) && cardData.length > 0 ? Object.keys(cardData[0]) : 'N/A',
    firstItemData: Array.isArray(cardData) && cardData.length > 0 ? cardData[0] : 'N/A'
  });

  if (isFlights) {
    console.log('[MessageCards] Rendering FLIGHT cards');
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
  } else if (isFares) {
    console.log('[MessageCards] Rendering FARE cards:', cardData);
    title = 'Available Fares';
    count = cardData.length;
    itemLabel = 'fare';
    children = cardData.map((fare, index) => {
      console.log(`[MessageCards] Creating FareCard ${index}:`, {
        fareFamilyType: fare.fareFamilyType,
        flightId: fare.flightId,
        boundId: fare.boundId
      });
      return (
        <FareCard
          key={`${fare.fareFamilyType}-${fare.flightId}-${index}`}
          fare={fare}
          onBoundIdClick={onBoundIdClick}
        />
      );
    });
  } else if (isBooking) {
    console.log('[MessageCards] Rendering BOOKING SUMMARY card');
    title = 'Booking Summary';
    count = 1;
    itemLabel = 'booking';
    children = <SummaryCard booking={cardData} />;
  } else {
    console.warn('[MessageCards] No matching card type found! Returning null');
    return null;
  }
  
  console.log('[MessageCards] Rendering container with title:', title);

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
