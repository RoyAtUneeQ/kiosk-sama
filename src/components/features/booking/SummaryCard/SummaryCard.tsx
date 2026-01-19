import { useState } from "react";
import { Card } from "@/components/index";
import type { BookingSummaryData } from "@/types/booking";
import "./SummaryCard.scss";

interface SummaryCardProps {
  booking: BookingSummaryData;
}

function formatDate(dateString: string): string {
  if (!dateString) {
    console.warn('[SummaryCard] formatDate: Missing dateString');
    return 'Date TBD';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('[SummaryCard] formatDate: Invalid date string:', dateString);
    return 'Date TBD';
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatPrice(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

function formatCabinClass(cabinClass: string): string {
  return cabinClass.charAt(0) + cabinClass.slice(1).toLowerCase();
}

function formatTripType(tripType: string): string {
  return tripType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function SummaryCard({ booking }: SummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const departureDate = formatDate(booking.departureDate);
  const returnDate = booking.returnDate ? formatDate(booking.returnDate) : null;
  const totalPrice = formatPrice(booking.cartTotal, booking.cartCurrency);
  const cabinClass = formatCabinClass(booking.cabinClass);
  const tripType = formatTripType(booking.tripType);

  const handlePaymentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.paymentUrl) {
      window.open(booking.paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const collapsedContent = (
    <>
      <div className="summary-header">
        <div className="summary-title">Booking Summary</div>
        <div className="summary-price">{totalPrice}</div>
      </div>
      <div className="summary-route">
        <div className="route-cities">
          <span className="origin">{booking.origin}</span>
          <span className="arrow">→</span>
          <span className="destination">{booking.destination}</span>
        </div>
        <div className="route-type">{tripType}</div>
      </div>
      <div className="summary-dates">
        <div className="date-item">
          <span className="date-label">Departure:</span>
          <span className="date-value">{departureDate}</span>
        </div>
        {returnDate && (
          <div className="date-item">
            <span className="date-label">Return:</span>
            <span className="date-value">{returnDate}</span>
          </div>
        )}
      </div>
      <div className="summary-info-row">
        <span className="cabin-class">{cabinClass}</span>
        <span className="passengers-count">
          {booking.adultsCount} adult{booking.adultsCount !== 1 ? 's' : ''}
          {booking.childrenCount > 0 && `, ${booking.childrenCount} child${booking.childrenCount !== 1 ? 'ren' : ''}`}
          {booking.infantsCount > 0 && `, ${booking.infantsCount} infant${booking.infantsCount !== 1 ? 's' : ''}`}
        </span>
      </div>
    </>
  );

  const expandedContent = (
    <>
      <div className="summary-header">
        <div className="summary-title">Booking Summary</div>
        <div className="summary-price">{totalPrice}</div>
      </div>
      <div className="summary-section">
        <div className="section-title">Trip Details</div>
        <div className="summary-route">
          <div className="route-cities">
            <span className="origin">{booking.origin}</span>
            <span className="arrow">→</span>
            <span className="destination">{booking.destination}</span>
          </div>
          <div className="route-type">{tripType}</div>
        </div>
        <div className="summary-dates">
          <div className="date-item">
            <span className="date-label">Departure:</span>
            <span className="date-value">{departureDate}</span>
          </div>
          {returnDate && (
            <div className="date-item">
              <span className="date-label">Return:</span>
              <span className="date-value">{returnDate}</span>
            </div>
          )}
        </div>
      </div>
      <div className="summary-section">
        <div className="section-title">Passengers</div>
        <div className="passengers-list">
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="passenger-item">
              <div className="passenger-name">
                {passenger.title} {passenger.firstName} {passenger.lastName}
              </div>
              <div className="passenger-details">
                {passenger.passengerType} • {passenger.nationality}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="summary-section">
        <div className="section-title">Contact Information</div>
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <span className="contact-value">{booking.contactEmail}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Phone:</span>
            <span className="contact-value">{booking.contactPhone}</span>
          </div>
        </div>
      </div>
      <div className="summary-section">
        <div className="section-title">Booking Details</div>
        <div className="booking-details">
          <div className="detail-item">
            <span className="detail-label">Cabin Class:</span>
            <span className="detail-value">{cabinClass}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Selected Fare:</span>
            <span className="detail-value">{booking.selectedFare}</span>
          </div>
          {booking.selectedOutbound && (
            <div className="detail-item">
              <span className="detail-label">Outbound Flight:</span>
              <span className="detail-value">{booking.selectedOutbound}</span>
            </div>
          )}
          {booking.selectedInbound && (
            <div className="detail-item">
              <span className="detail-label">Inbound Flight:</span>
              <span className="detail-value">{booking.selectedInbound}</span>
            </div>
          )}
        </div>
      </div>
      {booking.paymentUrl && (
        <div className="summary-actions">
          <button
            type="button"
            className="payment-button"
            onClick={handlePaymentClick}
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </>
  );

  return (
    <Card>
      <div
        className={`summary-card ${isExpanded ? "summary-card--expanded" : "summary-card--collapsed"}`}
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
      </div>
    </Card>
  );
}
