import { Card } from "@/components/index";
import type { PassengerDetailsData } from "@/types/booking";
import "./PassengerDetailsCard.scss";

interface PassengerDetailsCardProps {
  passenger: PassengerDetailsData;
}

function formatDate(dateString: string): string {
  if (!dateString) {
    console.warn('[PassengerDetailsCard] formatDate: Missing dateString');
    return 'Date TBD';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('[PassengerDetailsCard] formatDate: Invalid date string:', dateString);
    return 'Date TBD';
  }
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

/** Lowercases string then capitalizes first letter of each word (e.g. "JOHN DOE" → "John Doe"). */
function toTitleCase(value: string | undefined): string {
  if (value == null || value === '') return '';
  return value
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PassengerDetailsCard({ passenger }: PassengerDetailsCardProps) {
  const dateOfBirth = formatDate(passenger.dateOfBirth);

  return (
    <Card>
      <div className="passenger-details-card">
        <div className="passenger-header">
          <div className="passenger-name">Passenger {passenger.passengerId}</div>
        </div>
        <div className="passenger-info-section">
          <div className="info-row">
            <span className="info-label">Title</span>
            <span className="info-value">{toTitleCase(passenger.title)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Gender</span>
            <span className="info-value">{toTitleCase(passenger.gender)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">First Name</span>
            <span className="info-value">{passenger.firstName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Last Name</span>
            <span className="info-value">{passenger.lastName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date of Birth</span>
            <span className="info-value">{dateOfBirth}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Nationality</span>
            <span className="info-value">{passenger.nationality}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
