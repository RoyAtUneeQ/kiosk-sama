import type { FlightsSearchData, FareSelectionData, BookingSummaryData, AddToCartData, PassengerDetailsData, ContactDetailsData, GuidedExperienceData, SeatViewerData, MessageCardSet } from '@/types/booking';
import FlightCard from '@/components/features/booking/FlightCard/FlightCard';
import FareCard from '@/components/features/booking/FareCard/FareCard';
import SummaryCard from '@/components/features/booking/SummaryCard/SummaryCard';
import AddToCartCard from '@/components/features/booking/AddToCartCard/AddToCartCard';
import PassengerDetailsCard from '@/components/features/booking/PassengerDetailsCard/PassengerDetailsCard';
import ContactDetailsCard from '@/components/features/booking/ContactDetailsCard/ContactDetailsCard';
import GuidedExperienceCard from '@/components/features/guidedExperience/GuidedExperienceCard/GuidedExperienceCard';
import { toSeatViewerBackgroundUrl } from '@/components/features/guidedExperience/toSeatViewerBackgroundUrl';
import './MessageCards.scss';

interface MessageCardsProps {
  cardData: MessageCardSet | FlightsSearchData | FareSelectionData | BookingSummaryData | AddToCartData | PassengerDetailsData | ContactDetailsData | GuidedExperienceData | SeatViewerData | null;
  onFlightIdClick?: (flightId: string) => void;
  onBoundIdClick?: (boundId: string) => void;
  onGuidedExperienceConfirm?: () => void;
  useSeatViewerBackground?: boolean;
}

function isMessageCardSet(data: unknown): data is MessageCardSet {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    ('fareSelection' in data || 'addToCart' in data || 'flightsSearch' in data || 'bookingSummary' in data || 'passengerDetails' in data || 'contactDetails' in data || 'guidedExperience' in data || 'seatViewer' in data)
  );
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

function isAddToCartData(data: unknown): data is AddToCartData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'items' in data && 'totalPrice' in data && 'currency' in data;
}

function isPassengerDetailsData(data: unknown): data is PassengerDetailsData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'passengerId' in data && 'firstName' in data && 'lastName' in data && 'dateOfBirth' in data;
}

function isContactDetailsData(data: unknown): data is ContactDetailsData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'email' in data && 'phoneNumber' in data;
}

function isGuidedExperienceData(data: unknown): data is GuidedExperienceData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'candidate' in data && 'current' in data;
}

function renderSingleCardBlock(
  cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | AddToCartData | PassengerDetailsData | ContactDetailsData | GuidedExperienceData | SeatViewerData,
  onFlightIdClick?: (flightId: string) => void,
  onBoundIdClick?: (boundId: string) => void,
  onGuidedExperienceConfirm?: () => void,
  useSeatViewerBackground?: boolean
): { title: string; count: number; itemLabel: string; hideHeader?: boolean; children: React.ReactNode } {
  if (isFlightsSearchData(cardData)) {
    return {
      title: 'Available Flights',
      count: cardData.length,
      itemLabel: 'flight',
      children: cardData.map((flight, index) => (
        <FlightCard
          key={`${flight.flightId}-${index}`}
          flight={flight}
          onFlightIdClick={onFlightIdClick}
        />
      )),
    };
  }
  if (isFareSelectionData(cardData)) {
    return {
      title: 'Available Fares',
      count: cardData.length,
      itemLabel: 'fare',
      children: cardData.map((fare, index) => (
        <FareCard
          key={`${fare.fareFamilyType}-${fare.flightId}-${index}`}
          fare={fare}
          onBoundIdClick={onBoundIdClick}
        />
      )),
    };
  }
  if (isBookingSummaryData(cardData)) {
    return {
      title: 'Booking Summary',
      count: 1,
      itemLabel: 'booking',
      children: <SummaryCard booking={cardData} />,
    };
  }
  if (isAddToCartData(cardData)) {
    return {
      title: 'Cart',
      count: cardData.items.length,
      itemLabel: 'item',
      children: <AddToCartCard cartData={cardData} />,
    };
  }
  if (isPassengerDetailsData(cardData)) {
    return {
      title: 'Passenger Details',
      count: 1,
      itemLabel: 'passenger',
      children: <PassengerDetailsCard passenger={cardData} />,
    };
  }
  if (isContactDetailsData(cardData)) {
    return {
      title: 'Contact Details',
      count: 1,
      itemLabel: 'contact',
      children: <ContactDetailsCard contact={cardData} />,
    };
  }
  if (isGuidedExperienceData(cardData)) {
    return {
      title: 'Guided Experience',
      count: 1,
      itemLabel: 'experience',
      hideHeader: true,
      children: (
        <GuidedExperienceCard
          data={cardData}
          onConfirm={onGuidedExperienceConfirm}
          transformImageUrl={useSeatViewerBackground ? toSeatViewerBackgroundUrl : undefined}
        />
      ),
    };
  }
  return { title: '', count: 0, itemLabel: '', children: null };
}

export default function MessageCards({ cardData, onFlightIdClick, onBoundIdClick, onGuidedExperienceConfirm, useSeatViewerBackground }: MessageCardsProps) {
  if (!cardData) return null;

  // Multiple card types per message (e.g. fare offers + add-to-cart)
  if (isMessageCardSet(cardData)) {
    const blocks: React.ReactNode[] = [];
    const order: (keyof MessageCardSet)[] = ['flightsSearch', 'fareSelection', 'addToCart', 'bookingSummary', 'passengerDetails', 'contactDetails', 'guidedExperience', 'seatViewer'];
    for (const key of order) {
      const value = cardData[key];
      if (value == null) continue;
      const block = renderSingleCardBlock(value, onFlightIdClick, onBoundIdClick, onGuidedExperienceConfirm, key === 'seatViewer');
      if (block.children == null) continue;
      blocks.push(
        <div key={key} className="message-cards">
          {!block.hideHeader && (
            <div className="message-cards__header">
              <h3 className="message-cards__title">{block.title}</h3>
              <span className="message-cards__count">
                {block.count} {block.itemLabel}{block.count !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
          <div className="message-cards__items">{block.children}</div>
        </div>
      );
    }
    if (blocks.length === 0) return null;
    return <>{blocks}</>;
  }

  // Legacy: single card type
  const block = renderSingleCardBlock(cardData, onFlightIdClick, onBoundIdClick, onGuidedExperienceConfirm, useSeatViewerBackground);
  if (block.children == null) {
    console.warn('[MessageCards] No matching card type found! Returning null');
    return null;
  }
  return (
    <div className="message-cards">
      {!block.hideHeader && (
        <div className="message-cards__header">
          <h3 className="message-cards__title">{block.title}</h3>
          <span className="message-cards__count">
            {block.count} {block.itemLabel}{block.count !== 1 ? 's' : ''} found
          </span>
        </div>
      )}
      <div className="message-cards__items">
        {block.children}
      </div>
    </div>
  );
}
