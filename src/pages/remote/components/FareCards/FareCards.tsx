import { useSession } from '@/contexts';
import FareOfferDetails from '@/components/features/booking/fare_offer/FareOfferDetails';
import './FareCards.scss';

interface FareCardsProps {
  onBoundIdClick?: (boundId: string) => void;
}

/**
 * FareCards component displays fare selection results as cards
 * on the Remote page when fare selection data is available.
 */
export default function FareCards({ onBoundIdClick }: FareCardsProps) {
  const { state } = useSession();

  // Don't render if no fare selection data
  if (!state.fareSelectionData || !state.fareSelectionData.data || state.fareSelectionData.data.length === 0) {
    return null;
  }

  const fares = state.fareSelectionData.data;

  return (
    <div className="fare-cards-container">
      <div className="fare-cards-header">
        <h3 className="fare-cards-title">Available Fares</h3>
        <span className="fare-cards-count">{fares.length} fare{fares.length !== 1 ? 's' : ''} found</span>
      </div>
      <div className="fare-cards-list">
        {fares.map((fare, index) => (
          <FareOfferDetails 
            key={`${fare.fareFamilyCode}-${fare.flightId}-${index}`} 
            fare={fare}
            onBoundIdClick={onBoundIdClick}
          />
        ))}
      </div>
    </div>
  );
}

