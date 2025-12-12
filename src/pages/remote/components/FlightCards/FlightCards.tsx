import { useSession } from '@/contexts';
import FlightSearchDetail from '@/components/features/booking/flight_search/FlightSearchDetail';
import './FlightCards.scss';

interface FlightCardsProps {
  onFlightNumberClick?: (flightNumber: string) => void;
}

/**
 * FlightCards component displays flight search results as cards
 * on the Remote page when booking data is available.
 */
export default function FlightCards({ onFlightNumberClick }: FlightCardsProps) {
  const { state } = useSession();

  // Don't render if no flights search data
  if (!state.flightsSearchData || !state.flightsSearchData.data || state.flightsSearchData.data.length === 0) {
    return null;
  }

  const flights = state.flightsSearchData.data;

  return (
    <div className="flight-cards-container">
      <div className="flight-cards-header">
        <h3 className="flight-cards-title">Available Flights</h3>
        <span className="flight-cards-count">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</span>
      </div>
      <div className="flight-cards-list">
        {flights.map((flight, index) => (
          <FlightSearchDetail 
            key={`${flight.flightNumber}-${index}`} 
            flight={flight}
            onFlightNumberClick={onFlightNumberClick}
          />
        ))}
      </div>
    </div>
  );
}

