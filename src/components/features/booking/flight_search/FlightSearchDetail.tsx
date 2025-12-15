import { useState } from "react";
import { Card } from "@/components/index";
import type { FlightData } from "@/types/flight";
import "./FlightSearchDetail.scss";

interface FlightSearchDetailProps {
  flight: FlightData;
  onFlightNumberClick?: (flightNumber: string) => void;
}

/**
 * Format duration in seconds to "Xh Ym" format
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Format date time string to time only (HH:MM)
 */
function formatTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Format date time string to date (Month Day)
 */
function formatDate(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

/**
 * Extract airline code from flight number (first 2 characters)
 */
function getAirlineCode(flightNumber: string): string {
  return flightNumber.substring(0, 2);
}

/**
 * Get airline name from flight number
 */
function getAirlineName(flightNumber: string): string {
  const code = getAirlineCode(flightNumber);
  // Map common airline codes to names
  const airlines: Record<string, string> = {
    'QR': 'Qatar Airways',
    'BA': 'British Airways',
    'EK': 'Emirates',
    'LH': 'Lufthansa',
    'AF': 'Air France',
  };
  return airlines[code] || `Airline ${code}`;
}

export default function FlightSearchDetail({ flight, onFlightNumberClick }: FlightSearchDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const departureTime = formatTime(flight.departureDateTime);
  const arrivalTime = formatTime(flight.arrivalDateTime);
  const date = formatDate(flight.departureDateTime);
  const duration = formatDuration(flight.duration);
  const airlineName = getAirlineName(flight.flightNumber);
  const airlineCode = getAirlineCode(flight.flightNumber);
  const price = `${flight.currency} ${flight.minPrice}`;
  const stopsText = flight.numberOfStops === 0 ? 'Non-stop' : `${flight.numberOfStops} stop${flight.numberOfStops > 1 ? 's' : ''}`;

  const handleCardClick = () => {
    // Send flight number via WebSocket without adding to chat history
    if (onFlightNumberClick) {
      console.log('[FlightSearchDetail] Sending flight number:', flight.flightNumber);
      onFlightNumberClick(flight.flightNumber);
    } else {
      console.warn('[FlightSearchDetail] onFlightNumberClick callback not provided');
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
        className={`flight-search-detail ${
          isExpanded ? "flight-search-detail--expanded" : "flight-search-detail--collapsed"
        }`}
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