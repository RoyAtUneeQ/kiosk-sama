import { Card } from "@/components/index";
import type { ContactDetailsData } from "@/types/booking";
import "./ContactDetailsCard.scss";

interface ContactDetailsCardProps {
  contact: ContactDetailsData;
}

export default function ContactDetailsCard({ contact }: ContactDetailsCardProps) {
  return (
    <Card>
      <div className="contact-details-card">
        <div className="contact-header">
          <div className="contact-title">Contact Details</div>
        </div>
        
        <div className="contact-info-section">
          <div className="info-row">
            <span className="info-value">{contact.email}</span>
          </div>
          <div className="info-row">
            <span className="info-value">{contact.phoneNumber}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
