import { useSession } from '@/contexts';
import FlightSearchDetail from '@/components/features/booking/flight_search/FlightSearchDetail';
import './FlightCards.scss';

/**
 * FlightCards component displays flight search results as cards
 * on the Remote page when booking data is available.
 */
export default function FlightCards() {
  const { state } = useSession();

  // Don't render if no booking data
  if (!state.bookingData || !state.bookingData.data || state.bookingData.data.length === 0) {
    return null;
  }

  const flights = state.bookingData.data;

  return (
    <div className="flight-cards-container">
      <div className="flight-cards-header">
        <h3 className="flight-cards-title">Available Flights</h3>
        <span className="flight-cards-count">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</span>
      </div>
      <div className="flight-cards-list">
        {flights.map((flight, index) => (
          <FlightSearchDetail key={`${flight.flightNumber}-${index}`} flight={flight} />
        ))}
      </div>
    </div>
  );
}

