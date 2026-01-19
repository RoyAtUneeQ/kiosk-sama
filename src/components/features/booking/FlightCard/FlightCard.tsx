import { useState } from "react";
import { Card } from "@/components/index";
import type { FlightData } from "@/types/booking";
import "./FlightCard.scss";

interface FlightCardProps {
  flight: FlightData;
  onFlightIdClick?: (flightId: string) => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatTime(dateTimeString: string): string {
  if (!dateTimeString) {
    console.warn('[FlightCard] formatTime: Missing dateTimeString');
    return '--:--';
  }
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    console.warn('[FlightCard] formatTime: Invalid date string:', dateTimeString);
    return '--:--';
  }
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(dateTimeString: string): string {
  if (!dateTimeString) {
    console.warn('[FlightCard] formatDate: Missing dateTimeString');
    return 'Date TBD';
  }
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    console.warn('[FlightCard] formatDate: Invalid date string:', dateTimeString);
    return 'Date TBD';
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function getAirlineCode(flightNumber: string): string {
  return flightNumber.substring(0, 2);
}

function getAirlineName(flightNumber: string): string {
  const code = getAirlineCode(flightNumber);
  const airlines: Record<string, string> = {
    'QR': 'Qatar Airways',
    'BA': 'British Airways',
    'EK': 'Emirates',
    'LH': 'Lufthansa',
    'AF': 'Air France',
  };
  return airlines[code] || `Airline ${code}`;
}

export default function FlightCard({ flight, onFlightIdClick }: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const departureTime = formatTime(flight.departureDateTime);
  const arrivalTime = formatTime(flight.arrivalDateTime);
  const date = formatDate(flight.departureDateTime);
  const duration = formatDuration(flight.duration);
  const airlineName = getAirlineName(flight.flightNumber);
  const airlineCode = getAirlineCode(flight.flightNumber);
  const price = flight.minPrice && flight.currency 
    ? `${flight.currency} ${flight.minPrice}` 
    : 'Price TBD';
  const stopsText = flight.numberOfStops === 0 ? 'Non-stop' : `${flight.numberOfStops} stop${flight.numberOfStops > 1 ? 's' : ''}`;

  const handleCardClick = () => {
    if (onFlightIdClick) {
      console.log('[FlightCard] Sending flight ID:', flight.flightId);
      onFlightIdClick(flight.flightId);
    } else {
      console.warn('[FlightCard] onFlightIdClick callback not provided');
    }
  };

  const collapsedContent = (
    <>
      <div className="flight-count">{stopsText}</div>
      <div className="flight-route-row">
        <div className="route">{flight.flightNumber}</div>
        <div className="price-current">{price}</div>
      </div>
      <div className="flight-time-row">
        <div className="time-date">{departureTime} - {arrivalTime} • {date}</div>
        <div className="duration">{duration}</div>
      </div>
      <div className="airline">Operated by {airlineName}</div>
    </>
  );

  const expandedContent = (
    <>
      <div className="route">{flight.flightNumber}</div>
      <div className="flight-summary">
        <div className="airline-mark">
          <span className="airline-logo">{airlineCode}</span>
        </div>
        <div className="time-details">
          <div className="time-range">{departureTime} - {arrivalTime}</div>
          <div className="duration">{duration}</div>
        </div>
      </div>
      <div className="airline airline-detailed">
        <span className="dot" />
        Operated by {airlineName}
      </div>
    </>
  );

  return (
    <Card>
      <div
        className={`flight-card ${isExpanded ? "flight-card--expanded" : "flight-card--collapsed"}`}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        {isExpanded ? expandedContent : collapsedContent}
        <button
          type="button"
          className="show-more"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
        {isExpanded && (
          <>
            <div className="cutout">
              <div className="left-cut" />
              <div className="line"><div className="dashed-top" /></div>
              <div className="right-cut" />
            </div>
            <div className="expanded-content">
              <div className="total-label">Price</div>
              <div className="price-column">
                <div className="price-current">{price}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
