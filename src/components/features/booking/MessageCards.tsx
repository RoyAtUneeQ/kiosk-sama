import type { FlightsSearchData, FareSelectionData, BookingSummaryData, AddToCartData, PassengerDetailsData, ContactDetailsData } from '@/types/booking';
import FlightCard from '@/components/features/booking/FlightCard/FlightCard';
import FareCard from '@/components/features/booking/FareCard/FareCard';
import SummaryCard from '@/components/features/booking/SummaryCard/SummaryCard';
import AddToCartCard from '@/components/features/booking/AddToCartCard/AddToCartCard';
import PassengerDetailsCard from '@/components/features/booking/PassengerDetailsCard/PassengerDetailsCard';
import ContactDetailsCard from '@/components/features/booking/ContactDetailsCard/ContactDetailsCard';
import './MessageCards.scss';

interface MessageCardsProps {
  cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | AddToCartData | PassengerDetailsData | ContactDetailsData | null;
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

function isAddToCartData(data: unknown): data is AddToCartData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'items' in data && 'totalPrice' in data && 'currency' in data;
}

function isPassengerDetailsData(data: unknown): data is PassengerDetailsData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'passengerId' in data && 'firstName' in data && 'lastName' in data && 'dateOfBirth' in data;
}

function isContactDetailsData(data: unknown): data is ContactDetailsData {
  return typeof data === 'object' && data !== null && !Array.isArray(data) && 'email' in data && 'phoneNumber' in data;
}

export default function MessageCards({ cardData, onFlightIdClick, onBoundIdClick }: MessageCardsProps) {
  let title: string;
  let count: number;
  let itemLabel: string;
  let children: React.ReactNode;

  const isFlights = isFlightsSearchData(cardData);
  const isFares = isFareSelectionData(cardData);
  const isBooking = isBookingSummaryData(cardData);
  const isAddToCart = isAddToCartData(cardData);
  const isPassengerDetails = isPassengerDetailsData(cardData);
  const isContactDetails = isContactDetailsData(cardData);

  if (isFlights) {
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
    title = 'Available Fares';
    count = cardData.length;
    itemLabel = 'fare';
    children = cardData.map((fare, index) => (
      <FareCard
        key={`${fare.fareFamilyType}-${fare.flightId}-${index}`}
        fare={fare}
        onBoundIdClick={onBoundIdClick}
      />
    ));
  } else if (isBooking) {
    title = 'Booking Summary';
    count = 1;
    itemLabel = 'booking';
    children = <SummaryCard booking={cardData} />;
  } else if (isAddToCart) {
    title = 'Cart';
    count = cardData.items.length;
    itemLabel = 'item';
    children = <AddToCartCard cartData={cardData} />;
  } else if (isPassengerDetails) {
    title = 'Passenger Details';
    count = 1;
    itemLabel = 'passenger';
    children = <PassengerDetailsCard passenger={cardData} />;
  } else if (isContactDetails) {
    title = 'Contact Details';
    count = 1;
    itemLabel = 'contact';
    children = <ContactDetailsCard contact={cardData} />;
  } else {
    console.warn('[MessageCards] No matching card type found! Returning null');
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
